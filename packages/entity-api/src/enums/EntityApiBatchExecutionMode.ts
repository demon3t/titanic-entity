/**
 * Режим выполнения batch-запроса Entity API.
 */
export enum EntityApiBatchExecutionMode {
  /** Выполнять операции по порядку. */
  Sequential = 0,

  /** Выполнять независимые операции параллельно. */
  Parallel = 1
}