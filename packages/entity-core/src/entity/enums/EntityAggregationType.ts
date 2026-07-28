/** Aggregation types supported by EntityQuery selected columns. */
export enum EntityAggregationType {
  /** No aggregation. */
  None = 0,

  /** `COUNT(...)` aggregation. */
  Count = 1,

  /** `SUM(...)` aggregation. */
  Sum = 2,

  /** `AVG(...)` aggregation. */
  Avg = 3,

  /** `MIN(...)` aggregation. */
  Min = 4,

  /** `MAX(...)` aggregation. */
  Max = 5
}
