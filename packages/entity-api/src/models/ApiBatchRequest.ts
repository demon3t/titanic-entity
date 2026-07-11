import type { EntityApiBatchExecutionMode } from "../enums/EntityApiBatchExecutionMode";
import type { ApiRequest } from "./ApiRequest";

/** Batch request payload for the Entity API manager endpoint. */
export interface ApiBatchRequest {
  /** Execution mode used by the backend for processing the batch. */
  executionMode?: EntityApiBatchExecutionMode | null;

  /** Operations that belong to the batch request. */
  requests: ApiRequest[];
}
