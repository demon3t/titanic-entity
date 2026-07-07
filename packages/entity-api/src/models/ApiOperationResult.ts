import type { EntityApiOperationType } from "../enums/EntityApiOperationType";

/** Result of a single operation executed by the Entity API manager. */
export interface ApiOperationResult<T = unknown> {
  /** Optional operation name, mainly used inside batch requests. */
  name?: string | null;

  /** Executed operation type. */
  operation: EntityApiOperationType;

  /** Indicates whether the operation completed successfully. */
  success: boolean;

  /** HTTP status code produced by the backend. */
  statusCode: number;

  /** Operation payload for successful calls. */
  result?: T;

  /** Backend error message for unsuccessful calls. */
  errorMessage?: string | null;
}
