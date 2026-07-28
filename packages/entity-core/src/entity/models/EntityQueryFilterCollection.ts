import type { EntityLogicalOperation } from "../enums/EntityLogicalOperation";
import type { EntityQueryFilter } from "./EntityQueryFilter";

/** Root filter collection used by an entity query payload. */
export interface EntityQueryFilterCollection {
  /** Indicates whether the collection is enabled. */
  isEnabled?: boolean;

  /** Logical operator used between direct child filters. */
  logicalOperation?: EntityLogicalOperation;

  /** Leaf filters and nested filter groups. */
  items?: EntityQueryFilter[];
}
