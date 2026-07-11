/** Result of a delete operation executed through the Entity API. */
export interface ApiDeleteResult {
  /** Indicates whether at least one record was deleted. */
  deleted: boolean;

  /** Number of affected records. */
  affected: number;
}
