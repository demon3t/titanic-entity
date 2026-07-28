import type { EntityQueryInput, EntityQueryFilter, EntityQueryOrder } from "@titanic-entity/entity-core";

/** High-level entity query request used by {@link EntityApiClient.queryEntityRows}. */
export interface EntityQueryRequest {
  /** Root table name used when `query` is not provided. */
  tableName: string;

  /** Explicit list of selected columns. */
  columns?: string[];

  /** Flat list of filters applied to the root entity. */
  filters?: EntityQueryFilter[];

  /** Sort expressions applied to the result set. */
  orders?: EntityQueryOrder[];

  /** Maximum number of rows to return. */
  rowCount?: number;

  /** Enables loading of all root columns when no explicit column list is provided. */
  allColumns?: boolean;

  /** Optional prebuilt EntityQuery query that overrides the shorthand fields above. */
  query?: EntityQueryInput;
}
