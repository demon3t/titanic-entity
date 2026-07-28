import type { EntityApiBatchExecutionMode } from "../enums/EntityApiBatchExecutionMode";
import type { ApiOperationResult } from "./ApiOperationResult";

/** Batch response payload returned by the Entity API manager endpoint. */
export interface ApiBatchResponse {
  /** Execution mode that was used by the backend. */
  executionMode: EntityApiBatchExecutionMode;

  /** Results for every operation that participated in the batch. */
  results: ApiOperationResult[];
}
