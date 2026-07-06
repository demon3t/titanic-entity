import type { EntityApiColumnValueResponse, EntityApiEntity } from "@titanic/entity-api";
import { EntityFieldKind } from "./enums/EntityFieldKind";
import type { EntityColumnSchema } from "./models/EntityColumnSchema";
import type { EntityDisplayValues } from "./models/EntityDisplayValues";
import type { EntitySchema } from "./models/EntitySchema";
import type { EntityValues } from "./models/EntityValues";

export * from "./enums/EntityFieldKind";
export * from "./models/EntityColumnSchema";
export * from "./models/EntityDisplayValues";
export * from "./models/EntityJsonEditorOptions";
export * from "./models/EntityLookupOptionsSource";
export * from "./models/EntitySchema";
export * from "./models/EntityValues";
export * from "./models/LookupOption";
export * from "./models/ReferenceValue";
export * from "./systemEntities";

/**
 * Получить ключ значения по описанию колонки.
 */
export function getColumnKey(column: EntityColumnSchema): string {
  return column.alias || column.path;
}

/**
 * Получить сырое значение ячейки результата Entity API.
 */
export function getCellValue<T = unknown>(row: EntityApiEntity, key: string): T | null {
  const cell = row[key];
  return (cell?.value ?? null) as T | null;
}

/**
 * Получить displayValue ячейки или fallback на value.
 */
export function getCellDisplayValue(row: EntityApiEntity, key: string): unknown {
  const cell = row[key];
  return cell?.displayValue ?? cell?.value ?? null;
}

/**
 * Преобразовать ответ Entity API в простой словарь значений.
 */
export function toEntityValues(row: EntityApiEntity): EntityValues {
  return Object.fromEntries(Object.entries(row).map(([key, cell]) => [key, cell.value]));
}

/**
 * Преобразовать displayValue из ответа Entity API в простой словарь.
 */
export function toEntityDisplayValues(row: EntityApiEntity): EntityDisplayValues {
  return Object.fromEntries(
    Object.entries(row)
      .filter((entry) => entry[1].displayValue !== null && entry[1].displayValue !== undefined)
      .map(([key, cell]) => [key, String(cell.displayValue)])
  );
}

/**
 * Преобразовать простой словарь значений в модель Entity API.
 */
export function toApiEntity(values: EntityValues): EntityApiEntity {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, { value, displayValue: null } satisfies EntityApiColumnValueResponse])
  );
}

/**
 * Создать значения новой сущности по UI-схеме.
 */
export function createEmptyValues(schema: EntitySchema): EntityValues {
  return Object.fromEntries(
    schema.columns
      .filter((column) => !column.hidden)
      .map((column) => [getColumnKey(column), column.defaultValue ?? getDefaultValue(column.kind)])
  );
}

function getDefaultValue(kind: EntityFieldKind | undefined): unknown {
  switch (kind) {
    case EntityFieldKind.Boolean:
      return false;
    case EntityFieldKind.Number:
      return 0;
    case EntityFieldKind.Lookup:
      return null;
    case EntityFieldKind.Json:
      return "{}";
    default:
      return "";
  }
}
