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
}

export interface UseEntityLookupOptionsResult extends AsyncState<LookupOption[]> {
  options: LookupOption[];
  reload: () => Promise<LookupOption[]>;
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
      const rows = await client.select(createLookupQuery(lookup));
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
