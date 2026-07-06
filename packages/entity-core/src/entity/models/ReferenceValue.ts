/**
 * Значение ссылочной колонки с отображаемым текстом.
 */
export interface ReferenceValue {
  /** Значение ссылки, которое сохраняется в БД. */
  value: string | number | null;

  /** Отображаемый текст связанной сущности. */
  displayValue: string | null;
}