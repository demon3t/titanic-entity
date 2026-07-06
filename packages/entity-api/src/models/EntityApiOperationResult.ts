import type { EntityApiOperationType } from "../enums/EntityApiOperationType";

/**
 * Результат одной операции внутри batch-запроса.
 */
export interface EntityApiOperationResult<T = unknown> {
  /** Имя операции, заданное frontend или сгенерированное backend. */
  name?: string | null;

  /** Тип выполненной операции. */
  operation: EntityApiOperationType;

  /** Признак успешного выполнения. */
  success: boolean;

  /** HTTP status code операции. */
  statusCode: number;

  /** Полезная нагрузка успешной операции. */
  result?: T;

  /** Текст ошибки неуспешной операции. */
  errorMessage?: string | null;
}