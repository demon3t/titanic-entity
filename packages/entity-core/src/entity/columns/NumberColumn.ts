import { EntityColumn } from "./EntityColumn";

/**
 * Runtime-колонка числового значения.
 */
export class NumberColumn extends EntityColumn<number> {
  /**
   * Создать числовую колонку.
   */
  constructor(name: string, value = 0) {
    super(name, value);
  }

  /** @inheritdoc */
  protected override cast(value: number | string | null | undefined): number {
    if (value === null || value === undefined || value === "") {
      return 0;
    }

    const result = Number(value);
    return Number.isFinite(result) ? result : 0;
  }
}