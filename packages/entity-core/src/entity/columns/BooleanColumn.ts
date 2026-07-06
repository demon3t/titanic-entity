import { EntityColumn } from "./EntityColumn";

/**
 * Runtime-колонка boolean-значения.
 */
export class BooleanColumn extends EntityColumn<boolean> {
  /**
   * Создать boolean-колонку.
   */
  constructor(name: string, value = false) {
    super(name, value);
  }

  /** @inheritdoc */
  protected override cast(value: boolean | null | undefined): boolean {
    return Boolean(value);
  }
}