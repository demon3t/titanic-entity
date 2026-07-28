/**
 * Подписчик на изменение значения активной колонки.
 */
export type ColumnSubscriber<T> = (value: T, previousValue: T, initialValue: T) => void;
