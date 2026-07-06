/**
 * Оператор сравнения фильтра ESQ.
 */
export enum ConditionOperator {
  /** Равно. */
  Equal = 0,

  /** Не равно. */
  NotEqual = 1,

  /** Больше. */
  GreaterThan = 2,

  /** Больше или равно. */
  GreaterThanOrEqual = 3,

  /** Меньше. */
  LessThan = 4,

  /** Меньше или равно. */
  LessThanOrEqual = 5,

  /** Входит в набор. */
  In = 6,

  /** Не входит в набор. */
  NotIn = 7,

  /** Регистронезависимое contains-сравнение. */
  Contains = 8,

  /** Значение отсутствует. */
  IsNull = 11,

  /** Значение заполнено. */
  IsNotNull = 12
}
