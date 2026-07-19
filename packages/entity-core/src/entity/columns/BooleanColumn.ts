import { EntityColumnKind } from "../enums/EntityColumnKind";
import { EntityColumn, type EntityColumnOptions } from "./EntityColumn";

/**
 * Активная колонка boolean-значения.
 */
export class BooleanColumn extends EntityColumn<boolean> {
  /**
   * Создать boolean-колонку.
   */
  constructor(name: string, value = false, options: EntityColumnOptions<boolean> = {}) {
    super(name, value, { kind: EntityColumnKind.Boolean, ...options });
  }

  /** @inheritdoc */
  protected override cast(value: boolean | null | undefined): boolean {
    return Boolean(value);
  }
}
