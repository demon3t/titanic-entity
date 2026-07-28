import { Titanic, type TitanicCurrentUser } from "@titanic-entity/entity-base";
import { EntityApiOperationType } from "../enums/EntityApiOperationType";
import { EntityApiError } from "../errors/EntityApiError";
import type { ApiBatchRequest } from "../models/ApiBatchRequest";
import type { ApiBatchResponse } from "../models/ApiBatchResponse";
import type {
  ApiClientOptions,
  EntityCurrentUserResult
} from "../models/ApiClientOptions";
import type { ApiDeleteResult } from "../models/ApiDeleteResult";
import type { ApiEntity } from "../models/ApiEntity";
import type { ApiManagerStructureResponse } from "../models/ApiManagerStructureResponse";
import type { ApiRequest } from "../models/ApiRequest";
import type { EntityQueryRequest } from "../models/EntityQueryRequest";
import {
  entityQuery,
  toEntityQueryJson,
  type EntityQueryInput,
  type EntityQueryFilter,
  type EntityQueryFilterCollection,
  type EntityQueryOrder
} from "@titanic-entity/entity-core";

/** HTTP client for interacting with the Entity API manager endpoint. */
export class EntityApiClient {
  protected readonly baseUrl: string;
  protected readonly apiPath: string;
  protected readonly getHeaders?: ApiClientOptions["getHeaders"];
  protected readonly getCurrentUserProvider?: ApiClientOptions["getCurrentUser"];
  protected readonly fetchImpl: typeof fetch;

  /**
   * Creates a new Entity API client.
   *
   * @param options Client configuration options.
   */
  constructor(options: ApiClientOptions) {
    if (!options.apiPath?.trim()) {
      throw new Error("EntityApiClient requires apiPath.");
    }

    this.baseUrl = options.baseUrl?.replace(/\/$/, "") ?? "";
    this.apiPath = options.apiPath.startsWith("/") ? options.apiPath : `/${options.apiPath}`;
    this.getHeaders = options.getHeaders;
    this.getCurrentUserProvider = options.getCurrentUser;
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis);
  }

  /**
   * Executes a raw manager request payload.
   *
   * @param request Request payload sent to the manager endpoint.
   */
  async execute<T = unknown>(request: ApiRequest): Promise<T> {
    return this.request<T>("", request);
  }

  /**
   * Executes a batch of manager requests.
   *
   * @param request Batch request payload.
   */
  async batch(request: ApiBatchRequest): Promise<ApiBatchResponse> {
    return this.request<ApiBatchResponse>("/batch", request);
  }

  /** Loads entity metadata exposed by the backend manager. */
  async getStructure(): Promise<ApiManagerStructureResponse> {
    const headers = await this.resolveHeaders();
    const response = await this.fetchImpl(this.createUrl("/structure"), {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...headers
      }
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = this.getErrorMessage(payload, response.status);
      throw new EntityApiError(message, response.status, payload);
    }

    return payload as ApiManagerStructureResponse;
  }

  /**
   * Resolves current-user information and stores it on Titanic.CurrentUser.
   */
  async getCurrentUser<TCurrentUser extends TitanicCurrentUser = TitanicCurrentUser>(): Promise<EntityCurrentUserResult<TCurrentUser>> {
    if (!this.getCurrentUserProvider) {
      return Titanic.CurrentUser as EntityCurrentUserResult<TCurrentUser>;
    }

    const currentUser = await this.getCurrentUserProvider() as EntityCurrentUserResult<TCurrentUser>;
    return Titanic.setCurrentUser(currentUser);
  }

  /**
   * Executes a select query and returns Entity API rows.
   *
   * @param query EntityQuery payload or fluent builder.
   */
  async select(query: EntityQueryInput): Promise<ApiEntity[]> {
    return this.execute<ApiEntity[]>({
      operation: EntityApiOperationType.Select,
      query: toEntityQueryJson(query)
    });
  }

  /**
   * Builds and executes an entity query request from a high-level model.
   *
   * @param request Shorthand entity query request.
   */
  async queryEntityRows({
    tableName,
    columns,
    filters = [],
    orders,
    rowCount,
    allColumns,
    query
  }: EntityQueryRequest): Promise<ApiEntity[]> {
    return this.select(query ?? entityQuery(tableName)
      .allColumns(allColumns ?? !columns?.length)
      .columns(...(columns ?? []))
      .take(rowCount)
      .filters(filters)
      .orders(...(orders ?? [])));
  }

  /**
   * Selects rows by table name with lightweight filter and order arguments.
   *
   * @param tableName Root table name.
   * @param filters Flat list of filters.
   * @param orders Sort expressions.
   * @param rowCount Maximum number of rows to return.
   * @param columns Explicit list of selected columns.
   */
  async selectRows(
    tableName: string,
    filters: EntityQueryFilter[] = [],
    orders?: EntityQueryOrder[],
    rowCount?: number,
    columns?: string[]
  ): Promise<ApiEntity[]> {
    return this.queryEntityRows({ tableName, filters, orders, rowCount, columns });
  }

  /**
   * Creates or updates an entity row.
   *
   * @param tableName Target table name.
   * @param values Column values to persist.
   */
  async save(tableName: string, values: Record<string, unknown>): Promise<ApiEntity> {
    return this.execute<ApiEntity>({
      operation: EntityApiOperationType.Save,
      tableName,
      values
    });
  }

  /**
   * Deletes entities by equality payload or explicit EntityQuery filter collection.
   *
   * @param tableName Target table name.
   * @param filter Equality payload or filter collection.
   */
  async delete(tableName: string, filter: Record<string, unknown> | EntityQueryFilterCollection): Promise<ApiDeleteResult> {
    const isFilterCollection = isEntityQueryFilterCollection(filter);
    return this.execute<ApiDeleteResult>({
      operation: EntityApiOperationType.Delete,
      tableName,
      values: isFilterCollection ? undefined : filter,
      query: isFilterCollection
        ? {
            tableName,
            filters: filter
          }
        : undefined
    });
  }

  /**
   * Deletes a single entity by its identifier.
   *
   * @param tableName Target table name.
   * @param id Entity identifier.
   * @param primaryColumn Primary key column name.
   */
  async deleteById(tableName: string, id: unknown, primaryColumn = "Id"): Promise<ApiDeleteResult> {
    return this.delete(tableName, { [primaryColumn]: id });
  }

  /**
   * Loads a single entity row by its identifier.
   *
   * @param tableName Target table name.
   * @param id Entity identifier.
   * @param columns Explicit list of selected columns.
   * @param primaryColumn Primary key column name.
   */
  async loadById(tableName: string, id: unknown, columns: string[] = ["*"], primaryColumn = "Id"): Promise<ApiEntity | null> {
    const rows = await this.select(entityQuery(tableName)
      .columns(...columns)
      .where(primaryColumn, id)
      .take(1));

    return rows[0] ?? null;
  }

  /**
   * Executes a POST request against the manager endpoint.
   *
   * @param path Relative endpoint path.
   * @param body Request payload.
   */
  protected async request<T>(path: string, body: unknown): Promise<T> {
    const headers = await this.resolveHeaders();
    const response = await this.fetchImpl(this.createUrl(path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers
      },
      body: JSON.stringify(body)
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = this.getErrorMessage(payload, response.status);
      throw new EntityApiError(message, response.status, payload);
    }

    return payload as T;
  }

  /**
   * Resolves an absolute URL for an Entity API endpoint path.
   *
   * @param path Relative endpoint path.
   */
  protected createUrl(path: string): string {
    return `${this.baseUrl}${this.apiPath}${path}`;
  }

  private async resolveHeaders(): Promise<Record<string, string>> {
    return this.getHeaders ? await this.getHeaders() : {};
  }

  private getErrorMessage(payload: unknown, status: number): string {
    if (payload && typeof payload === "object" && "error" in payload) {
      return String((payload as { error?: unknown }).error ?? `Entity API request failed with ${status}`);
    }

    return `Entity API request failed with ${status}`;
  }
}

function isEntityQueryFilterCollection(filter: Record<string, unknown> | EntityQueryFilterCollection): filter is EntityQueryFilterCollection {
  return "items" in filter || "logicalOperation" in filter || "isEnabled" in filter;
}
