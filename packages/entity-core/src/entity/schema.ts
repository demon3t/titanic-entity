import { EntityFieldKind } from "./enums/EntityFieldKind";
import type { EntityColumnSchema } from "./models/EntityColumnSchema";
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
export {
  getCellDisplayValue,
  getCellValue,
  toApiEntity,
  toEntityDisplayValues,
  toEntityValues
} from "./api";

export function getColumnKey(column: EntityColumnSchema): string {
  return column.alias || column.path;
}

export function createEmptyValues(schema: EntitySchema): EntityValues {
  return Object.fromEntries(
    schema.columns
      .filter((column) => !column.hidden)
      .map((column) => [getColumnKey(column), column.defaultValue ?? getDefaultValue(column.kind)])
  );
}

export function getSaveValues(schema: EntitySchema, values: EntityValues): EntityValues {
  const result: EntityValues = {};
  for (const column of schema.columns) {
    const key = getColumnKey(column);
    if ((!column.readOnly || column.path === schema.primaryColumn) && key in values) {
      result[column.path] = values[key];
    }
  }

  return result;
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
