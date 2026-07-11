import type { ESQColumn } from "./ESQColumn";
import type { ESQFilterCollection } from "./ESQFilterCollection";
import type { ESQOrder } from "./ESQOrder";

/** Entity Schema Query payload sent to the Entity API. */
export interface ESQ {
  /** Root table name of the query. */
  tableName?: string | null;

  /** Optional backend CLR type name of the queried entity. */
  entityTypeName?: string | null;

  /** Selected columns of the query. */
  columns?: ESQColumn[];

  /** Root filter collection. */
  filters?: ESQFilterCollection;

  /** Grouping column paths. */
  groupBy?: string[];

  /** Sort expressions. */
  orders?: ESQOrder[];

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
