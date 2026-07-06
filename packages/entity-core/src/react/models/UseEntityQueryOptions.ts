/**
 * Настройки hook-а useEntityQuery.
 */
export interface UseEntityQueryOptions {
  /** Автоматически выполнять запрос при монтировании и изменении зависимостей. */
  enabled?: boolean;

  /** Дополнительные зависимости для повторной загрузки. */
  dependencies?: readonly unknown[];
}