import { EntityColumn } from "./EntityColumn";

/**
 * Runtime-колонка строкового значения.
 */
export class StringColumn extends EntityColumn<string> {
  /**
   * Создать строковую колонку.
   */
  constructor(name: string, value = "") {
    super(name, value);
  }

  /** @inheritdoc */
  protected override cast(value: string | null | undefined): string {
    return value ?? "";
  }
}