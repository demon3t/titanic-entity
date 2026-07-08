import {
  entityQuery,
  type EntityApiColumnValueResponse,
  type EntityApiEntity,
  type ESQ,
  type ESQFilterCollection
} from "@titanic-entity/entity-api";
import { createIsEqualFilter } from "./filters";
import type { EntityDisplayValues } from "./models/EntityDisplayValues";
import type { EntityLookupOptionsSource } from "./models/EntityLookupOptionsSource";
import type { EntitySchema } from "./models/EntitySchema";
import type { EntityValues } from "./models/EntityValues";
import type { LookupOption } from "./models/LookupOption";

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

export function createSchemaSelectQuery(schema: EntitySchema, rowCount = 50): ESQ {
  return entityQuery(schema.tableName)
    .columns(...schema.columns
      .filter((column) => !column.hidden)
      .map((column) => ({ path: column.path, alias: column.alias })))
    .take(rowCount)
    .orders(...(schema.displayColumn ? [{ path: schema.displayColumn }] : []))
    .toJson();
}

export function createPrimaryFilter(schema: EntitySchema, id: unknown): ESQFilterCollection {
  return {
    items: [
      createIsEqualFilter(schema.primaryColumn ?? "Id", id)
    ]
  };
}

export function createLookupQuery(lookup: EntityLookupOptionsSource): ESQ {
  const valueColumn = getLookupValueColumn(lookup);
  const displayColumn = getLookupDisplayColumn(lookup);
  const valueAlias = getLookupValueAlias(lookup);
  const displayAlias = getLookupDisplayAlias(lookup);
  const columns = [
    { path: valueColumn, alias: valueAlias === valueColumn ? undefined : valueAlias },
    ...(displayColumn === valueColumn
      ? []
      : [{ path: displayColumn, alias: displayAlias === displayColumn ? undefined : displayAlias }])
  ];

  return entityQuery({ tableName: lookup.tableName, entityTypeName: lookup.entityTypeName })
    .take(lookup.rowCount ?? 50)
    .columns(...columns)
    .filters(normalizeLookupFilters(lookup.filters))
    .orders(...(lookup.orders ?? [{ path: displayColumn }]))
    .toJson();
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
): ESQFilterCollection | undefined {
  if (!filters) {
    return undefined;
  }

  return Array.isArray(filters) ? { items: filters } : filters;
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
