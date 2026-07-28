import { EntityColumn } from "./columns/EntityColumn";
import { coerceEntityColumnKind, EntityColumnKind } from "./enums/EntityColumnKind";
import type {
  EntityColumnDefinition,
  ResolvedEntityColumnSchema
} from "./models/EntityColumnSchema";
import type { EntitySchema } from "./models/EntitySchema";
import type { EntityValues } from "./models/EntityValues";

export * from "./enums/EntityColumnKind";
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

export function isEntityColumn<TValue = unknown>(
  column: EntityColumnDefinition<TValue>
): column is EntityColumn<TValue> {
  return column instanceof EntityColumn;
}

export function normalizeEntityColumn<TValue = unknown>(
  column: EntityColumnDefinition<TValue>
): ResolvedEntityColumnSchema<TValue> {
  if (!isEntityColumn(column)) {
    return { ...column, kind: coerceEntityColumnKind(column.kind) };
  }

  return {
    path: column.path,
    alias: column.alias,
    label: column.label,
    kind: column.kind,
    required: column.required,
    readOnly: column.readOnly,
    hidden: column.hidden,
    placeholder: column.placeholder,
    gridSpan: column.gridSpan,
    order: column.order,
    maxLength: column.maxLength,
    options: column.options,
    lookup: column.lookup,
    lookupMode: column.lookupMode,
    jsonEditor: column.jsonEditor,
    defaultValue: column.defaultValue
  };
}

export function getColumnKey(column: EntityColumnDefinition): string {
  return column.alias || column.path;
}

export function createEmptyValues(schema: EntitySchema): EntityValues {
  return Object.fromEntries(
    schema.columns
      .map((column) => normalizeEntityColumn(column))
      .filter((column) => !column.hidden)
      .map((column) => [getColumnKey(column), column.defaultValue ?? getDefaultValue(column.kind)])
  );
}

export function getSaveValues(schema: EntitySchema, values: EntityValues): EntityValues {
  const result: EntityValues = {};
  for (const rawColumn of schema.columns) {
    const column = normalizeEntityColumn(rawColumn);
    const key = getColumnKey(column);
    if ((!column.readOnly || column.path === schema.primaryColumn) && key in values) {
      result[column.path] = values[key];
    }
  }

  return result;
}

function getDefaultValue(kind: EntityColumnKind | undefined): unknown {
  switch (coerceEntityColumnKind(kind)) {
    case EntityColumnKind.Boolean:
      return false;
    case EntityColumnKind.Number:
      return 0;
    case EntityColumnKind.Lookup:
      return null;
    case EntityColumnKind.Json:
      return "{}";
    default:
      return "";
  }
}
