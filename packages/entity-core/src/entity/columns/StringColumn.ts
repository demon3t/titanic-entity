import { EntityColumn, type EntityColumnOptions } from "./EntityColumn";

/**
 * Активная колонка строкового значения.
 */
export class StringColumn extends EntityColumn<string> {
  /**
   * Создать строковую колонку.
   */
  constructor(name: string, value = "", options: EntityColumnOptions<string> = {}) {
    super(name, value, options);
  }

  /** @inheritdoc */
  protected override cast(value: string | null | undefined): string {
    return value ?? "";
  }
}
