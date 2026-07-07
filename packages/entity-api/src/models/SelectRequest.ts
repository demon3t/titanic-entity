import type { EntityQueryInput } from "../query";
import type { ESQFilter } from "./ESQFilter";
import type { ESQOrder } from "./ESQOrder";

/** High-level select request used by {@link EntityApiClient.selectEntityRows}. */
export interface SelectRequest {
  /** Root table name used when `query` is not provided. */
  tableName: string;

  /** Explicit list of selected columns. */
  columns?: string[];

  /** Flat list of filters applied to the root entity. */
  filters?: ESQFilter[];

  /** Sort expressions applied to the result set. */
  orders?: ESQOrder[];

  /** Maximum number of rows to return. */
  rowCount?: number;

  /** Enables loading of all root columns when no explicit column list is provided. */
  allColumns?: boolean;

  /** Optional prebuilt ESQ query that overrides the shorthand fields above. */
  query?: EntityQueryInput;
}
