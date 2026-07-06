// Контракт и загрузчик справочных объектов системного дизайнера из Entity ORM API.
import {
  entityQuery,
  getEntityValue,
  type EntityApiClient,
  type EntityApiEntity,
  type EntityApiStructureColumnResponse
} from "@titanic-entity/entity-api";
import { EntityFieldKind, type EntitySchema } from "@titanic-entity/entity-core";
import type { EntityDataGridColumn } from "../grids";

export interface ReferenceObjectFieldConfig {
  path: string;
  required?: boolean;
  hidden?: boolean;
  formHidden?: boolean;
  multiline?: boolean;
  gridSpan?: number;
  order?: number;
}

export interface ReferenceObjectConfig {
  id: string;
  name: string;
  tableName: string;
  primaryColumn: string;
  displayColumn: string;
  orderColumn: string;
  sortOrder: string;
  fields: readonly ReferenceObjectFieldConfig[];
}

export const referenceObjectTableName = "sys_reference_object";
export const referenceObjectOrderColumn = "SortOrder";
export const referenceObjectColumnPaths = [
  "Id",
  "Name",
  "TableName",
  "PrimaryColumn",
  "DisplayColumn",
  "OrderColumn",
  "FieldsJson",
  "SortOrder"
] as const;

interface ReferenceObjectCacheEntry {
  data?: ReferenceObjectConfig[];
  request?: Promise<ReferenceObjectConfig[]>;
}

const referenceObjectCache = new WeakMap<EntityApiClient, ReferenceObjectCacheEntry>();

export function loadReferenceObjects(client: EntityApiClient, force = false): Promise<ReferenceObjectConfig[]> {
  const cached = referenceObjectCache.get(client) ?? {};

  if (!force && cached.data) {
    return Promise.resolve(cached.data);
  }

  if (!force && cached.request) {
    return cached.request;
  }

  const request = client
    .select(entityQuery(referenceObjectTableName)
      .select(...referenceObjectColumnPaths)
      .orderBy(referenceObjectOrderColumn)
      .take(200))
    .then((rows) => rows
      .map(mapReferenceObjectRow)
      .filter((item): item is ReferenceObjectConfig => Boolean(item)))
    .then((items) => {
      referenceObjectCache.set(client, { data: items });
      return items;
    })
    .catch((error) => {
      referenceObjectCache.delete(client);
      throw error;
    });

  referenceObjectCache.set(client, { ...cached, request });
  return request;
}

export function mapReferenceObjectRow(row: EntityApiEntity): ReferenceObjectConfig | null {
  const id = getStringValue(row, "Id");
  const name = getStringValue(row, "Name");
  const tableName = getStringValue(row, "TableName");
  const primaryColumn = getStringValue(row, "PrimaryColumn");
  const displayColumn = getStringValue(row, "DisplayColumn");
  const orderColumn = getStringValue(row, "OrderColumn");
  const fields = parseReferenceObjectFields(getStringValue(row, "FieldsJson"));

  if (!id || !name || !tableName || !primaryColumn || !displayColumn || !orderColumn || fields.length === 0) {
    return null;
  }

  return {
    id,
    name,
    tableName,
    primaryColumn,
    displayColumn,
    orderColumn,
    sortOrder: getStringValue(row, "SortOrder"),
    fields
  };
}

export function createReferenceRecordSchema(
  reference: ReferenceObjectConfig,
  fieldLabels: Record<string, string> | undefined,
  title: string,
  structureColumns: readonly EntityApiStructureColumnResponse[] = []
): EntitySchema {
  const fields = createReferenceFormFields(reference, structureColumns);

  return {
    tableName: reference.tableName,
    primaryColumn: reference.primaryColumn,
    displayColumn: reference.displayColumn,
    title,
    columns: fields.map((field) => ({
      path: field.path,
      label: fieldLabels?.[field.path] ?? field.path,
      kind: field.multiline ? EntityFieldKind.Text : EntityFieldKind.String,
      required: field.required,
      readOnly: field.path === reference.primaryColumn,
      hidden: field.formHidden,
      gridSpan: field.gridSpan ?? (field.multiline ? 24 : 12),
      order: field.order
    }))
  };
}

export function createReferenceRecordGridColumns(
  reference: ReferenceObjectConfig,
  fieldLabels: Record<string, string> | undefined
): readonly EntityDataGridColumn<EntityApiEntity>[] {
  return reference.fields.map((field) => ({
    key: field.path,
    path: field.path,
    label: fieldLabels?.[field.path] ?? field.path,
    defaultVisible: !field.hidden,
    required: field.path === reference.primaryColumn
  }));
}

export function getReferenceDefaultVisibleColumnKeys(reference: ReferenceObjectConfig): string[] {
  return reference.fields
    .filter((field) => !field.hidden)
    .map((field) => field.path);
}

export function serializeReferenceObjectFields(fields: readonly ReferenceObjectFieldConfig[]): string {
  return JSON.stringify(fields.map((field, index) => ({
    path: field.path,
    ...(field.required ? { required: true } : {}),
    ...(field.hidden ? { hidden: true } : {}),
    ...(field.formHidden ? { formHidden: true } : {}),
    ...(field.multiline ? { multiline: true } : {}),
    ...(field.gridSpan && field.gridSpan !== 12 ? { gridSpan: field.gridSpan } : {}),
    order: field.order ?? index
  } satisfies ReferenceObjectFieldConfig)));
}

export function createReferenceFormFields(
  reference: ReferenceObjectConfig,
  structureColumns: readonly EntityApiStructureColumnResponse[] = []
): ReferenceObjectFieldConfig[] {
  const configuredFields = new Map(reference.fields.map((field) => [field.path, field]));
  const structureFields = structureColumns.length > 0
    ? structureColumns.map((column) => toReferenceFieldFromStructure(column, configuredFields.get(column.propertyName)))
    : reference.fields.map((field) => ({ ...field }));
  const configuredOnlyFields = reference.fields
    .filter((field) => !structureFields.some((structureField) => structureField.path === field.path))
    .map((field) => ({ ...field }));
  const fields = [...structureFields, ...configuredOnlyFields];
  const hasExplicitOrder = fields.some((field) => typeof field.order === "number");

  return fields.sort((left, right) => {
    if (hasExplicitOrder) {
      const leftOrder = left.order ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = right.order ?? Number.MAX_SAFE_INTEGER;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }
    }

    return left.path.localeCompare(right.path);
  });
}

function getStringValue(row: EntityApiEntity, path: string): string {
  const value = getEntityValue(row, path);
  return value === null || value === undefined ? "" : String(value);
}

function parseReferenceObjectFields(fieldsJson: string): ReferenceObjectFieldConfig[] {
  try {
    const parsed = JSON.parse(fieldsJson);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map(normalizeReferenceObjectField)
      .filter((field): field is ReferenceObjectFieldConfig => Boolean(field));
  } catch {
    return [];
  }
}

function normalizeReferenceObjectField(value: unknown): ReferenceObjectFieldConfig | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const field = value as Record<string, unknown>;
  const path = typeof field.path === "string" ? field.path.trim() : "";
  const gridSpan = toGridSpan(field.gridSpan);
  const order = toOrder(field.order);

  if (!path) {
    return null;
  }

  return {
    path,
    ...(field.required === true ? { required: true } : {}),
    ...(field.hidden === true ? { hidden: true } : {}),
    ...(field.formHidden === true ? { formHidden: true } : {}),
    ...(field.multiline === true ? { multiline: true } : {}),
    ...(gridSpan ? { gridSpan } : {}),
    ...(order !== null ? { order } : {})
  };
}

function toReferenceFieldFromStructure(
  column: EntityApiStructureColumnResponse,
  configuredField: ReferenceObjectFieldConfig | undefined
): ReferenceObjectFieldConfig {
  return {
    path: column.propertyName,
    required: configuredField?.required ?? (!column.isNullable && !column.isPrimary),
    hidden: configuredField?.hidden,
    formHidden: configuredField?.formHidden,
    multiline: configuredField?.multiline,
    gridSpan: configuredField?.gridSpan ?? 12,
    order: configuredField?.order
  };
}

function toGridSpan(value: unknown): number | null {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return null;
  }

  return Math.max(1, Math.min(24, Math.round(parsedValue)));
}

function toOrder(value: unknown): number | null {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}
