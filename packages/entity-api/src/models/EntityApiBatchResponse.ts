import type { EntityApiBatchExecutionMode } from "../enums/EntityApiBatchExecutionMode";
import type { EntityApiOperationResult } from "./EntityApiOperationResult";

/**
 * Ответ batch endpoint-а Entity API.
 */
export interface EntityApiBatchResponse {
  /** Фактический режим выполнения batch-запроса. */
  executionMode: EntityApiBatchExecutionMode;

  /** Результаты операций batch-запроса. */
  results: EntityApiOperationResult[];
}