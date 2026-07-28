import type { ConditionOperator } from "../enums/ConditionOperator";
import type { EntityLogicalOperation } from "../enums/EntityLogicalOperation";

/** Leaf entity query filter or nested filter group. */
export interface EntityQueryFilter {
  /** Entity path of the filtered column for leaf filters. */
  path?: string;

  /** Comparison operator used by the filter. */
  comparisonType?: ConditionOperator;

  /** Primary filter value. */
  value?: unknown;

  /** Secondary filter value used by range operators. */
  secondValue?: unknown;

  /** Indicates whether the filter or group is enabled. */
  isEnabled?: boolean;

  /** Indicates whether the leaf filter should be negated. */
  isNot?: boolean;

  /** Logical operator used between nested child filters. */
  logicalOperation?: EntityLogicalOperation;

  /** Nested filters when the item acts as a group. */
  items?: EntityQueryFilter[];
}
