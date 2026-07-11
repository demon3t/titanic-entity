/** Comparison operators supported by ESQ filters. */
export enum ConditionOperator {
  /** Equal comparison. */
  Equal = 0,

  /** Not-equal comparison. */
  NotEqual = 1,

  /** Greater-than comparison. */
  GreaterThan = 2,

  /** Greater-than-or-equal comparison. */
  GreaterThanOrEqual = 3,

  /** Less-than comparison. */
  LessThan = 4,

  /** Less-than-or-equal comparison. */
  LessThanOrEqual = 5,

  /** Membership comparison. */
  In = 6,

  /** Negative membership comparison. */
  NotIn = 7,

  /** Case-insensitive contains comparison. */
  Contains = 8,

  /** Null check. */
  IsNull = 11,

  /** Non-null check. */
  IsNotNull = 12
}
