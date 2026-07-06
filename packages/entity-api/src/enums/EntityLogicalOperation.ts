/**
 * Логическая операция между фильтрами ESQ.
 */
export enum EntityLogicalOperation {
  /** Объединять фильтры через AND. */
  And = 0,

  /** Объединять фильтры через OR. */
  Or = 1
}