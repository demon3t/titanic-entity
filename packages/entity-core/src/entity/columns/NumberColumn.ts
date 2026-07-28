import { EntityColumnKind } from "../enums/EntityColumnKind";
import { EntityColumn, type EntityColumnOptions } from "./EntityColumn";

/**
 * Активная колонка числового значения.
 */
export class NumberColumn extends EntityColumn<number> {
  /**
   * Создать числовую колонку.
   */
  constructor(name: string, value = 0, options: EntityColumnOptions<number> = {}) {
    super(name, value, { kind: EntityColumnKind.Number, ...options });
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
