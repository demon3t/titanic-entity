/**
 * Значение одной колонки, возвращенное Entity API.
 */
export interface EntityApiColumnValueResponse<T = unknown> {
  /** Сырое значение колонки. */
  value: T | null;

  /** Отображаемое значение ссылочной колонки. */
  displayValue: unknown | null;
}