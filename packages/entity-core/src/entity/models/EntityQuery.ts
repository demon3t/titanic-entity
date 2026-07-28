import type { EntityQueryColumn } from "./EntityQueryColumn";
import type { EntityQueryFilterCollection } from "./EntityQueryFilterCollection";
import type { EntityQueryOrder } from "./EntityQueryOrder";

/** Entity query payload sent to the Entity API. */
export interface EntityQuery {
  /** Root table name of the query. */
  tableName?: string | null;

  /** Optional backend CLR type name of the queried entity. */
  entityTypeName?: string | null;

  /** Selected columns of the query. */
  columns?: EntityQueryColumn[];

  /** Root filter collection. */
  filters?: EntityQueryFilterCollection;

  /** Grouping column paths. */
  groupBy?: string[];

  /** Sort expressions. */
  orders?: EntityQueryOrder[];

  /** Enables DISTINCT selection. */
  isDistinct?: boolean;

  /** Enables loading of all root columns. */
  allColumns?: boolean;

  /** Preferred canonical skip property used by some payloads. */
  skipRowCount?: number | null;

  /** Legacy alias for `skipRowCount`. */
  skipRow?: number | null;

  /** Maximum number of returned rows. */
  rowCount?: number | null;
}
