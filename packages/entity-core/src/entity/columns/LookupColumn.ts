import type { ReferenceValue } from "../models/ReferenceValue";
import { EntityColumnKind } from "../enums/EntityColumnKind";
import { EntityColumn, type EntityColumnOptions } from "./EntityColumn";

/**
 * Активная колонка ссылочного значения с displayValue.
 */
export class LookupColumn extends EntityColumn<ReferenceValue | null> {
  /**
   * Создать lookup-колонку.
   */
  constructor(
    name: string,
    value: ReferenceValue | null = null,
    options: EntityColumnOptions<ReferenceValue | null> = {}
  ) {
    super(name, value, { kind: EntityColumnKind.Lookup, ...options });
  }

  /** @inheritdoc */
  protected override cast(value: ReferenceValue | null | undefined): ReferenceValue | null {
    return value?.value === null || value?.value === undefined ? null : value;
  }
}
