import { EntityApiOperationType } from "../enums/EntityApiOperationType";
import { EntityApiError } from "../errors/EntityApiError";
import type { EntityApiBatchRequest } from "../models/EntityApiBatchRequest";
import type { EntityApiBatchResponse } from "../models/EntityApiBatchResponse";
import type { EntityApiClientOptions } from "../models/EntityApiClientOptions";
import type { EntityApiDeleteResult } from "../models/EntityApiDeleteResult";
import type { EntityApiEntity } from "../models/EntityApiEntity";
import type { EntityApiManagerStructureResponse } from "../models/EntityApiManagerStructureResponse";
import type { EntityApiRequest } from "../models/EntityApiRequest";
import type { EntitySelectRequest } from "../models/EntitySelectRequest";
import type { ESQFilterCollectionJsonModel } from "../models/ESQFilterCollectionJsonModel";
import type { ESQFilterJsonModel } from "../models/ESQFilterJsonModel";
import type { ESQOrderJsonModel } from "../models/ESQOrderJsonModel";
import { entityQuery, toEntityQueryJson, type EntityQueryInput } from "../query";

export class EntityApiClient {
  protected readonly baseUrl: string;
  protected readonly apiPath: string;
  protected readonly getHeaders?: EntityApiClientOptions["getHeaders"];
  protected readonly fetchImpl: typeof fetch;

  constructor(options: EntityApiClientOptions) {
    if (!options.apiPath?.trim()) {
      throw new Error("EntityApiClient requires apiPath.");
    }

    this.baseUrl = options.baseUrl?.replace(/\/$/, "") ?? "";
    this.apiPath = options.apiPath.startsWith("/") ? options.apiPath : `/${options.apiPath}`;
    this.getHeaders = options.getHeaders;
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis);
  }

  async execute<T = unknown>(request: EntityApiRequest): Promise<T> {
    return this.request<T>("", request);
  }

  async batch(request: EntityApiBatchRequest): Promise<EntityApiBatchResponse> {
    return this.request<EntityApiBatchResponse>("/batch", request);
  }

  async getStructure(): Promise<EntityApiManagerStructureResponse> {
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

    return payload as EntityApiManagerStructureResponse;
  }

  async select(query: EntityQueryInput): Promise<EntityApiEntity[]> {
    return this.execute<EntityApiEntity[]>({
      operation: EntityApiOperationType.Select,
      query: toEntityQueryJson(query)
    });
  }

  async selectEntityRows({ tableName, columns, filters = [], orders, rowCount, allColumns, query }: EntitySelectRequest): Promise<EntityApiEntity[]> {
    return this.select(query ?? entityQuery(tableName)
      .allColumns(allColumns ?? !columns?.length)
      .columns(...(columns ?? []))
      .take(rowCount)
      .filters(filters)
      .orders(...(orders ?? [])));
  }

  async selectRows(
    tableName: string,
    filters: ESQFilterJsonModel[] = [],
    orders?: ESQOrderJsonModel[],
    rowCount?: number,
    columns?: string[]
  ): Promise<EntityApiEntity[]> {
    return this.selectEntityRows({ tableName, filters, orders, rowCount, columns });
  }

  async save(tableName: string, values: Record<string, unknown>): Promise<EntityApiEntity> {
    return this.execute<EntityApiEntity>({
      operation: EntityApiOperationType.Save,
      tableName,
      values
    });
  }

  async delete(tableName: string, filter: Record<string, unknown> | ESQFilterCollectionJsonModel): Promise<EntityApiDeleteResult> {
    const isFilterCollection = isESQFilterCollection(filter);
    return this.execute<EntityApiDeleteResult>({
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

  async deleteById(tableName: string, id: unknown, primaryColumn = "Id"): Promise<EntityApiDeleteResult> {
    return this.delete(tableName, { [primaryColumn]: id });
  }

  async loadById(tableName: string, id: unknown, columns: string[] = ["*"], primaryColumn = "Id"): Promise<EntityApiEntity | null> {
    const rows = await this.select(entityQuery(tableName)
      .columns(...columns)
      .where(primaryColumn, id)
      .take(1));

    return rows[0] ?? null;
  }

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

function isESQFilterCollection(filter: Record<string, unknown> | ESQFilterCollectionJsonModel): filter is ESQFilterCollectionJsonModel {
  return "items" in filter || "logicalOperation" in filter || "isEnabled" in filter;
}
