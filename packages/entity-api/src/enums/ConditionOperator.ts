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

  /** SQL LIKE comparison. The value must include `%` wildcards when needed. */
  Like = 8,

  /** SQL NOT LIKE comparison. The value must include `%` wildcards when needed. */
  NotLike = 9,

  /** Case-insensitive SQL LIKE comparison. The value must include `%` wildcards when needed. */
  ILike = 10,

  /** Null check. */
  IsNull = 11,

  /** Non-null check. */
  IsNotNull = 12,

  /** Case-insensitive contains comparison. The backend adds `%value%`. */
  Contains = 13,

  /** Case-insensitive starts-with comparison. The backend adds `value%`. */
  StartsWith = 14,

  /** Case-insensitive ends-with comparison. The backend adds `%value`. */
  EndsWith = 15
}
