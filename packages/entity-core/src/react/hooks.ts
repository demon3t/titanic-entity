import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  entityQuery,
  toEntityQueryJson,
  type EntityApiDeleteResult,
  type EntityApiEntity,
  type EntityQueryInput,
  type ESQFilterCollectionJsonModel,
  type ESQJsonModel
} from "@titanic/entity-api";
import { ConditionOperator } from "@titanic/entity-api/enums/ConditionOperator";
import type { EntityColumnSchema } from "../entity/models/EntityColumnSchema";
import type { EntityLookupOptionsSource } from "../entity/models/EntityLookupOptionsSource";
import type { EntitySchema } from "../entity/models/EntitySchema";
import type { EntityValues } from "../entity/models/EntityValues";
import type { LookupOption } from "../entity/models/LookupOption";
import { getColumnKey } from "../entity/schema";
import { useEntityApiClient, useOptionalEntityApiClient } from "./EntityApiProvider";
import type { AsyncState } from "./models/AsyncState";
import type { UseEntityQueryOptions } from "./models/UseEntityQueryOptions";

export type { AsyncState } from "./models/AsyncState";
export type { UseEntityQueryOptions } from "./models/UseEntityQueryOptions";

const EMPTY_LOOKUP_OPTIONS: LookupOption[] = [];

export interface UseEntityLookupOptionsOptions {
  enabled?: boolean;
  dependencies?: unknown[];
}

export interface UseEntityLookupOptionsResult extends AsyncState<LookupOption[]> {
  options: LookupOption[];
  reload: () => Promise<LookupOption[]>;
  source: "api" | "static";
}

/**
 * Выполнить ESQ select и хранить состояние загрузки для React UI.
 */
export function useEntityQuery(query: EntityQueryInput, options: UseEntityQueryOptions = {}) {
  const client = useEntityApiClient();
  const queryJson = useMemo(() => toEntityQueryJson(query), [query]);
  const queryFingerprint = useMemo(() => JSON.stringify(queryJson), [queryJson]);
  const queryJsonRef = useRef(queryJson);
  const enabled = options.enabled ?? true;
  const dependencies = options.dependencies ?? [queryFingerprint];
  const [state, setState] = useState<AsyncState<EntityApiEntity[]>>({ data: null, loading: enabled, error: null });

  useEffect(() => {
    queryJsonRef.current = queryJson;
  }, [queryFingerprint, queryJson]);

  const reload = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await client.select(queryJsonRef.current);
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error(String(error));
      setState({ data: null, loading: false, error: normalized });
      throw normalized;
    }
  }, [client]);

  useEffect(() => {
    if (!enabled) {
      setState((current) => ({ ...current, loading: false }));
      return;
    }

    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, reload, ...dependencies]);

  return { ...state, reload };
}

/**
 * Загрузить lookup-опции из Entity ORM API, если настроен column.lookup.
 * Статические column.options остаются fallback, пока данные загружаются или API недоступен.
 */
export function useEntityLookupOptions(
  column: EntityColumnSchema,
  options: UseEntityLookupOptionsOptions = {}
): UseEntityLookupOptionsResult {
  const client = useOptionalEntityApiClient();
  const staticOptions = column.options ?? EMPTY_LOOKUP_OPTIONS;
  const lookup = column.lookup;
  const lookupKey = JSON.stringify(lookup ?? null);
  const enabled = Boolean(client && lookup && lookup.enabled !== false && (options.enabled ?? true));
  const dependencies = options.dependencies ?? [lookupKey];
  const [state, setState] = useState<AsyncState<LookupOption[]>>({
    data: null,
    loading: enabled,
    error: null
  });

  const reload = useCallback(async () => {
    if (!client || !lookup || lookup.enabled === false) {
      setState({ data: null, loading: false, error: null });
      return staticOptions;
    }

    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const query = createLookupQuery(lookup);
      const rows = await client.select(query);
      const data = mapLookupRows(rows, lookup);
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error(String(error));
      setState({ data: null, loading: false, error: normalized });
      return staticOptions;
    }
  }, [client, lookupKey, staticOptions]);

  useEffect(() => {
    if (!enabled) {
      setState((current) => ({ ...current, loading: false }));
      return;
    }

    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, reload, ...dependencies]);

  return {
    ...state,
    options: state.data ?? staticOptions,
    reload,
    source: state.data ? "api" : "static"
  };
}

/**
 * Получить функцию Save и состояние ее выполнения.
 */
export function useEntitySave(tableName: string) {
  const client = useEntityApiClient();
  const [state, setState] = useState<AsyncState<EntityApiEntity>>({ data: null, loading: false, error: null });

  const save = useCallback(async (values: EntityValues) => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await client.save(tableName, values);
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error(String(error));
      setState({ data: null, loading: false, error: normalized });
      throw normalized;
    }
  }, [client, tableName]);

  return { ...state, save };
}

/**
 * Получить функцию Delete и состояние ее выполнения.
 */
export function useEntityDelete(tableName: string) {
  const client = useEntityApiClient();
  const [state, setState] = useState<AsyncState<EntityApiDeleteResult>>({ data: null, loading: false, error: null });

  const deleteByFilter = useCallback(async (filter: Record<string, unknown>) => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await client.delete(tableName, filter);
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error(String(error));
      setState({ data: null, loading: false, error: normalized });
      throw normalized;
    }
  }, [client, tableName]);

  return { ...state, deleteByFilter };
}

/**
 * Создать базовый ESQ select по UI-схеме.
 */
export function useSchemaSelectQuery(schema: EntitySchema, rowCount = 50): ESQJsonModel {
  return useMemo(() => entityQuery(schema.tableName)
    .columns(...schema.columns
      .filter((column) => !column.hidden)
      .map((column) => ({ path: column.path, alias: column.alias })))
    .take(rowCount)
    .orders(...(schema.displayColumn ? [{ path: schema.displayColumn }] : []))
    .toJson(), [schema, rowCount]);
}

/**
 * Создать фильтр по primary key сущности.
 */
export function createPrimaryFilter(schema: EntitySchema, id: unknown) {
  return {
    items: [
      {
        path: schema.primaryColumn ?? "Id",
        comparisonType: ConditionOperator.Equal,
        value: id
      }
    ]
  };
}

/**
 * Подготовить значения формы к Save-запросу Entity API.
 */
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

function createLookupQuery(lookup: EntityLookupOptionsSource): ESQJsonModel {
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

function normalizeLookupFilters(
  filters: EntityLookupOptionsSource["filters"]
): ESQFilterCollectionJsonModel | undefined {
  if (!filters) {
    return undefined;
  }

  return Array.isArray(filters) ? { items: filters } : filters;
}

function mapLookupRows(rows: EntityApiEntity[], lookup: EntityLookupOptionsSource): LookupOption[] {
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
