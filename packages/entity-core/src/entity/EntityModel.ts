import type { EntityApiEntity } from "@titanic-entity/entity-api";
import type { EntitySchema } from "./models/EntitySchema";
import type { EntityValues } from "./models/EntityValues";
import { createEmptyValues, getColumnKey, toApiEntity, toEntityValues } from "./schema";

/**
 * Runtime-модель одной Entity-записи на frontend.
 */
export class EntityModel {
  /** UI-схема сущности. */
  readonly schema: EntitySchema;

  private values: EntityValues;
  private initialValues: EntityValues;

  /**
   * Создать runtime-модель сущности.
   */
  constructor(schema: EntitySchema, values?: EntityValues | EntityApiEntity) {
    this.schema = schema;
    this.values = values ? normalizeValues(values) : createEmptyValues(schema);
    this.initialValues = { ...this.values };
  }

  /** Имя таблицы Entity ORM. */
  get tableName(): string {
    return this.schema.tableName;
  }

  /** Признак изменения значений относительно исходного состояния. */
  get isChanged(): boolean {
    return Object.keys(this.values).some((key) => !Object.is(this.values[key], this.initialValues[key]));
  }

  /**
   * Получить значение по alias или ORM-пути.
   */
  getValue<T = unknown>(key: string): T | null {
    return (this.values[key] ?? null) as T | null;
  }

  /**
   * Установить значение по alias или ORM-пути.
   */
  setValue(key: string, value: unknown): void {
    this.values[key] = value;
  }

  /**
   * Получить копию значений сущности.
   */
  toValues(): EntityValues {
    return { ...this.values };
  }

  /**
   * Получить значения в формате Entity API response.
   */
  toApiEntity(): EntityApiEntity {
    return toApiEntity(this.values);
  }

  /**
   * Зафиксировать текущее состояние как исходное.
   */
  acceptChanges(values?: EntityValues | EntityApiEntity): void {
    if (values) {
      this.values = normalizeValues(values);
    }

    this.initialValues = { ...this.values };
  }

  /**
   * Получить значения, пригодные для Save операции Entity API.
   */
  getSaveValues(): EntityValues {
    const result: EntityValues = {};
    for (const column of this.schema.columns) {
      const key = getColumnKey(column);
      if ((!column.readOnly || column.path === this.schema.primaryColumn) && key in this.values) {
        result[column.path] = this.values[key];
      }
    }

    return result;
  }
}

function normalizeValues(values: EntityValues | EntityApiEntity): EntityValues {
  const first = Object.values(values)[0];
  if (first && typeof first === "object" && "value" in first) {
    return toEntityValues(values as EntityApiEntity);
  }

  return { ...(values as EntityValues) };
}
