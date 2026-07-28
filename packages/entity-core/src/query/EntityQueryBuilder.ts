import { ConditionOperator } from "../entity/enums/ConditionOperator";
import { EntityAggregationType } from "../entity/enums/EntityAggregationType";
import { EntityLogicalOperation } from "../entity/enums/EntityLogicalOperation";
import { EntityOrderDirection } from "../entity/enums/EntityOrderDirection";
import type { EntityQuery } from "../entity/models/EntityQuery";
import type { EntityQueryColumn } from "../entity/models/EntityQueryColumn";
import type { EntityQueryFilter } from "../entity/models/EntityQueryFilter";
import type { EntityQueryFilterCollection } from "../entity/models/EntityQueryFilterCollection";
import type { EntityQueryOrder } from "../entity/models/EntityQueryOrder";

/** Supported input for query source selection. */
export type EntityQuerySource = string | Pick<EntityQuery, "tableName" | "entityTypeName">;

/** Supported input for a selected query column. */
export type EntityQueryColumnInput = string | EntityQueryColumn;

/** Optional settings for a single query column. */
export type EntityQueryColumnOptions = Omit<EntityQueryColumn, "path">;

/** Supported input for a query order clause. */
export type EntityQueryOrderInput = string | EntityQueryOrder;

/** Supported input for a query filter clause. */
export type EntityQueryFilterInput =
  | EntityQueryFilter
  | EntityFilterBuilder
  | ((builder: EntityFilterBuilder) => EntityFilterBuilder | void);

/** Converts a builder-like object to an EntityQuery JSON payload. */
export interface EntityQueryJsonProvider {
  /** Builds an EntityQuery JSON payload. */
  toJson(): EntityQuery;
}

/** Supported input for Entity API select queries. */
export type EntityQueryInput = EntityQuery | EntityQueryJsonProvider;

/** Supported input for an aggregated column source. */
export type EntityQueryAggregateColumnInput = string | EntityQueryInput;

/**
 * Creates a fluent query builder for an Entity API entity query request.
 *
 * @param source Optional root source descriptor.
 */
export function entityQuery(source?: EntityQuerySource): EntityQueryBuilder {
  return new EntityQueryBuilder(source);
}

/**
 * Creates a fluent filter builder for nested EntityQuery filters.
 *
 * @param logicalOperation Group operation used between child filters.
 */
export function entityFilters(
  logicalOperation: EntityLogicalOperation = EntityLogicalOperation.And
): EntityFilterBuilder {
  return new EntityFilterBuilder(logicalOperation);
}

/**
 * Converts an EntityQuery builder or raw payload to JSON.
 *
 * @param query Fluent builder or ready-made EntityQuery payload.
 */
export function toEntityQueryJson(query: EntityQueryInput): EntityQuery {
  return isEntityQueryJsonProvider(query) ? query.toJson() : query;
}

/**
 * Checks whether a value can be converted to EntityQuery JSON via `toJson()`.
 *
 * @param value Candidate value.
 */
export function isEntityQueryJsonProvider(value: EntityQueryInput): value is EntityQueryJsonProvider {
  return typeof value === "object" && value !== null && "toJson" in value && typeof value.toJson === "function";
}

/** Fluent builder for Entity API `EntityQuery` requests. */
export class EntityQueryBuilder implements EntityQueryJsonProvider {
  private readonly query: EntityQuery = {};
  private filterCollection: EntityQueryFilterCollection | undefined;

  /**
   * Creates a query builder and optionally binds its data source.
   *
   * @param source Optional root source descriptor.
   */
  constructor(source?: EntityQuerySource) {
    if (source !== undefined) {
      this.from(source);
    }
  }

  /**
   * Binds the query to a table name or source descriptor.
   *
   * @param source Table name or source descriptor.
   */
  from(source: EntityQuerySource): this {
    return typeof source === "string"
      ? this.table(source)
      : this.source(source);
  }

  /**
   * Sets the source table name.
   *
   * @param tableName Root table name.
   */
  table(tableName: string | null | undefined): this {
    this.query.tableName = tableName;
    return this;
  }

  /**
   * Sets the backend entity type name.
   *
   * @param entityTypeName Backend CLR type name.
   */
  entityType(entityTypeName: string | null | undefined): this {
    this.query.entityTypeName = entityTypeName;
    return this;
  }

  /**
   * Copies the source settings from an existing EntityQuery descriptor.
   *
   * @param source Source descriptor to copy.
   */
  source(source: Pick<EntityQuery, "tableName" | "entityTypeName">): this {
    this.query.tableName = source.tableName;
    this.query.entityTypeName = source.entityTypeName;
    return this;
  }

  /**
   * Replaces the selected columns with the provided list.
   *
   * @param columns Columns to select.
   */
  select(...columns: EntityQueryColumnInput[]): this {
    return this.columns(...columns);
  }

  /**
   * Replaces the selected columns with the provided list.
   *
   * @param columns Columns to select.
   */
  columns(...columns: EntityQueryColumnInput[]): this {
    this.query.columns = normalizeColumns(columns);
    return this;
  }

  /**
   * Appends a single selected column to the query.
   *
   * @param column Existing column descriptor.
   */
  column(column: EntityQueryColumn): this;
  /**
   * Appends a single selected column to the query.
   *
   * @param path Entity path of the column.
   * @param options Additional column options.
   */
  column(path: string, options?: EntityQueryColumnOptions): this;
  /**
   * Appends a single selected column to the query.
   *
   * @param path Entity path of the column.
   * @param alias Result alias.
   * @param aggregationType Optional aggregation type.
   */
  column(path: string, alias?: string | null, aggregationType?: EntityAggregationType): this;
  column(
    pathOrColumn: string | EntityQueryColumn,
    aliasOrOptions?: string | null | EntityQueryColumnOptions,
    aggregationType?: EntityAggregationType
  ): this {
    return this.addColumn(
      typeof pathOrColumn === "string"
        ? createColumn(pathOrColumn, aliasOrOptions, aggregationType)
        : pathOrColumn
    );
  }

  /**
   * Appends a single selected column to the query.
   *
   * @param column Existing column descriptor.
   */
  addColumn(column: EntityQueryColumn): this;
  /**
   * Appends a single selected column to the query.
   *
   * @param path Entity path of the column.
   * @param options Additional column options.
   */
  addColumn(path: string, options?: EntityQueryColumnOptions): this;
  /**
   * Appends a single selected column to the query.
   *
   * @param path Entity path of the column.
   * @param alias Result alias.
   * @param aggregationType Optional aggregation type.
   */
  addColumn(path: string, alias?: string | null, aggregationType?: EntityAggregationType): this;
  addColumn(
    pathOrColumn: string | EntityQueryColumn,
    aliasOrOptions?: string | null | EntityQueryColumnOptions,
    aggregationType?: EntityAggregationType
  ): this {
    this.query.columns = [
      ...(this.query.columns ?? []),
      normalizeColumn(
        typeof pathOrColumn === "string"
          ? createColumn(pathOrColumn, aliasOrOptions, aggregationType)
          : pathOrColumn
      )
    ];
    return this;
  }

  /**
   * Appends an aggregated column to the query.
   *
   * @param aggregationType Aggregation type.
   * @param source Column path or nested query source.
   * @param alias Result alias.
   */
  addAggregateColumn(aggregationType: EntityAggregationType, source: EntityQueryAggregateColumnInput, alias?: string | null): this;
  /**
   * Appends an aggregated column to the query.
   *
   * @param path Entity path of the aggregated column.
   * @param aggregationType Aggregation type.
   * @param alias Result alias.
   */
  addAggregateColumn(path: string, aggregationType: EntityAggregationType, alias?: string | null): this;
  addAggregateColumn(
    aggregationTypeOrPath: EntityAggregationType | string,
    sourceOrAggregationType: EntityQueryAggregateColumnInput | EntityAggregationType,
    alias?: string | null
  ): this {
    return typeof aggregationTypeOrPath === "string"
      ? this.addColumn(createAggregateColumn(sourceOrAggregationType as EntityAggregationType, aggregationTypeOrPath, alias))
      : this.addColumn(createAggregateColumn(aggregationTypeOrPath, sourceOrAggregationType as EntityQueryAggregateColumnInput, alias));
  }

  /**
   * Legacy typo-compatible alias for {@link EntityQueryBuilder.addAggregateColumn}.
   *
   * @param aggregationType Aggregation type.
   * @param source Column path or nested query source.
   * @param alias Result alias.
   */
  addAgragateColumn(aggregationType: EntityAggregationType, source: EntityQueryAggregateColumnInput, alias?: string | null): this;
  /**
   * Legacy typo-compatible alias for {@link EntityQueryBuilder.addAggregateColumn}.
   *
   * @param path Entity path of the aggregated column.
   * @param aggregationType Aggregation type.
   * @param alias Result alias.
   */
  addAgragateColumn(path: string, aggregationType: EntityAggregationType, alias?: string | null): this;
  addAgragateColumn(
    aggregationTypeOrPath: EntityAggregationType | string,
    sourceOrAggregationType: EntityQueryAggregateColumnInput | EntityAggregationType,
    alias?: string | null
  ): this {
    return typeof aggregationTypeOrPath === "string"
      ? this.addAggregateColumn(aggregationTypeOrPath, sourceOrAggregationType as EntityAggregationType, alias)
      : this.addAggregateColumn(aggregationTypeOrPath, sourceOrAggregationType as EntityQueryAggregateColumnInput, alias);
  }

  /**
   * Alias for {@link EntityQueryBuilder.addAggregateColumn}.
   *
   * @param aggregationType Aggregation type.
   * @param source Column path or nested query source.
   * @param alias Result alias.
   */
  addAggregationColumn(aggregationType: EntityAggregationType, source: EntityQueryAggregateColumnInput, alias?: string | null): this;
  /**
   * Alias for {@link EntityQueryBuilder.addAggregateColumn}.
   *
   * @param path Entity path of the aggregated column.
   * @param aggregationType Aggregation type.
   * @param alias Result alias.
   */
  addAggregationColumn(path: string, aggregationType: EntityAggregationType, alias?: string | null): this;
  addAggregationColumn(
    aggregationTypeOrPath: EntityAggregationType | string,
    sourceOrAggregationType: EntityQueryAggregateColumnInput | EntityAggregationType,
    alias?: string | null
  ): this {
    return typeof aggregationTypeOrPath === "string"
      ? this.addAggregateColumn(aggregationTypeOrPath, sourceOrAggregationType as EntityAggregationType, alias)
      : this.addAggregateColumn(aggregationTypeOrPath, sourceOrAggregationType as EntityQueryAggregateColumnInput, alias);
  }

  /**
   * Appends a `COUNT(...)` column to the query.
   *
   * @param path Entity path of the aggregated column.
   * @param alias Result alias.
   */
  count(path: string, alias?: string | null): this {
    return this.addAggregateColumn(EntityAggregationType.Count, path, alias);
  }

  /**
   * Appends a `SUM(...)` column to the query.
   *
   * @param path Entity path of the aggregated column.
   * @param alias Result alias.
   */
  sum(path: string, alias?: string | null): this {
    return this.addAggregateColumn(EntityAggregationType.Sum, path, alias);
  }

  /**
   * Appends an `AVG(...)` column to the query.
   *
   * @param path Entity path of the aggregated column.
   * @param alias Result alias.
   */
  avg(path: string, alias?: string | null): this {
    return this.addAggregateColumn(EntityAggregationType.Avg, path, alias);
  }

  /**
   * Appends a `MIN(...)` column to the query.
   *
   * @param path Entity path of the aggregated column.
   * @param alias Result alias.
   */
  min(path: string, alias?: string | null): this {
    return this.addAggregateColumn(EntityAggregationType.Min, path, alias);
  }

  /**
   * Appends a `MAX(...)` column to the query.
   *
   * @param path Entity path of the aggregated column.
   * @param alias Result alias.
   */
  max(path: string, alias?: string | null): this {
    return this.addAggregateColumn(EntityAggregationType.Max, path, alias);
  }

  /**
   * Enables or disables loading of all root columns.
   *
   * @param enabled Whether all root columns should be loaded.
   */
  allColumns(enabled = true): this {
    this.query.allColumns = enabled;
    return this;
  }

  /**
   * Enables or disables `DISTINCT` selection.
   *
   * @param enabled Whether distinct mode should be enabled.
   */
  distinct(enabled = true): this {
    this.query.isDistinct = enabled;
    return this;
  }

  /**
   * Limits the number of returned rows.
   *
   * @param rowCount Maximum number of rows to return.
   */
  take(rowCount: number | null | undefined): this {
    this.query.rowCount = rowCount;
    return this;
  }

  /**
   * Alias for {@link EntityQueryBuilder.take}.
   *
   * @param rowCount Maximum number of rows to return.
   */
  limit(rowCount: number | null | undefined): this {
    return this.take(rowCount);
  }

  /**
   * Skips the specified number of rows.
   *
   * @param rowCount Number of rows to skip.
   */
  skip(rowCount: number | null | undefined): this {
    this.query.skipRow = rowCount;
    return this;
  }

  /**
   * Sets the `GROUP BY` column paths.
   *
   * @param paths Entity paths used for grouping.
   */
  groupBy(...paths: string[]): this {
    this.query.groupBy = paths;
    return this;
  }

  /**
   * Appends a sort expression to the query.
   *
   * @param path Entity path of the ordered column.
   * @param direction Sort direction.
   */
  orderBy(path: string, direction: EntityOrderDirection = EntityOrderDirection.Ascending): this {
    this.query.orders = [
      ...(this.query.orders ?? []),
      { path, direction }
    ];
    return this;
  }

  /**
   * Appends a descending sort expression to the query.
   *
   * @param path Entity path of the ordered column.
   */
  orderByDesc(path: string): this {
    return this.orderBy(path, EntityOrderDirection.Descending);
  }

  /**
   * Replaces the sort expressions with the provided list.
   *
   * @param orders Sort expressions.
   */
  orders(...orders: EntityQueryOrderInput[]): this {
    this.query.orders = normalizeOrders(orders);
    return this;
  }

  /**
   * Adds a filter from shorthand arguments or a ready-made filter.
   *
   * @param path Entity path or filter object.
   * @param comparisonOrValue Comparison operator or filter value.
   * @param value Primary filter value when an explicit operator is supplied.
   * @param secondValue Secondary filter value for range operators.
   */
  where(path: string, value: unknown): this;
  /**
   * Adds a filter from shorthand arguments or a ready-made filter.
   *
   * @param path Entity path of the filtered column.
   * @param comparisonType Comparison operator.
   * @param value Primary filter value.
   * @param secondValue Secondary filter value for range operators.
   */
  where(path: string, comparisonType: ConditionOperator, value?: unknown, secondValue?: unknown): this;
  /**
   * Adds a filter from shorthand arguments or a ready-made filter.
   *
   * @param filter Ready-made filter, builder, or builder callback.
   */
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

  /**
   * Appends one or more filters to the query.
   *
   * @param filters Filters, builders, or builder callbacks.
   */
  filter(...filters: EntityQueryFilterInput[]): this {
    for (const filter of filters) {
      this.addFilter(resolveFilterInput(filter));
    }
    return this;
  }

  /**
   * Replaces the root filter collection.
   *
   * @param filters Filter collection or flat filter list.
   */
  filters(filters: EntityQueryFilterCollection | EntityQueryFilter[] | undefined): this {
    this.filterCollection = Array.isArray(filters)
      ? { items: filters }
      : filters;
    return this;
  }

  /**
   * Appends an `AND (...)` filter group.
   *
   * @param filters Filters, builders, or builder callbacks.
   */
  and(...filters: EntityQueryFilterInput[]): this {
    return this.filter(createGroupFilter(EntityLogicalOperation.And, filters));
  }

  /**
   * Appends an `OR (...)` filter group.
   *
   * @param filters Filters, builders, or builder callbacks.
   */
  or(...filters: EntityQueryFilterInput[]): this {
    return this.filter(createGroupFilter(EntityLogicalOperation.Or, filters));
  }

  /**
   * Adds an equality filter.
   *
   * @param path Entity path of the filtered column.
   * @param value Filter value.
   */
  equal(path: string, value: unknown): this {
    return this.where(path, value);
  }

  /**
   * Adds a non-equality filter.
   *
   * @param path Entity path of the filtered column.
   * @param value Filter value.
   */
  notEqual(path: string, value: unknown): this {
    return this.where(path, ConditionOperator.NotEqual, value);
  }

  /**
   * Adds a `>` filter.
   *
   * @param path Entity path of the filtered column.
   * @param value Filter value.
   */
  greaterThan(path: string, value: unknown): this {
    return this.where(path, ConditionOperator.GreaterThan, value);
  }

  /**
   * Adds a `>=` filter.
   *
   * @param path Entity path of the filtered column.
   * @param value Filter value.
   */
  greaterThanOrEqual(path: string, value: unknown): this {
    return this.where(path, ConditionOperator.GreaterThanOrEqual, value);
  }

  /**
   * Adds a `<` filter.
   *
   * @param path Entity path of the filtered column.
   * @param value Filter value.
   */
  lessThan(path: string, value: unknown): this {
    return this.where(path, ConditionOperator.LessThan, value);
  }

  /**
   * Adds a `<=` filter.
   *
   * @param path Entity path of the filtered column.
   * @param value Filter value.
   */
  lessThanOrEqual(path: string, value: unknown): this {
    return this.where(path, ConditionOperator.LessThanOrEqual, value);
  }

  /**
   * Adds an `IN (...)` filter.
   *
   * @param path Entity path of the filtered column.
   * @param values Candidate values.
   */
  in(path: string, values: readonly unknown[]): this {
    return this.where(path, ConditionOperator.In, values);
  }

  /**
   * Adds a `NOT IN (...)` filter.
   *
   * @param path Entity path of the filtered column.
   * @param values Candidate values.
   */
  notIn(path: string, values: readonly unknown[]): this {
    return this.where(path, ConditionOperator.NotIn, values);
  }

  /**
   * Adds a `CONTAINS` filter.
   *
   * @param path Entity path of the filtered column.
   * @param value Filter value.
   */
  contains(path: string, value: unknown): this {
    return this.where(path, ConditionOperator.Contains, value);
  }

  /**
   * Adds an `IS NULL` filter.
   *
   * @param path Entity path of the filtered column.
   */
  isNull(path: string): this {
    return this.where(path, ConditionOperator.IsNull, undefined);
  }

  /**
   * Adds an `IS NOT NULL` filter.
   *
   * @param path Entity path of the filtered column.
   */
  isNotNull(path: string): this {
    return this.where(path, ConditionOperator.IsNotNull, undefined);
  }

  /** Builds an immutable EntityQuery JSON snapshot. */
  toJson(): EntityQuery {
    return {
      ...this.query,
      columns: this.query.columns ? this.query.columns.map(cloneColumn) : this.query.columns,
      groupBy: this.query.groupBy ? [...this.query.groupBy] : this.query.groupBy,
      orders: this.query.orders ? [...this.query.orders] : this.query.orders,
      filters: cloneFilterCollection(this.filterCollection)
    };
  }

  /**
   * Executes the query through an Entity API-compatible client.
   *
   * @param client Client exposing a `select` method.
   */
  async execute<T = unknown>(client: { select(query: EntityQueryInput): Promise<T> }): Promise<T> {
    return client.select(this);
  }

  private addFilter(filter: EntityQueryFilter | undefined): void {
    if (!filter) {
      return;
    }

    this.filterCollection ??= { items: [] };
    this.filterCollection.items = [...(this.filterCollection.items ?? []), filter];
  }
}

/** Fluent builder for nested Entity API filter groups. */
export class EntityFilterBuilder {
  private readonly filters: EntityQueryFilter[] = [];

  /**
   * Creates a filter builder with the specified group operation.
   *
   * @param logicalOperation Group operation used between child filters.
   */
  constructor(private readonly logicalOperation: EntityLogicalOperation = EntityLogicalOperation.And) {}

  /**
   * Appends a filter from shorthand arguments.
   *
   * @param path Entity path of the filtered column.
   * @param value Filter value.
   */
  where(path: string, value: unknown): this;
  /**
   * Appends a filter from shorthand arguments.
   *
   * @param path Entity path of the filtered column.
   * @param comparisonType Comparison operator.
   * @param value Primary filter value.
   * @param secondValue Secondary filter value for range operators.
   */
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

  /**
   * Appends one or more filters to the current group.
   *
   * @param filters Filters, builders, or builder callbacks.
   */
  filter(...filters: EntityQueryFilterInput[]): this {
    this.filters.push(...filters.map(resolveFilterInput).filter((filter): filter is EntityQueryFilter => Boolean(filter)));
    return this;
  }

  /**
   * Appends an `AND (...)` nested group.
   *
   * @param filters Filters, builders, or builder callbacks.
   */
  and(...filters: EntityQueryFilterInput[]): this {
    return this.filter(createGroupFilter(EntityLogicalOperation.And, filters));
  }

  /**
   * Appends an `OR (...)` nested group.
   *
   * @param filters Filters, builders, or builder callbacks.
   */
  or(...filters: EntityQueryFilterInput[]): this {
    return this.filter(createGroupFilter(EntityLogicalOperation.Or, filters));
  }

  /**
   * Adds an equality filter.
   *
   * @param path Entity path of the filtered column.
   * @param value Filter value.
   */
  equal(path: string, value: unknown): this {
    return this.where(path, value);
  }

  /**
   * Adds a non-equality filter.
   *
   * @param path Entity path of the filtered column.
   * @param value Filter value.
   */
  notEqual(path: string, value: unknown): this {
    return this.where(path, ConditionOperator.NotEqual, value);
  }

  /**
   * Adds an `IN (...)` filter.
   *
   * @param path Entity path of the filtered column.
   * @param values Candidate values.
   */
  in(path: string, values: readonly unknown[]): this {
    return this.where(path, ConditionOperator.In, values);
  }

  /**
   * Adds a `CONTAINS` filter.
   *
   * @param path Entity path of the filtered column.
   * @param value Filter value.
   */
  contains(path: string, value: unknown): this {
    return this.where(path, ConditionOperator.Contains, value);
  }

  /**
   * Adds an `IS NULL` filter.
   *
   * @param path Entity path of the filtered column.
   */
  isNull(path: string): this {
    return this.where(path, ConditionOperator.IsNull, undefined);
  }

  /**
   * Adds an `IS NOT NULL` filter.
   *
   * @param path Entity path of the filtered column.
   */
  isNotNull(path: string): this {
    return this.where(path, ConditionOperator.IsNotNull, undefined);
  }

  /** Builds a nested EntityQuery filter group. */
  toFilter(): EntityQueryFilter {
    return {
      logicalOperation: this.logicalOperation,
      items: this.filters.map(cloneFilter)
    };
  }

  /** Builds a root-level EntityQuery filter collection. */
  toCollection(): EntityQueryFilterCollection {
    return {
      logicalOperation: this.logicalOperation,
      items: this.filters.map(cloneFilter)
    };
  }
}

function normalizeColumns(columns: EntityQueryColumnInput[]): EntityQueryColumn[] {
  return columns.map(normalizeColumn);
}

function normalizeOrders(orders: EntityQueryOrderInput[]): EntityQueryOrder[] {
  return orders.map((order) => typeof order === "string" ? { path: order } : { ...order });
}

function normalizeColumn(column: EntityQueryColumnInput): EntityQueryColumn {
  return typeof column === "string" ? { path: column } : cloneColumn(column);
}

function createColumn(
  path: string,
  aliasOrOptions?: string | null | EntityQueryColumnOptions,
  aggregationType?: EntityAggregationType
): EntityQueryColumn {
  return typeof aliasOrOptions === "object" && aliasOrOptions !== null
    ? { path, ...aliasOrOptions }
    : { path, alias: aliasOrOptions, aggregationType };
}

function createAggregateColumn(
  aggregationType: EntityAggregationType,
  source: EntityQueryAggregateColumnInput,
  alias?: string | null
): EntityQueryColumn {
  return typeof source === "string"
    ? createColumn(source, alias, aggregationType)
    : { aggregationType, alias, subQuery: cloneQuery(toEntityQueryJson(source)) };
}

function createFilter(
  path: string,
  comparisonType: ConditionOperator,
  value?: unknown,
  secondValue?: unknown
): EntityQueryFilter {
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
): EntityQueryFilter {
  const builder = new EntityFilterBuilder(logicalOperation);

  if (filters.length === 1 && typeof filters[0] === "function") {
    const result = filters[0](builder);
    return (result ?? builder).toFilter();
  }

  builder.filter(...filters);
  return builder.toFilter();
}

function resolveFilterInput(filter: EntityQueryFilterInput): EntityQueryFilter | undefined {
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
  filters: EntityQueryFilterCollection | undefined
): EntityQueryFilterCollection | undefined {
  return filters
    ? {
        ...filters,
        items: filters.items?.map(cloneFilter)
      }
    : undefined;
}

function cloneFilter(filter: EntityQueryFilter): EntityQueryFilter {
  return {
    ...filter,
    items: filter.items?.map(cloneFilter)
  };
}

function cloneColumn(column: EntityQueryColumn): EntityQueryColumn {
  return {
    ...column,
    subQuery: column.subQuery ? cloneQuery(column.subQuery) : column.subQuery
  };
}

function cloneQuery(query: EntityQuery): EntityQuery {
  return {
    ...query,
    columns: query.columns?.map(cloneColumn),
    filters: cloneFilterCollection(query.filters),
    groupBy: query.groupBy ? [...query.groupBy] : query.groupBy,
    orders: query.orders ? query.orders.map((order) => ({ ...order })) : query.orders
  };
}
