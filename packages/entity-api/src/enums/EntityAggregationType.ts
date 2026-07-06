/**
 * Тип агрегации ESQ-колонки.
 */
export enum EntityAggregationType {
  /** Обычная колонка без агрегации. */
  None = 0,

  /** Агрегация COUNT. */
  Count = 1,

  /** Агрегация SUM. */
  Sum = 2,

  /** Агрегация AVG. */
  Avg = 3,

  /** Агрегация MIN. */
  Min = 4,

  /** Агрегация MAX. */
  Max = 5
}