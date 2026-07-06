import type { ReferenceValue } from "../models/ReferenceValue";
import { EntityColumn } from "./EntityColumn";

/**
 * Runtime-колонка ссылочного значения с displayValue.
 */
export class LookupColumn extends EntityColumn<ReferenceValue | null> {
  /**
   * Создать lookup-колонку.
   */
  constructor(name: string, value: ReferenceValue | null = null) {
    super(name, value);
  }

  /** @inheritdoc */
  protected override cast(value: ReferenceValue | null | undefined): ReferenceValue | null {
    return value?.value === null || value?.value === undefined ? null : value;
  }
}