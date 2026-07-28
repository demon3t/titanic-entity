/** Error thrown when an Entity API HTTP request fails. */
export class EntityApiError extends Error {
  /** HTTP status code returned by the backend. */
  readonly status: number;

  /** Raw error payload returned by the backend. */
  readonly payload: unknown;

  /**
   * Creates a new Entity API error instance.
   *
   * @param message Human-readable error message.
   * @param status HTTP status code.
   * @param payload Raw backend payload.
   */
  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "EntityApiError";
    this.status = status;
    this.payload = payload;
  }
}
