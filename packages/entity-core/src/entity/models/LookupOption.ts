/**
 * Элемент выпадающего списка lookup-поля.
 */
export interface LookupOption {
  /** Значение, которое сохраняется в Entity API. */
  value: string | number;

  /** Текст для отображения пользователю. */
  displayValue: string;
}