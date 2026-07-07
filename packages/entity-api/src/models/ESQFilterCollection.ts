import type { EntityLogicalOperation } from "../enums/EntityLogicalOperation";
import type { ESQFilter } from "./ESQFilter";

/** Root filter collection used by an ESQ payload. */
export interface ESQFilterCollection {
  /** Indicates whether the collection is enabled. */
  isEnabled?: boolean;

  /** Logical operator used between direct child filters. */
  logicalOperation?: EntityLogicalOperation;

  /** Leaf filters and nested filter groups. */
  items?: ESQFilter[];
}
