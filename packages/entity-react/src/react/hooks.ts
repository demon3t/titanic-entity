import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  toEntityQueryJson,
  type EntityApiDeleteResult,
  type EntityApiEntity,
  type EntityQueryInput,
  type ESQ
} from "@titanic-entity/entity-api";
import {
  createLookupQuery,
  createSchemaSelectQuery,
  mapLookupRows,
  type EntityColumnSchema,
  type EntitySchema,
  type EntityValues,
  type LookupOption
} from "@titanic-entity/entity-core";
import { useEntityApiClient, useOptionalEntityApiClient } from "./EntityApiProvider";
import type { AsyncState } from "./models/AsyncState";
import type { UseEntityQueryOptions } from "./models/UseEntityQueryOptions";

export type { AsyncState } from "./models/AsyncState";
export type { UseEntityQueryOptions } from "./models/UseEntityQueryOptions";
export { createPrimaryFilter, getSaveValues } from "@titanic-entity/entity-core";

const EMPTY_LOOKUP_OPTIONS: LookupOption[] = [];

export interface UseEntityLookupOptionsOptions {
  enabled?: boolean;
  dependencies?: unknown[];
  rowCount?: number;
  searchText?: string;
}

export interface EntityLookupOptionsLoadRequest {
  append?: boolean;
  rowCount?: number;
  searchText?: string;
  skip?: number;
  value?: string | number | null;
}

export interface UseEntityLookupOptionsResult extends AsyncState<LookupOption[]> {
  options: LookupOption[];
  reload: (request?: EntityLookupOptionsLoadRequest) => Promise<LookupOption[]>;
  loadMore: () => Promise<LookupOption[]>;
  hasMore: boolean;
  loadingMore: boolean;
  source: "api" | "static";
}

export function useEntityQuery(query: EntityQueryInput, options: UseEntityQueryOptions = {}) {
  const client = useEntityApiClient();
  const queryJson = useMemo(() => toEntityQueryJson(query), [query]);
  const queryFingerprint = useMemo(() => JSON.stringify(queryJson), [queryJson]);
  const queryJsonRef = useRef(queryJson);
  const enabled = options.enabled ?? true;
  const dependencies = options.dependencies ?? [queryFingerprint];
  const [state, setState] = useState<AsyncState<EntityApiEntity[]>>({
    data: null,
    loading: enabled,
    error: null
  });

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

export function useEntityLookupOptions(
  column: EntityColumnSchema,
  options: UseEntityLookupOptionsOptions = {}
): UseEntityLookupOptionsResult {
  const client = useOptionalEntityApiClient();
  const staticOptions = column.options ?? EMPTY_LOOKUP_OPTIONS;
  const lookup = column.lookup;
  const lookupKey = JSON.stringify(lookup ?? null);
  const rowCount = normalizeLookupRowCount(options.rowCount ?? lookup?.rowCount);
  const searchText = options.searchText ?? "";
  const enabled = Boolean(client && lookup && lookup.enabled !== false && (options.enabled ?? true));
  const dependencies = options.dependencies ?? [lookupKey, rowCount, searchText];
  const [state, setState] = useState<AsyncState<LookupOption[]>>({
    data: null,
    loading: enabled,
    error: null
  });
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const dataRef = useRef<LookupOption[] | null>(null);

  useEffect(() => {
    dataRef.current = state.data;
  }, [state.data]);

  const reload = useCallback(async (request: EntityLookupOptionsLoadRequest = {}) => {
    const requestRowCount = normalizeLookupRowCount(request.rowCount ?? rowCount);
    const requestSearchText = request.searchText ?? searchText;
    const requestSkip = normalizeLookupSkip(request.skip);
    const requestValue = request.value;
    const append = Boolean(request.append && requestSkip > 0);

    if (!client || !lookup || lookup.enabled === false) {
      const page = readStaticLookupPage(staticOptions, requestSearchText, requestSkip, requestRowCount, requestValue);
      const data = append ? mergeLookupOptions(dataRef.current ?? [], page.options) : page.options;

      dataRef.current = data;
      setState({ data, loading: false, error: null });
      setHasMore(page.hasMore);

      return data;
    }

    if (append) {
      setLoadingMore(true);
    } else {
      setState((current) => ({ ...current, loading: true, error: null }));
    }

    try {
      const rows = await client.select(createLookupQuery(lookup, {
        rowCount: requestRowCount,
        searchText: requestSearchText,
        skip: requestSkip,
        value: requestValue
      }));
      const pageOptions = mapLookupRows(rows, lookup);
      const data = append ? mergeLookupOptions(dataRef.current ?? [], pageOptions) : pageOptions;

      dataRef.current = data;
      setState({ data, loading: false, error: null });
      setHasMore(pageOptions.length >= requestRowCount);

      return data;
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error(String(error));
      const page = readStaticLookupPage(staticOptions, requestSearchText, requestSkip, requestRowCount, requestValue);
      const data = append ? mergeLookupOptions(dataRef.current ?? [], page.options) : page.options;

      dataRef.current = data;
      setState({ data, loading: false, error: normalized });
      setHasMore(page.hasMore);

      return data;
    } finally {
      if (append) {
        setLoadingMore(false);
      }
    }
  }, [client, lookup, rowCount, searchText, staticOptions]);

  const loadMore = useCallback(() => {
    if (state.loading || loadingMore || !hasMore) {
      return Promise.resolve(dataRef.current ?? []);
    }

    return reload({
      append: true,
      rowCount,
      searchText,
      skip: dataRef.current?.length ?? 0
    });
  }, [hasMore, loadingMore, reload, rowCount, searchText, state.loading]);

  useEffect(() => {
    if (!enabled) {
      setState((current) => ({ ...current, loading: false }));
      return;
    }

    void reload({ rowCount, searchText, skip: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, reload, ...dependencies]);

  const fallbackPage = readStaticLookupPage(staticOptions, searchText, 0, rowCount);

  return {
    ...state,
    hasMore,
    loadingMore,
    options: state.data ?? fallbackPage.options,
    loadMore,
    reload,
    source: client && lookup && lookup.enabled !== false && state.data ? "api" : "static"
  };
}

function readStaticLookupPage(
  options: readonly LookupOption[],
  searchText: string,
  skip: number,
  rowCount: number,
  value?: string | number | null
): { options: LookupOption[]; hasMore: boolean } {
  const filteredOptions = filterStaticLookupOptions(options, searchText, value);

  return {
    options: filteredOptions.slice(skip, skip + rowCount),
    hasMore: skip + rowCount < filteredOptions.length
  };
}

function filterStaticLookupOptions(
  options: readonly LookupOption[],
  searchText: string,
  value?: string | number | null
): LookupOption[] {
  const normalizedSearchText = searchText.trim().toLocaleLowerCase();
  const normalizedValue = normalizeLookupValue(value);
  const valueFilteredOptions = normalizedValue
    ? options.filter((option) => normalizeLookupValue(option.value) === normalizedValue)
    : options;

  if (!normalizedSearchText) {
    return [...valueFilteredOptions];
  }

  return valueFilteredOptions.filter((option) =>
    String(option.displayValue).toLocaleLowerCase().includes(normalizedSearchText) ||
    String(option.value).toLocaleLowerCase().includes(normalizedSearchText)
  );
}

function normalizeLookupValue(value: string | number | null | undefined): string {
  return value == null ? "" : String(value);
}

function mergeLookupOptions(current: readonly LookupOption[], next: readonly LookupOption[]): LookupOption[] {
  const values = new Set<string>();
  const result: LookupOption[] = [];

  for (const option of [...current, ...next]) {
    const key = String(option.value);

    if (values.has(key)) {
      continue;
    }

    values.add(key);
    result.push(option);
  }

  return result;
}

function normalizeLookupRowCount(value: unknown): number {
  const numericValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numericValue) && numericValue > 0 ? Math.floor(numericValue) : 15;
}

function normalizeLookupSkip(value: unknown): number {
  const numericValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numericValue) && numericValue > 0 ? Math.floor(numericValue) : 0;
}

export function useEntitySave(tableName: string) {
  const client = useEntityApiClient();
  const [state, setState] = useState<AsyncState<EntityApiEntity>>({
    data: null,
    loading: false,
    error: null
  });

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

export function useEntityDelete(tableName: string) {
  const client = useEntityApiClient();
  const [state, setState] = useState<AsyncState<EntityApiDeleteResult>>({
    data: null,
    loading: false,
    error: null
  });

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

export function useSchemaSelectQuery(schema: EntitySchema, rowCount = 50): ESQ {
  return useMemo(() => createSchemaSelectQuery(schema, rowCount), [schema, rowCount]);
}
