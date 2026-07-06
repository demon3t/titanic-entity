/**
 * Результат Delete-операции Entity API.
 */
export interface EntityApiDeleteResult {
  /** Было ли удалено хотя бы одно значение. */
  deleted: boolean;

  /** Количество удаленных сущностей. */
  affected: number;
}