/** Value wrapper returned by the Entity API for a single selected column. */
export interface ApiColumnValueResponse<T = unknown> {
  /** Raw column value returned by the backend. */
  value: T | null;

  /** Optional display value for lookup-like columns. */
  displayValue: unknown | null;
}
