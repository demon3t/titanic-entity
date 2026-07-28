import { entityQuery } from "../query";
import { EntityLogicalOperation } from "./enums/EntityLogicalOperation";
import type { EntityQuery } from "./models/EntityQuery";
import type { EntityQueryFilter } from "./models/EntityQueryFilter";
import type { EntityQueryFilterCollection } from "./models/EntityQueryFilterCollection";
import { createFilterCollection, createGroupFilter, createIsContainsFilter, createIsEqualFilter } from "./filters";
import type { EntityDisplayValues } from "./models/EntityDisplayValues";
import type { EntityLookupOptionsSource } from "./models/EntityLookupOptionsSource";
import type { EntitySchema } from "./models/EntitySchema";
import type { EntityValues } from "./models/EntityValues";
import type { LookupOption } from "./models/LookupOption";

export interface EntityApiColumnValueResponse<T = unknown> {
  value: T | null;
  displayValue: unknown | null;
}

export type EntityApiEntity = Record<string, EntityApiColumnValueResponse>;

export function getCellValue<T = unknown>(row: EntityApiEntity, key: string): T | null {
  const cell = row[key];
  return (cell?.value ?? null) as T | null;
}

export function getCellDisplayValue(row: EntityApiEntity, key: string): unknown {
  const cell = row[key];
  return cell?.displayValue ?? cell?.value ?? null;
}

export function toEntityValues(row: EntityApiEntity): EntityValues {
  return Object.fromEntries(Object.entries(row).map(([key, cell]) => [key, cell.value]));
}

export function toEntityDisplayValues(row: EntityApiEntity): EntityDisplayValues {
  return Object.fromEntries(
    Object.entries(row)
      .filter((entry) => entry[1].displayValue !== null && entry[1].displayValue !== undefined)
      .map(([key, cell]) => [key, String(cell.displayValue)])
  );
}

export function toApiEntity(values: EntityValues): EntityApiEntity {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, { value, displayValue: null } satisfies EntityApiColumnValueResponse])
  );
}

export function createSchemaSelectQuery(schema: EntitySchema, rowCount = 50): EntityQuery {
  return entityQuery(schema.tableName)
    .columns(...getVisibleSchemaQueryColumns(schema))
    .take(rowCount)
    .orders(...(schema.displayColumn ? [{ path: schema.displayColumn }] : []))
    .toJson();
}

export function createEntityRecordQuery(schema: EntitySchema, id: unknown): EntityQuery {
  return entityQuery(schema.tableName)
    .columns(...getEntityRecordQueryColumns(schema))
    .filters(createPrimaryFilter(schema, id))
    .take(1)
    .toJson();
}

export function createPrimaryFilter(schema: EntitySchema, id: unknown): EntityQueryFilterCollection {
  return {
    items: [
      createIsEqualFilter(schema.primaryColumn ?? "Id", id)
    ]
  };
}

export interface CreateLookupQueryOptions {
  rowCount?: number;
  skip?: number;
  searchText?: string;
  value?: string | number | null;
}

export function createLookupQuery(lookup: EntityLookupOptionsSource, options: CreateLookupQueryOptions = {}): EntityQuery {
  const valueColumn = getLookupValueColumn(lookup);
  const displayColumn = getLookupDisplayColumn(lookup);
  const valueAlias = getLookupValueAlias(lookup);
  const displayAlias = getLookupDisplayAlias(lookup);
  const rowCount = normalizePositiveInteger(options.rowCount ?? lookup.rowCount, 15);
  const skip = normalizeNonNegativeInteger(options.skip);
  const columns = [
    { path: valueColumn, alias: valueAlias === valueColumn ? undefined : valueAlias },
    ...(displayColumn === valueColumn
      ? []
      : [{ path: displayColumn, alias: displayAlias === displayColumn ? undefined : displayAlias }])
  ];

  const query = entityQuery({ tableName: lookup.tableName, entityTypeName: lookup.entityTypeName })
    .take(rowCount)
    .columns(...columns)
    .filters(createLookupFilters(lookup.filters, valueColumn, displayColumn, options.searchText, options.value))
    .orders(...(lookup.orders ?? [{ path: displayColumn }]));

  if (skip > 0) {
    query.skip(skip);
  }

  return query.toJson();
}

export function mapLookupRows(rows: EntityApiEntity[], lookup: EntityLookupOptionsSource): LookupOption[] {
  const valueAlias = getLookupValueAlias(lookup);
  const displayAlias = getLookupDisplayAlias(lookup);

  return rows
    .map((row) => {
      const value = row[valueAlias]?.value;
      if (value !== null && typeof value !== "string" && typeof value !== "number") {
        return null;
      }

      const displayValue =
        row[displayAlias]?.displayValue ??
        row[displayAlias]?.value ??
        row[valueAlias]?.displayValue ??
        value;

      return value === null || value === undefined
        ? null
        : { value, displayValue: String(displayValue ?? value) } satisfies LookupOption;
    })
    .filter((option): option is LookupOption => option !== null);
}

function normalizeLookupFilters(
  filters: EntityLookupOptionsSource["filters"]
): EntityQueryFilterCollection | undefined {
  if (!filters) {
    return undefined;
  }

  return Array.isArray(filters) ? { items: filters } : filters;
}

function createLookupFilters(
  filters: EntityLookupOptionsSource["filters"],
  valueColumn: string,
  displayColumn: string,
  searchText: string | undefined,
  value: string | number | null | undefined
): EntityQueryFilterCollection | undefined {
  const baseFilters = normalizeLookupFilters(filters);
  const normalizedSearchText = searchText?.trim();
  const filterItems: EntityQueryFilter[] = [];
  const baseFilterGroup = toFilterGroup(baseFilters);

  if (baseFilterGroup) {
    filterItems.push(baseFilterGroup);
  }

  if (normalizedSearchText) {
    filterItems.push(createIsContainsFilter(displayColumn, normalizedSearchText));
  }

  if (value !== null && value !== undefined && value !== "") {
    filterItems.push(createIsEqualFilter(valueColumn, value));
  }

  return filterItems.length > 0
    ? createFilterCollection(filterItems, EntityLogicalOperation.And)
    : undefined;
}

function toFilterGroup(collection: EntityQueryFilterCollection | undefined): EntityQueryFilter | undefined {
  const items = collection?.items ?? [];

  if (items.length === 0) {
    return undefined;
  }

  return createGroupFilter(collection?.logicalOperation ?? EntityLogicalOperation.And, items);
}

function normalizePositiveInteger(value: unknown, fallback: number): number {
  const numericValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numericValue) && numericValue > 0 ? Math.floor(numericValue) : fallback;
}

function normalizeNonNegativeInteger(value: unknown): number {
  const numericValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numericValue) && numericValue > 0 ? Math.floor(numericValue) : 0;
}

function getVisibleSchemaQueryColumns(schema: EntitySchema): Array<{ path: string; alias?: string }> {
  return schema.columns
    .filter((column) => !column.hidden)
    .map((column) => ({ path: column.path, alias: column.alias }));
}

function getEntityRecordQueryColumns(schema: EntitySchema): Array<{ path: string; alias?: string }> {
  const primaryColumn = schema.primaryColumn ?? "Id";
  const columns = getVisibleSchemaQueryColumns(schema);

  if (!columns.some((column) => column.path === primaryColumn || column.alias === primaryColumn)) {
    columns.unshift({ path: primaryColumn });
  }

  return columns;
}

function getLookupValueColumn(lookup: EntityLookupOptionsSource): string {
  return lookup.valueColumn ?? "Id";
}

function getLookupDisplayColumn(lookup: EntityLookupOptionsSource): string {
  return lookup.displayColumn ?? "Name";
}

function getLookupValueAlias(lookup: EntityLookupOptionsSource): string {
  return lookup.valueAlias ?? getLookupValueColumn(lookup);
}

function getLookupDisplayAlias(lookup: EntityLookupOptionsSource): string {
  return lookup.displayAlias ?? getLookupDisplayColumn(lookup);
}
