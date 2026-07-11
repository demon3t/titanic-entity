/** Execution modes supported by Entity API batch requests. */
export enum EntityApiBatchExecutionMode {
  /** Execute operations one by one in order. */
  Sequential = 0,

  /** Execute independent operations in parallel. */
  Parallel = 1
}
