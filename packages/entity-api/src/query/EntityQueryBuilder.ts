// Модуль сборки запросов Entity ORM API через цепочку методов.
import { ConditionOperator } from "../enums/ConditionOperator";
import { EntityLogicalOperation } from "../enums/EntityLogicalOperation";
import { EntityOrderDirection } from "../enums/EntityOrderDirection";
import type { EntityAggregationType } from "../enums/EntityAggregationType";
import type { ESQColumnJsonModel } from "../models/ESQColumnJsonModel";
import type { ESQFilterCollectionJsonModel } from "../models/ESQFilterCollectionJsonModel";
import type { ESQFilterJsonModel } from "../models/ESQFilterJsonModel";
import type { ESQJsonModel } from "../models/ESQJsonModel";
import type { ESQOrderJsonModel } from "../models/ESQOrderJsonModel";

export type EntityQuerySource = string | Pick<ESQJsonModel, "tableName" | "entityTypeName">;
export type EntityQueryColumnInput = string | ESQColumnJsonModel;
export type EntityQueryOrderInput = string | ESQOrderJsonModel;
export type EntityQueryFilterInput =
  | ESQFilterJsonModel
  | EntityFilterBuilder
  | ((builder: EntityFilterBuilder) => EntityFilterBuilder | void);

export interface EntityQueryJsonProvider {
  toJson(): ESQJsonModel;
}

export type EntityQueryInput = ESQJsonModel | EntityQueryJsonProvider;

export function entityQuery(source?: EntityQuerySource): EntityQueryBuilder {
  return new EntityQueryBuilder(source);
}

export function entityFilters(
  logicalOperation: EntityLogicalOperation = EntityLogicalOperation.And
): EntityFilterBuilder {
  return new EntityFilterBuilder(logicalOperation);
}

export function toEntityQueryJson(query: EntityQueryInput): ESQJsonModel {
  return isEntityQueryJsonProvider(query) ? query.toJson() : query;
}

export function isEntityQueryJsonProvider(value: EntityQueryInput): value is EntityQueryJsonProvider {
  return typeof value === "object" && value !== null && "toJson" in value && typeof value.toJson === "function";
}

export class EntityQueryBuilder implements EntityQueryJsonProvider {
  private readonly query: ESQJsonModel = {};
  private filterCollection: ESQFilterCollectionJsonModel | undefined;

  constructor(source?: EntityQuerySource) {
    if (source !== undefined) {
      this.from(source);
    }
  }

  from(source: EntityQuerySource): this {
    return typeof source === "string"
      ? this.table(source)
      : this.source(source);
  }

  table(tableName: string | null | undefined): this {
    this.query.tableName = tableName;
    return this;
  }

  entityType(entityTypeName: string | null | undefined): this {
    this.query.entityTypeName = entityTypeName;
    return this;
  }

  source(source: Pick<ESQJsonModel, "tableName" | "entityTypeName">): this {
    this.query.tableName = source.tableName;
    this.query.entityTypeName = source.entityTypeName;
    return this;
  }

  select(...columns: EntityQueryColumnInput[]): this {
    return this.columns(...columns);
  }

  columns(...columns: EntityQueryColumnInput[]): this {
    this.query.columns = normalizeColumns(columns);
    return this;
  }

  addColumn(path: string, alias?: string | null, aggregationType?: EntityAggregationType): this {
    this.query.columns = [
      ...(this.query.columns ?? []),
      { path, alias, aggregationType }
    ];
    return this;
  }

  allColumns(enabled = true): this {
    this.query.allColumns = enabled;
    return this;
  }

  distinct(enabled = true): this {
    this.query.isDistinct = enabled;
    return this;
  }

  take(rowCount: number | null | undefined): this {
    this.query.rowCount = rowCount;
    return this;
  }

  limit(rowCount: number | null | undefined): this {
    return this.take(rowCount);
  }

  skip(rowCount: number | null | undefined): this {
    this.query.skipRow = rowCount;
    return this;
  }

  groupBy(...paths: string[]): this {
    this.query.groupBy = paths;
    return this;
  }

  orderBy(path: string, direction: EntityOrderDirection = EntityOrderDirection.Ascending): this {
    this.query.orders = [
      ...(this.query.orders ?? []),
      { path, direction }
    ];
    return this;
  }

  orderByDesc(path: string): this {
    return this.orderBy(path, EntityOrderDirection.Descending);
  }

  orders(...orders: EntityQueryOrderInput[]): this {
    this.query.orders = normalizeOrders(orders);
    return this;
  }

  where(path: string, value: unknown): this;
  where(path: string, comparisonType: ConditionOperator, value?: unknown, secondValue?: unknown): this;
  where(filter: EntityQueryFilterInput): this;
  where(
    pathOrFilter: string | EntityQueryFilterInput,
    comparisonOrValue?: ConditionOperator | unknown,
    value?: unknown,
    secondValue?: unknown
  ): this {
    if (typeof pathOrFilter !== "string") {
      return this.filter(pathOrFilter);
    }

    const hasExplicitComparison = arguments.length >= 3;
    const comparisonType = !hasExplicitComparison
      ? ConditionOperator.Equal
      : comparisonOrValue as ConditionOperator;
    const filterValue = !hasExplicitComparison
      ? comparisonOrValue
      : value;

    return this.filter(createFilter(pathOrFilter, comparisonType, filterValue, secondValue));
  }

  filter(...filters: EntityQueryFilterInput[]): this {
    for (const filter of filters) {
      this.addFilter(resolveFilterInput(filter));
    }
    return this;
  }

  filters(filters: ESQFilterCollectionJsonModel | ESQFilterJsonModel[] | undefined): this {
    this.filterCollection = Array.isArray(filters)
      ? { items: filters }
      : filters;
    return this;
  }

  and(...filters: EntityQueryFilterInput[]): this {
    return this.filter(createGroupFilter(EntityLogicalOperation.And, filters));
  }

  or(...filters: EntityQueryFilterInput[]): this {
    return this.filter(createGroupFilter(EntityLogicalOperation.Or, filters));
  }

  equal(path: string, value: unknown): this {
    return this.where(path, value);
  }

  notEqual(path: string, value: unknown): this {
    return this.where(path, ConditionOperator.NotEqual, value);
  }

  greaterThan(path: string, value: unknown): this {
    return this.where(path, ConditionOperator.GreaterThan, value);
  }

  greaterThanOrEqual(path: string, value: unknown): this {
    return this.where(path, ConditionOperator.GreaterThanOrEqual, value);
  }

  lessThan(path: string, value: unknown): this {
    return this.where(path, ConditionOperator.LessThan, value);
  }

  lessThanOrEqual(path: string, value: unknown): this {
    return this.where(path, ConditionOperator.LessThanOrEqual, value);
  }

  in(path: string, values: readonly unknown[]): this {
    return this.where(path, ConditionOperator.In, values);
  }

  notIn(path: string, values: readonly unknown[]): this {
    return this.where(path, ConditionOperator.NotIn, values);
  }

  contains(path: string, value: unknown): this {
    return this.where(path, ConditionOperator.Contains, value);
  }

  isNull(path: string): this {
    return this.where(path, ConditionOperator.IsNull, undefined);
  }

  isNotNull(path: string): this {
    return this.where(path, ConditionOperator.IsNotNull, undefined);
  }

  toJson(): ESQJsonModel {
    return {
      ...this.query,
      columns: this.query.columns ? [...this.query.columns] : this.query.columns,
      groupBy: this.query.groupBy ? [...this.query.groupBy] : this.query.groupBy,
      orders: this.query.orders ? [...this.query.orders] : this.query.orders,
      filters: cloneFilterCollection(this.filterCollection)
    };
  }

  async execute<T = unknown>(client: { select(query: EntityQueryInput): Promise<T> }): Promise<T> {
    return client.select(this);
  }

  private addFilter(filter: ESQFilterJsonModel | undefined): void {
    if (!filter) {
      return;
    }

    this.filterCollection ??= { items: [] };
    this.filterCollection.items = [...(this.filterCollection.items ?? []), filter];
  }
}

export class EntityFilterBuilder {
  private readonly filters: ESQFilterJsonModel[] = [];

  constructor(private readonly logicalOperation: EntityLogicalOperation = EntityLogicalOperation.And) {}

  where(path: string, value: unknown): this;
  where(path: string, comparisonType: ConditionOperator, value?: unknown, secondValue?: unknown): this;
  where(
    path: string,
    comparisonOrValue: ConditionOperator | unknown,
    value?: unknown,
    secondValue?: unknown
  ): this {
    const hasExplicitComparison = arguments.length >= 3;
    const comparisonType = !hasExplicitComparison
      ? ConditionOperator.Equal
      : comparisonOrValue as ConditionOperator;
    const filterValue = !hasExplicitComparison
      ? comparisonOrValue
      : value;

    this.filters.push(createFilter(path, comparisonType, filterValue, secondValue));
    return this;
  }

  filter(...filters: EntityQueryFilterInput[]): this {
    this.filters.push(...filters.map(resolveFilterInput).filter((filter): filter is ESQFilterJsonModel => Boolean(filter)));
    return this;
  }

  and(...filters: EntityQueryFilterInput[]): this {
    return this.filter(createGroupFilter(EntityLogicalOperation.And, filters));
  }

  or(...filters: EntityQueryFilterInput[]): this {
    return this.filter(createGroupFilter(EntityLogicalOperation.Or, filters));
  }

  equal(path: string, value: unknown): this {
    return this.where(path, value);
  }

  notEqual(path: string, value: unknown): this {
    return this.where(path, ConditionOperator.NotEqual, value);
  }

  in(path: string, values: readonly unknown[]): this {
    return this.where(path, ConditionOperator.In, values);
  }

  contains(path: string, value: unknown): this {
    return this.where(path, ConditionOperator.Contains, value);
  }

  isNull(path: string): this {
    return this.where(path, ConditionOperator.IsNull, undefined);
  }

  isNotNull(path: string): this {
    return this.where(path, ConditionOperator.IsNotNull, undefined);
  }

  toFilter(): ESQFilterJsonModel {
    return {
      logicalOperation: this.logicalOperation,
      items: this.filters.map(cloneFilter)
    };
  }

  toCollection(): ESQFilterCollectionJsonModel {
    return {
      logicalOperation: this.logicalOperation,
      items: this.filters.map(cloneFilter)
    };
  }
}

function normalizeColumns(columns: EntityQueryColumnInput[]): ESQColumnJsonModel[] {
  return columns.map((column) => typeof column === "string" ? { path: column } : { ...column });
}

function normalizeOrders(orders: EntityQueryOrderInput[]): ESQOrderJsonModel[] {
  return orders.map((order) => typeof order === "string" ? { path: order } : { ...order });
}

function createFilter(
  path: string,
  comparisonType: ConditionOperator,
  value?: unknown,
  secondValue?: unknown
): ESQFilterJsonModel {
  return {
    path,
    comparisonType,
    ...(value !== undefined ? { value } : {}),
    ...(secondValue !== undefined ? { secondValue } : {})
  };
}

function createGroupFilter(
  logicalOperation: EntityLogicalOperation,
  filters: EntityQueryFilterInput[]
): ESQFilterJsonModel {
  const builder = new EntityFilterBuilder(logicalOperation);

  if (filters.length === 1 && typeof filters[0] === "function") {
    const result = filters[0](builder);
    return (result ?? builder).toFilter();
  }

  builder.filter(...filters);
  return builder.toFilter();
}

function resolveFilterInput(filter: EntityQueryFilterInput): ESQFilterJsonModel | undefined {
  if (typeof filter === "function") {
    const builder = new EntityFilterBuilder();
    const result = filter(builder);
    return (result ?? builder).toFilter();
  }

  if (filter instanceof EntityFilterBuilder) {
    return filter.toFilter();
  }

  return cloneFilter(filter);
}

function cloneFilterCollection(
  filters: ESQFilterCollectionJsonModel | undefined
): ESQFilterCollectionJsonModel | undefined {
  return filters
    ? {
        ...filters,
        items: filters.items?.map(cloneFilter)
      }
    : undefined;
}

function cloneFilter(filter: ESQFilterJsonModel): ESQFilterJsonModel {
  return {
    ...filter,
    items: filter.items?.map(cloneFilter)
  };
}
