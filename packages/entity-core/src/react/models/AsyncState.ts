/**
 * Состояние асинхронной операции React hook-а.
 */
export interface AsyncState<T> {
  /** Данные успешной операции. */
  data: T | null;

  /** Признак выполнения операции. */
  loading: boolean;

  /** Последняя ошибка операции. */
  error: Error | null;
}