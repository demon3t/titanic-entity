/**
 * Подписчик на изменение значения runtime-колонки.
 */
export type ColumnSubscriber<T> = (value: T, previousValue: T, initialValue: T) => void;