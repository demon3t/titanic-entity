import type { EntityApiBatchExecutionMode } from "../enums/EntityApiBatchExecutionMode";
import type { EntityApiRequest } from "./EntityApiRequest";

/**
 * Batch-запрос Entity API.
 */
export interface EntityApiBatchRequest {
  /** Режим выполнения batch-запроса. */
  executionMode?: EntityApiBatchExecutionMode | null;

  /** Операции batch-запроса. */
  requests: EntityApiRequest[];
}