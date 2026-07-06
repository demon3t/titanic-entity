/**
 * Ошибка HTTP-вызова Entity API.
 */
export class EntityApiError extends Error {
  /** HTTP status code ответа. */
  readonly status: number;

  /** Сырая payload-модель ошибки backend. */
  readonly payload: unknown;

  /**
   * Создать ошибку Entity API.
   */
  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "EntityApiError";
    this.status = status;
    this.payload = payload;
  }
}