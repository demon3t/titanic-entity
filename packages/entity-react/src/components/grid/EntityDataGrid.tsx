import { isValidElement, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent, type ReactNode } from "react";
import {
  EntityGridColumnSettingsApiClient,
  entityQuery,
  getEntityValue,
  toEntityQueryJson,
  type EntityApiEntity,
  type EntityApiManagerStructureResponse,
  type EntityApiStructureColumnResponse,
  type EntityApiStructureEntityResponse,
  type ESQ,
  type ESQColumn,
  type ESQFilter
} from "@titanic-entity/entity-api";
import { getCellDisplayValue, toEntityValues } from "@titanic-entity/entity-core";
import { Titanic } from "@titanic-entity/entity-base";
import { defaultEntityDataGridCulture, getEntityDataGridLabels } from "../../resources/EntityDataGrid";
import { EntityDataGridRowContextMenu } from "../context-menus/EntityDataGridRowContextMenu";
import { RandomGifLoader } from "../feedback/RandomGifLoader";
import { SiteIconDropdown } from "../site/SiteIconDropdown";
import { createEntityDataGridColumnSettingsPackage } from "../../grids";
import {
  titanicCommonIcons,
  titanicDataGridRowActionIcons,
  titanicDataGridSettingsIcons
} from "../icons/titanicIcons";
import { ResourceSvgIcon } from "../icons/ResourceSvgIcon";
import type {
  EntityDataGridColumnPickerLabels,
  EntityDataGridEntityDescriptor,
  EntityDataGridProps,
  EntityDataGridQueryContext,
  EntityDataGridQueryFactory,
  EntityDataGridQueryInput,
  EntityDataGridRowAction,
  EntityDataGridRowActionContext
} from "../../grids";
import {
  defaultEntityDataGridSettings,
  type EntityDataGridColumn,
  type EntityDataGridColumnSettingsMode,
  type EntityDataGridColumnSetting,
  type EntityDataGridLabels,
  type EntityDataGridModeSettingsMap,
  type EntityDataGridSettings,
  type EntityDataGridUserSettings
} from "../../grids";

export type {
  EntityDataGridColumn,
  EntityDataGridColumnSettingsMode,
  EntityDataGridColumnSetting,
  EntityDataGridLabels,
  EntityDataGridModeSettingsMap,
  EntityDataGridSettings,
  EntityDataGridUserSettings
} from "../../grids";
export type {
  EntityDataGridColumnPickerLabels,
  EntityDataGridEntityDescriptor,
  EntityDataGridProps,
  EntityDataGridQueryContext,
  EntityDataGridQueryFactory,
  EntityDataGridQueryInput,
  EntityDataGridRowAction,
  EntityDataGridRowActionContext
} from "../../grids";

interface VisibleGridColumn<TRow> extends EntityDataGridColumn<TRow> {
  settingId: string;
  span?: number;
}

export type EntityDataGridResolvedColumn<TRow = unknown> = VisibleGridColumn<TRow>;

type ResolvedEntityDataGridSettings = Omit<EntityDataGridSettings, "labels"> & {
  labels: EntityDataGridLabels;
};

interface RowMenuState<TRow> {
  actions: EntityDataGridRowAction<TRow>[];
  left: number;
  loadingActionKey: string | null;
  row: TRow;
  rowIndex: number;
  rowKey: string;
  top: number;
}

const rowMenuActionSize = 32;
const rowMenuGap = 4;
const rowMenuPadding = 4;
const rowMenuRightInset = 12;
const rowMenuViewportMargin = 12;
const defaultColumnSettingsMode: EntityDataGridColumnSettingsMode = "list";
const relatedColumnMaxDepth = 3;

export function EntityDataGrid<TRow = EntityApiEntity>({
  gridId,
  title,
  client,
  columnSettingsClient,
  currentUserId,
  entity,
  tableName,
  primaryColumn,
  query,
  createQuery,
  rows,
  mapRows,
  columns,
  columnLabels,
  columnPickerLabels,
  defaultVisibleColumnKeys,
  visibleColumnKeys,
  filter,
  filters,
  orders,
  rowCount,
  batchRowCount,
  gridWidth,
  editable,
  rowActions,
  refreshKey,
  loading = false,
  loaderCollection,
  emptyText,
  labels,
  settings,
  className = "",
  activeRowKey,
  getRowKey,
  onVisibleColumnKeysChange,
  onRowsLoaded,
  onRowClick,
  onRowDoubleClick
}: EntityDataGridProps<TRow>) {
  const gridSettings = useMemo(() => mergeGridSettings(settings, labels), [labels, settings]);
  const columnSettingsPackage = useMemo(() => createEntityDataGridColumnSettingsPackage<TRow>(), []);
  const resolvedEntity = useMemo(
    () => resolveGridEntity(entity, tableName, primaryColumn),
    [entity, primaryColumn, tableName]
  );
  const effectiveFilters = useMemo(
    () => normalizeGridFilters(filter, filters),
    [filter, filters]
  );
  const effectiveBatchRowCount = batchRowCount ?? rowCount ?? gridSettings.batchRowCount ?? gridSettings.defaultRowCount;
  const effectiveGridWidth = gridWidth ?? gridSettings.gridWidth;
  const effectiveEditable = editable ?? gridSettings.editable;
  const [structure, setStructure] = useState<EntityApiManagerStructureResponse | null>(null);
  const [structureLoading, setStructureLoading] = useState(false);
  const [internalRows, setInternalRows] = useState<TRow[]>([]);
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalHasMoreRows, setInternalHasMoreRows] = useState(true);
  const [internalPageIndex, setInternalPageIndex] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [totalsSettingsOpen, setTotalsSettingsOpen] = useState(false);
  const [columnSettingsLoading, setColumnSettingsLoading] = useState(false);
  const [columnSettingsSaving, setColumnSettingsSaving] = useState(false);
  const [columnSettingsError, setColumnSettingsError] = useState<string | null>(null);
  const [rowActionError, setRowActionError] = useState<string | null>(null);
  const [rowMenuState, setRowMenuState] = useState<RowMenuState<TRow> | null>(null);
  const [dataRefreshKey, setDataRefreshKey] = useState(0);
  const [customStructureColumnKeys, setCustomStructureColumnKeys] = useState<string[]>([]);
  const [localGridUserSettings, setLocalGridUserSettings] = useState<EntityDataGridUserSettings | null>(() =>
    readStoredGridUserSettings(gridSettings, gridId)
  );
  const onRowsLoadedRef = useRef(onRowsLoaded);
  const rootRef = useRef<HTMLElement | null>(null);
  const tableWrapRef = useRef<HTMLDivElement | null>(null);
  const requestedPageIndexRef = useRef(0);
  const rowClickTimerRef = useRef<number | null>(null);
  const effectiveColumnSettingsClient = useMemo(
    () => columnSettingsClient ?? (client ? new EntityGridColumnSettingsApiClient(client) : undefined),
    [client, columnSettingsClient]
  );
  const effectiveColumnPickerLabels = useMemo(
    () => mergeColumnPickerLabels(columnPickerLabels, resolvedEntity.tableName, columnLabels),
    [columnLabels, columnPickerLabels, resolvedEntity.tableName]
  );

  useEffect(() => {
    onRowsLoadedRef.current = onRowsLoaded;
  }, [onRowsLoaded]);

  useEffect(() => {
    setCustomStructureColumnKeys([]);
  }, [gridId, resolvedEntity.tableName]);

  useEffect(() => {
    if (!client || !resolvedEntity.tableName) {
      setStructure(null);
      return;
    }

    let cancelled = false;
    setStructureLoading(true);
    setError(null);

    client
      .getStructure()
      .then((structure) => {
        if (cancelled) {
          return;
        }

        setStructure(structure);
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError : new Error(String(requestError)));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setStructureLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [client, resolvedEntity.tableName]);

  useEffect(() => {
    if (!gridSettings.persistColumnSettings || !effectiveColumnSettingsClient || !currentUserId) {
      return;
    }

    let cancelled = false;
    setColumnSettingsLoading(true);
    setColumnSettingsError(null);

    effectiveColumnSettingsClient
      .getEntityGridColumnDefaultSettings(gridId, currentUserId)
      .then((storedSettings) => {
        if (cancelled || !storedSettings || (
          !storedSettings.columns.length &&
          !storedSettings.displayMode &&
          !storedSettings.columnSettingsMode &&
          !hasGridModeSettings(storedSettings.modeSettings)
        )) {
          return;
        }

        const nextGridUserSettings = normalizeGridUserSettings(storedSettings);
        setLocalGridUserSettings((currentSettings) => {
          if (currentSettings) {
            return currentSettings;
          }

          writeStoredGridUserSettings(gridSettings, gridId, nextGridUserSettings);
          return nextGridUserSettings;
        });
      })
      .catch((requestError) => {
        if (!cancelled) {
          setColumnSettingsError(requestError instanceof Error ? requestError.message : gridSettings.labels.columnSettingsLoadError);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setColumnSettingsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentUserId, effectiveColumnSettingsClient, gridId, gridSettings]);

  const structureColumns = useMemo(() => {
    if (!structure || !resolvedEntity.tableName) {
      return [];
    }

    return structure.entities.find((item) => item.tableName === resolvedEntity.tableName)?.columns ?? [];
  }, [resolvedEntity.tableName, structure]);
  const structureGridColumns = useMemo(
    () => structure && resolvedEntity.tableName
      ? createGridColumnsFromStructure<TRow>(structure, resolvedEntity.tableName, effectiveColumnPickerLabels)
      : structureColumns.map((column) => toGridColumn<TRow>(column, effectiveColumnPickerLabels, resolvedEntity.tableName)),
    [effectiveColumnPickerLabels, resolvedEntity.tableName, structure, structureColumns]
  );
  const configuredColumnKeys = useMemo(
    () => [
      ...customStructureColumnKeys,
      ...getGridUserSettingsColumnKeys(localGridUserSettings),
      ...(visibleColumnKeys ?? [])
    ],
    [customStructureColumnKeys, localGridUserSettings, visibleColumnKeys]
  );
  const customStructureColumns = useMemo(
    () => structure && resolvedEntity.tableName
      ? createGridColumnsForPathsFromStructure<TRow>(
          structure,
          resolvedEntity.tableName,
          configuredColumnKeys,
          effectiveColumnPickerLabels
        )
      : [],
    [configuredColumnKeys, effectiveColumnPickerLabels, resolvedEntity.tableName, structure]
  );
  const availableColumns = useMemo(() => {
    const explicitColumns = columns?.length ? columns : [];
    const baseColumns = explicitColumns.length
      ? mergeGridColumns(explicitColumns, structureGridColumns)
      : structureGridColumns;

    return customStructureColumns.length
      ? mergeGridColumns(baseColumns, customStructureColumns)
      : baseColumns;
  }, [columns, customStructureColumns, structureGridColumns]);
  const effectiveColumnSettingsMode = localGridUserSettings?.displayMode ?? localGridUserSettings?.columnSettingsMode ?? defaultColumnSettingsMode;

  const effectiveColumnSettings = useMemo(() => {
    if (visibleColumnKeys) {
      return normalizeColumnSettings(availableColumns, createColumnSettingsFromKeys(availableColumns, visibleColumnKeys), defaultVisibleColumnKeys);
    }

    const modeColumnSettings = getGridUserSettingsModeColumnSettings(localGridUserSettings, effectiveColumnSettingsMode);

    if (modeColumnSettings.length) {
      return normalizeColumnSettings(availableColumns, modeColumnSettings, defaultVisibleColumnKeys);
    }

    return normalizeColumnSettings(
      availableColumns,
      createColumnSettingsFromKeys(availableColumns, defaultVisibleColumnKeys ?? getDefaultVisibleColumnKeys(availableColumns)),
      defaultVisibleColumnKeys
    );
  }, [availableColumns, defaultVisibleColumnKeys, effectiveColumnSettingsMode, localGridUserSettings, visibleColumnKeys]);

  const visibleColumns = useMemo<VisibleGridColumn<TRow>[]>(() => {
    const columnByKey = new Map(availableColumns.map((column) => [column.key, column]));
    const nextColumns: VisibleGridColumn<TRow>[] = [];

    effectiveColumnSettings
      .filter((setting) => setting.visible)
      .forEach((setting, index) => {
        const column = columnByKey.get(setting.key);
        const width = setting.width ?? column?.width;

        if (column) {
          nextColumns.push({
            ...column,
            label: setting.label ?? column.label,
            settingId: setting.id ?? createColumnSettingId(setting.key, index),
            span: setting.span,
            ...(width ? { width } : {})
          });
        }
      });

    return nextColumns;
  }, [availableColumns, effectiveColumnSettings]);
  const dataGridTemplate = useMemo(
    () => effectiveColumnSettingsMode === "tile"
      ? getTileGridTemplate(effectiveGridWidth)
      : getColumnGridTemplate(visibleColumns, effectiveGridWidth),
    [effectiveColumnSettingsMode, effectiveGridWidth, visibleColumns]
  );
  const getCellStyle = useCallback((column: VisibleGridColumn<TRow>) =>
    effectiveColumnSettingsMode === "tile"
      ? ({
          "--titanic-data-grid-cell-span": String(getColumnRenderSpan(column, effectiveGridWidth))
        } as CSSProperties)
      : undefined,
  [effectiveColumnSettingsMode, effectiveGridWidth]);

  const renderedRows = rows ?? internalRows;
  useEffect(() => {
    onRowsLoadedRef.current?.([...renderedRows]);
  }, [renderedRows]);

  const effectiveLoading = loading || structureLoading || columnSettingsLoading || (internalLoading && renderedRows.length === 0);
  const loadingMoreRows = internalLoading && renderedRows.length > 0;
  const showColumnHeader = effectiveColumnSettingsMode === "list";
  const rootClassName = [
    "titanic-data-grid",
    `titanic-data-grid_layout_${effectiveColumnSettingsMode}`,
    className
  ].filter(Boolean).join(" ");
  const rootStyle = useMemo(() => ({
    "--titanic-grid-columns": String(effectiveGridWidth),
    "--titanic-data-grid-template": dataGridTemplate
  }) as CSSProperties, [dataGridTemplate, effectiveGridWidth]);
  const effectiveVisibleColumnKeys = useMemo(
    () => effectiveColumnSettings.filter((setting) => setting.visible).map((setting) => setting.key),
    [effectiveColumnSettings]
  );
  const queryColumnKeys = useMemo(
    () => getQueryColumnKeys(availableColumns, effectiveVisibleColumnKeys),
    [availableColumns, effectiveVisibleColumnKeys]
  );
  const hasCustomQuery = Boolean(query || createQuery);
  const queryFingerprint = useMemo(
    () => JSON.stringify({
      createQuery: createQuery ? String(createQuery) : null,
      query: query && !isEntityDataGridQueryFactory(query) ? toEntityQueryJson(query) : null,
      queryFactory: query && isEntityDataGridQueryFactory(query) ? String(query) : null,
      entityTypeName: resolvedEntity.entityTypeName,
      filters: effectiveFilters,
      orders,
      pageSize: effectiveBatchRowCount,
      queryColumnKeys,
      refreshKey,
      tableName: resolvedEntity.tableName,
      dataRefreshKey
    }),
    [createQuery, dataRefreshKey, effectiveBatchRowCount, effectiveFilters, orders, query, queryColumnKeys, refreshKey, resolvedEntity.entityTypeName, resolvedEntity.tableName]
  );

  useEffect(() => {
    if (rows) {
      return;
    }

    setInternalRows([]);
    setInternalHasMoreRows(true);
    setInternalPageIndex(0);
    requestedPageIndexRef.current = 0;
    setRowMenuState(null);
  }, [queryFingerprint, rows]);

  useEffect(() => {
    requestedPageIndexRef.current = internalPageIndex;
  }, [internalPageIndex]);

  useEffect(() => {
    if (
      rows ||
      !client ||
      (!hasCustomQuery && !resolvedEntity.tableName && !resolvedEntity.entityTypeName) ||
      (!hasCustomQuery && queryColumnKeys.length === 0) ||
      columnSettingsLoading ||
      !internalHasMoreRows
    ) {
      return;
    }

    let cancelled = false;
    const skipRow = internalPageIndex * effectiveBatchRowCount;
    const queryContext: EntityDataGridQueryContext = {
      columnPaths: queryColumnKeys,
      columns: queryColumnKeys,
      entity: resolvedEntity,
      entityTypeName: resolvedEntity.entityTypeName,
      filters: effectiveFilters,
      orders,
      pageIndex: internalPageIndex,
      pageSize: effectiveBatchRowCount,
      primaryColumn: resolvedEntity.primaryColumn,
      rowCount: effectiveBatchRowCount,
      skipRow,
      tableName: resolvedEntity.tableName
    };
    const customQuery = resolveEntityDataGridQueryInput(query, createQuery, queryContext);
    const selectQuery = mergeDataGridSelectQueryColumns(
      customQuery
        ? toEntityQueryJson(customQuery)
        : entityQuery(
            resolvedEntity.tableName
              ? resolvedEntity.tableName
              : { entityTypeName: resolvedEntity.entityTypeName }
          )
            .filters(effectiveFilters.length > 0 ? [...effectiveFilters] : [])
            .orders(...(orders ?? []))
            .toJson(),
      queryColumnKeys,
      skipRow,
      effectiveBatchRowCount
    );

    if (!selectQuery) {
      setInternalHasMoreRows(false);
      return;
    }

    setInternalLoading(true);
    setError(null);

    client
      .select(selectQuery)
      .then(async (entityRows) => ({
        mappedRows: await Promise.resolve(mapRows ? mapRows(entityRows) : entityRows as TRow[]),
        sourceRowCount: entityRows.length
      }))
      .then(({ mappedRows, sourceRowCount }) => {
        if (cancelled) {
          return;
        }

        const nextRows = mappedRows;
        setInternalHasMoreRows(sourceRowCount >= effectiveBatchRowCount);
        setInternalRows((currentRows) => {
          return internalPageIndex === 0
            ? nextRows
            : [...currentRows, ...nextRows];
        });
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError : new Error(String(requestError)));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setInternalLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    client,
    columnSettingsLoading,
    internalHasMoreRows,
    internalPageIndex,
    mapRows,
    queryFingerprint,
    rows
  ]);

  const requestNextRowsPage = useCallback(() => {
    if (rows || internalLoading || !internalHasMoreRows) {
      return;
    }

    setInternalPageIndex((currentPageIndex) => {
      if (requestedPageIndexRef.current > currentPageIndex) {
        return currentPageIndex;
      }

      const nextPageIndex = currentPageIndex + 1;
      requestedPageIndexRef.current = nextPageIndex;
      return nextPageIndex;
    });
  }, [internalHasMoreRows, internalLoading, rows]);

  const handleLoadMoreScroll = useCallback(() => {
    const wrapElement = tableWrapRef.current;
    const hasInternalScroll = Boolean(wrapElement && wrapElement.scrollHeight > wrapElement.clientHeight + 1);
    const isInternalScrollBottom = Boolean(
      wrapElement &&
      hasInternalScroll &&
      wrapElement.scrollTop + wrapElement.clientHeight >= wrapElement.scrollHeight - 96
    );

    if (isInternalScrollBottom || isGridNearViewportBottom(rootRef.current)) {
      requestNextRowsPage();
    }
  }, [requestNextRowsPage]);

  useEffect(() => {
    if (rows || !internalHasMoreRows) {
      return;
    }

    const wrapElement = tableWrapRef.current;
    const scrollListenerOptions: AddEventListenerOptions = { capture: true, passive: true };
    wrapElement?.addEventListener("scroll", handleLoadMoreScroll, { passive: true });
    window.addEventListener("scroll", handleLoadMoreScroll, scrollListenerOptions);
    window.addEventListener("resize", handleLoadMoreScroll);
    const frameId = window.requestAnimationFrame(handleLoadMoreScroll);

    return () => {
      window.cancelAnimationFrame(frameId);
      wrapElement?.removeEventListener("scroll", handleLoadMoreScroll);
      window.removeEventListener("scroll", handleLoadMoreScroll, scrollListenerOptions);
      window.removeEventListener("resize", handleLoadMoreScroll);
    };
  }, [handleLoadMoreScroll, internalHasMoreRows, renderedRows.length, rows]);

  useEffect(() => {
    if (!rowMenuState) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest(".titanic-data-grid__row-menu")) {
        setRowMenuState(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setRowMenuState(null);
      }
    };
    const handleWindowChange = () => setRowMenuState(null);

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleWindowChange);
    window.addEventListener("scroll", handleWindowChange, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleWindowChange);
      window.removeEventListener("scroll", handleWindowChange, true);
    };
  }, [rowMenuState]);

  const clearPendingRowClick = useCallback(() => {
    if (rowClickTimerRef.current == null) {
      return;
    }

    window.clearTimeout(rowClickTimerRef.current);
    rowClickTimerRef.current = null;
  }, []);

  useEffect(() => () => {
    clearPendingRowClick();
  }, [clearPendingRowClick]);

  const refreshData = useCallback(() => {
    setRowMenuState(null);
    setRowActionError(null);
    setDataRefreshKey((value) => value + 1);
  }, []);

  const applyColumnSettings = useCallback(async (
    nextSettings: readonly EntityDataGridColumnSetting[],
    saveAsDefault: boolean,
    nextColumnSettingsMode: EntityDataGridColumnSettingsMode =
      localGridUserSettings?.displayMode ?? localGridUserSettings?.columnSettingsMode ?? defaultColumnSettingsMode,
    nextModeSettings?: EntityDataGridModeSettingsMap
  ) => {
    const requestedColumnKeys = [
      ...nextSettings.map(getColumnSettingPath),
      ...getGridModeSettingsColumnKeys(nextModeSettings)
    ];
    const extraColumns = structure && resolvedEntity.tableName
      ? createGridColumnsForPathsFromStructure<TRow>(
          structure,
          resolvedEntity.tableName,
          requestedColumnKeys,
          effectiveColumnPickerLabels
        )
      : [];
    const nextAvailableColumns = extraColumns.length
      ? mergeGridColumns(availableColumns, extraColumns)
      : availableColumns;
    const normalizedSettings = normalizeColumnSettings(nextAvailableColumns, nextSettings, defaultVisibleColumnKeys);
    const persistedSettings = normalizedSettings.filter((setting) => setting.visible);
    const normalizedModeSettings = normalizeGridModeSettingsForStorage(
      nextAvailableColumns,
      {
        ...nextModeSettings,
        [nextColumnSettingsMode]: { columns: normalizedSettings }
      },
      defaultVisibleColumnKeys
    );
    const nextVisibleColumnKeys = normalizedSettings.filter((setting) => setting.visible).map((setting) => setting.key);
    const nextGridUserSettings = normalizeGridUserSettings({
      columns: persistedSettings,
      displayMode: nextColumnSettingsMode,
      columnSettingsMode: nextColumnSettingsMode,
      modeSettings: normalizedModeSettings
    });

    if (extraColumns.length > 0) {
      setCustomStructureColumnKeys((currentKeys) => [
        ...currentKeys,
        ...extraColumns
          .map((column) => column.key)
          .filter((key) => !currentKeys.includes(key))
      ]);
    }

    setLocalGridUserSettings(nextGridUserSettings);
    writeStoredGridUserSettings(gridSettings, gridId, nextGridUserSettings);
    onVisibleColumnKeysChange?.(nextVisibleColumnKeys);

    if (!saveAsDefault) {
      setSettingsOpen(false);
      return;
    }

    if (!effectiveColumnSettingsClient || !currentUserId) {
      setSettingsOpen(false);
      return;
    }

    setColumnSettingsSaving(true);
    setColumnSettingsError(null);

    try {
      await effectiveColumnSettingsClient.saveEntityGridColumnDefaultSettings({
        gridId,
        userId: currentUserId,
        columns: persistedSettings,
        displayMode: nextGridUserSettings.displayMode,
        columnSettingsMode: nextGridUserSettings.columnSettingsMode,
        modeSettings: nextGridUserSettings.modeSettings,
        isDefault: true
      });
      setSettingsOpen(false);
    } catch (requestError) {
      setColumnSettingsError(requestError instanceof Error ? requestError.message : gridSettings.labels.columnSettingsSaveError);
    } finally {
      setColumnSettingsSaving(false);
    }
  }, [
    availableColumns,
    currentUserId,
    defaultVisibleColumnKeys,
    effectiveColumnPickerLabels,
    effectiveColumnSettingsClient,
    gridId,
    gridSettings,
    localGridUserSettings?.columnSettingsMode,
    localGridUserSettings?.displayMode,
    onVisibleColumnKeysChange,
    resolvedEntity.tableName,
    structure
  ]);

  const defaultRowActions = useMemo<readonly EntityDataGridRowAction<TRow>[]>(() => {
    const nextActions: EntityDataGridRowAction<TRow>[] = [];

    if (onRowDoubleClick || onRowClick) {
      nextActions.push({
        key: "open",
        label: gridSettings.labels.openRecord,
        icon: titanicDataGridRowActionIcons.titanicOpen,
        onClick: ({ row }) => {
          if (onRowDoubleClick) {
            onRowDoubleClick(row);
            return;
          }

          onRowClick?.(row);
        }
      });
    }

    nextActions.push({
      key: "copy",
      label: gridSettings.labels.copyRecord,
      icon: titanicDataGridRowActionIcons.titanicCopy,
      onClick: async ({ row }) => {
        await writeTextToClipboard(serializeGridRow(row));
      }
    });

    if (!rows && effectiveEditable && client && resolvedEntity.tableName) {
      nextActions.push({
        key: "delete",
        label: gridSettings.labels.deleteRecord,
        danger: true,
        icon: titanicDataGridRowActionIcons.titanicDelete,
        hidden: ({ row, rowIndex }) => getGridRowPrimaryValue(row, rowIndex, getRowKey, resolvedEntity.primaryColumn) == null,
        onClick: async ({ row, rowIndex }) => {
          const rowPrimaryValue = getGridRowPrimaryValue(row, rowIndex, getRowKey, resolvedEntity.primaryColumn);

          if (rowPrimaryValue == null || !resolvedEntity.tableName) {
            return;
          }

          await client.deleteById(resolvedEntity.tableName, rowPrimaryValue, resolvedEntity.primaryColumn);
          refreshData();
        }
      });
    }

    return nextActions;
  }, [client, effectiveEditable, getRowKey, gridSettings.labels.copyRecord, gridSettings.labels.deleteRecord, gridSettings.labels.openRecord, onRowClick, onRowDoubleClick, refreshData, resolvedEntity.primaryColumn, resolvedEntity.tableName, rows]);

  const effectiveRowActions = useMemo(
    () => mergeRowActions(defaultRowActions, rowActions),
    [defaultRowActions, rowActions]
  );

  const openRowMenu = useCallback((rowElement: HTMLElement, row: TRow, rowKey: string, rowIndex: number) => {
    if (!gridSettings.showRowContextMenu) {
      return;
    }

    const visibleActions = getVisibleRowActions(effectiveRowActions, {
      client,
      closeMenu: () => setRowMenuState(null),
      entity: resolvedEntity,
      refresh: refreshData,
      row,
      rowIndex
    });

    if (visibleActions.length === 0) {
      return;
    }

    const rowRect = rowElement.getBoundingClientRect();
    const menuWidth = visibleActions.length * rowMenuActionSize +
      Math.max(0, visibleActions.length - 1) * rowMenuGap +
      rowMenuPadding * 2;
    const menuHeight = rowMenuActionSize + rowMenuPadding * 2;
    const belowTop = rowRect.bottom + rowMenuGap;
    const aboveTop = rowRect.top - menuHeight - rowMenuGap;
    const rowMenuTop = belowTop + menuHeight <= window.innerHeight - rowMenuViewportMargin
      ? belowTop
      : Math.max(rowMenuViewportMargin, aboveTop);

    setRowMenuState({
      actions: visibleActions,
      left: rowRect.right - menuWidth - rowMenuRightInset,
      loadingActionKey: null,
      row,
      rowIndex,
      rowKey,
      top: rowMenuTop
    });
  }, [client, effectiveRowActions, gridSettings.showRowContextMenu, refreshData, resolvedEntity]);

  const handleRowSingleClick = useCallback((rowElement: HTMLElement, row: TRow, rowKey: string, rowIndex: number) => {
    onRowClick?.(row);
    openRowMenu(rowElement, row, rowKey, rowIndex);
  }, [onRowClick, openRowMenu]);

  const executeRowAction = useCallback(async (action: EntityDataGridRowAction<TRow>) => {
    if (!rowMenuState) {
      return;
    }

    const context: EntityDataGridRowActionContext<TRow> = {
      client,
      closeMenu: () => setRowMenuState(null),
      entity: resolvedEntity,
      refresh: refreshData,
      row: rowMenuState.row,
      rowIndex: rowMenuState.rowIndex
    };

    if (resolveRowActionDisabled(action, context)) {
      return;
    }

    setRowActionError(null);
    setRowMenuState((currentState) => currentState
      ? { ...currentState, loadingActionKey: action.key }
      : currentState
    );

    try {
      await action.onClick(context);
      setRowMenuState(null);
    } catch (requestError) {
      setRowActionError(requestError instanceof Error ? requestError.message : gridSettings.labels.error);
      setRowMenuState((currentState) => currentState
        ? { ...currentState, loadingActionKey: null }
        : currentState
      );
    }
  }, [client, gridSettings.labels.error, refreshData, resolvedEntity, rowMenuState]);

  return (
    <section className={rootClassName} style={rootStyle} ref={rootRef}>
      <header className="titanic-data-grid__header">
        {title ? <h2>{title}</h2> : <span />}
        {availableColumns.length > 0 ? (
          <SiteIconDropdown
            className="titanic-data-grid__settings-dropdown titanic-data-grid__settings-dropdown_text"
            label={gridSettings.labels.gridSettings}
            options={[
              {
                icon: titanicDataGridSettingsIcons.titanicColumns,
                label: gridSettings.labels.configureColumns,
                value: "columns"
              },
              {
                icon: titanicDataGridSettingsIcons.titanicTotals,
                label: gridSettings.labels.configureTotals,
                value: "totals"
              }
            ]}
            tooltipClassName="titanic-icon-dropdown__tooltip"
            value="columns"
            onChange={(value) => {
              if (value === "totals") {
                setTotalsSettingsOpen(true);
                return;
              }

              setSettingsOpen(true);
            }}
          />
        ) : null}
      </header>

      {settingsOpen
        ? columnSettingsPackage.extension.renderColumnSettingsDialog?.({
            columns: availableColumns,
            columnSettingsMode: effectiveColumnSettingsMode,
            currentSettings: effectiveColumnSettings,
            error: columnSettingsError,
            gridWidth: effectiveGridWidth,
            isOpen: settingsOpen,
            labels: gridSettings.labels,
            columnPickerLabels: effectiveColumnPickerLabels,
            modeSettings: localGridUserSettings?.modeSettings,
            rootTableName: resolvedEntity.tableName,
            saving: columnSettingsSaving,
            structure,
            title,
            onApply: (nextSettings, nextColumnSettingsMode, nextModeSettings) =>
              void applyColumnSettings(nextSettings, false, nextColumnSettingsMode, nextModeSettings),
            onClose: () => setSettingsOpen(false),
            onSaveDefault: (nextSettings, nextColumnSettingsMode, nextModeSettings) =>
              void applyColumnSettings(nextSettings, true, nextColumnSettingsMode, nextModeSettings)
          })
        : null}

      {totalsSettingsOpen ? (
        <EntityDataGridTotalsSettingsModal
          labels={gridSettings.labels}
          onClose={() => setTotalsSettingsOpen(false)}
        />
      ) : null}

      {columnSettingsError && !settingsOpen ? <div className="titanic-data-grid__error">{columnSettingsError}</div> : null}
      {rowActionError ? <div className="titanic-data-grid__error">{rowActionError}</div> : null}
      {error ? <div className="titanic-data-grid__error">{error.message || gridSettings.labels.error}</div> : null}

      <div className="titanic-data-grid__table-wrap" ref={tableWrapRef}>
        <div
          className="titanic-data-grid__table"
          role="table"
          aria-colcount={visibleColumns.length}
          aria-rowcount={renderedRows.length + (showColumnHeader ? 1 : 0)}
        >
          {showColumnHeader ? (
            <div className="titanic-data-grid__head" role="rowgroup">
              <div className="titanic-data-grid__row titanic-data-grid__row_header" role="row">
                {visibleColumns.map((column) => (
                  <div
                    className="titanic-data-grid__cell titanic-data-grid__cell_header"
                    key={column.settingId}
                    role="columnheader"
                    style={getCellStyle(column)}
                  >
                    {column.label ?? column.path ?? column.key}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="titanic-data-grid__body" role="rowgroup">
            {effectiveLoading ? (
              <div className="titanic-data-grid__status-row" role="row">
                <div className="titanic-data-grid__cell titanic-data-grid__cell_status" role="cell">
                  {loaderCollection ? (
                    <div className="titanic-data-grid__loader">
                      <RandomGifLoader
                        collection={loaderCollection}
                        label={structureLoading ? gridSettings.labels.loadingStructure : gridSettings.labels.loading}
                      />
                    </div>
                  ) : (
                    structureLoading ? gridSettings.labels.loadingStructure : gridSettings.labels.loading
                  )}
                </div>
              </div>
            ) : renderedRows.length === 0 ? (
              <div className="titanic-data-grid__status-row" role="row">
                <div className="titanic-data-grid__cell titanic-data-grid__cell_status" role="cell">
                  {emptyText ?? gridSettings.labels.empty}
                </div>
              </div>
            ) : (
              renderedRows.map((row, index) => {
                const rowKey = getResolvedGridRowKey(row, index, getRowKey, resolvedEntity.primaryColumn);
                const rowClassName = [
                  "titanic-data-grid__row",
                  onRowClick || onRowDoubleClick || gridSettings.showRowContextMenu ? "titanic-data-grid__row_clickable" : "",
                  activeRowKey && activeRowKey === rowKey ? "titanic-data-grid__row_active" : ""
                ].filter(Boolean).join(" ");

                return (
                  <div
                    aria-rowindex={index + (showColumnHeader ? 2 : 1)}
                    className={rowClassName}
                    key={rowKey}
                    role="row"
                    onClick={(event) => {
                      if (event.defaultPrevented || isInteractiveTarget(event.target)) {
                        return;
                      }

                      const rowElement = event.currentTarget;
                      clearPendingRowClick();

                      if (!onRowDoubleClick) {
                        handleRowSingleClick(rowElement, row, rowKey, index);
                        return;
                      }

                      rowClickTimerRef.current = window.setTimeout(() => {
                        rowClickTimerRef.current = null;
                        handleRowSingleClick(rowElement, row, rowKey, index);
                      }, 220);
                    }}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      clearPendingRowClick();
                      onRowClick?.(row);
                      openRowMenu(event.currentTarget, row, rowKey, index);
                    }}
                    onDoubleClick={() => {
                      clearPendingRowClick();
                      setRowMenuState(null);

                      if (onRowDoubleClick) {
                        onRowDoubleClick(row);
                        return;
                      }

                      onRowClick?.(row);
                    }}
                  >
                    {visibleColumns.map((column, columnIndex) => {
                      const cellLabel = column.label ?? column.path ?? column.key;
                      const cellValue = formatCell(getCellValue(row, column));

                      return (
                        <div
                          aria-colindex={columnIndex + 1}
                          className={["titanic-data-grid__cell", column.className].filter(Boolean).join(" ")}
                          key={column.settingId}
                          role="cell"
                          style={getCellStyle(column)}
                        >
                          {effectiveColumnSettingsMode === "tile" ? (
                            <>
                              <span className="titanic-data-grid__cell-field-label">{cellLabel}</span>
                              <span className="titanic-data-grid__cell-field-value">{cellValue}</span>
                            </>
                          ) : cellValue}
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
            {loadingMoreRows ? (
              <div className="titanic-data-grid__status-row titanic-data-grid__loading-more" role="row">
                <div className="titanic-data-grid__cell titanic-data-grid__cell_status" role="cell">
                  {gridSettings.labels.loadingMore}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {rowMenuState ? (
        <EntityDataGridRowContextMenu
          actions={rowMenuState.actions}
          ariaLabel={gridSettings.labels.rowActions}
          context={{
            client,
            closeMenu: () => setRowMenuState(null),
            entity: resolvedEntity,
            refresh: refreshData,
            row: rowMenuState.row,
            rowIndex: rowMenuState.rowIndex
          }}
          left={rowMenuState.left}
          loadingActionKey={rowMenuState.loadingActionKey}
          top={rowMenuState.top}
          onActionClick={(action) => void executeRowAction(action)}
        />
      ) : null}
    </section>
  );
}

function EntityDataGridColumnSettingsModal<TRow>({
  columns,
  currentSettings,
  error,
  labels,
  saving,
  onApply,
  onClose,
  onSaveDefault
}: {
  columns: readonly EntityDataGridColumn<TRow>[];
  currentSettings: readonly EntityDataGridColumnSetting[];
  error: string | null;
  labels: EntityDataGridLabels;
  saving: boolean;
  onApply: (settings: EntityDataGridColumnSetting[]) => void;
  onClose: () => void;
  onSaveDefault: (settings: EntityDataGridColumnSetting[]) => void;
}) {
  const [draftSettings, setDraftSettings] = useState(() => createDraftColumnSettings(columns, currentSettings));
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery.trim().toLowerCase());
  const columnByKey = useMemo(() => new Map(columns.map((column) => [column.key, column])), [columns]);
  const visibleSettings = draftSettings.filter((setting) => setting.visible);
  const filteredVisibleSettings = deferredSearchQuery
    ? visibleSettings.filter((setting) => matchesColumnSearch(columnByKey.get(setting.key), deferredSearchQuery))
    : visibleSettings;
  const hiddenSettings = draftSettings.filter((setting) => !setting.visible);
  const filteredHiddenSettings = deferredSearchQuery
    ? hiddenSettings.filter((setting) => matchesColumnSearch(columnByKey.get(setting.key), deferredSearchQuery))
    : hiddenSettings;

  useEffect(() => {
    setDraftSettings(createDraftColumnSettings(columns, currentSettings));
    setSearchQuery("");
  }, [columns, currentSettings]);

  const updateSetting = (key: string, updater: (setting: EntityDataGridColumnSetting) => EntityDataGridColumnSetting) => {
    setDraftSettings((settings) => normalizeDraftColumnSettings(columns, settings.map((setting, index) => {
      const settingId = getColumnSettingId(setting, index);
      return setting.key === key ? updater({ ...setting, id: settingId }) : { ...setting, id: settingId };
    })));
  };

  const addColumn = (key: string) => {
    setDraftSettings((settings) => {
      const visibleCount = settings.filter((setting) => setting.visible).length;
      return normalizeDraftColumnSettings(columns, settings.map((setting) =>
        setting.key === key
          ? {
              ...setting,
              visible: true,
              order: visibleCount
            }
          : setting
      ));
    });
  };

  const removeColumn = (key: string) => {
    const column = columnByKey.get(key);

    if (column?.required || visibleSettings.length <= 1) {
      return;
    }

    setDraftSettings((settings) => normalizeDraftColumnSettings(columns, settings.map((setting) =>
      setting.key === key
        ? {
            ...setting,
            visible: false
          }
        : setting
    )));
  };

  const moveColumn = (sourceKey: string, targetKey: string) => {
    if (sourceKey === targetKey) {
      return;
    }

    setDraftSettings((settings) => moveDraftColumnSettings(columns, settings, sourceKey, targetKey));
  };

  const updateColumnWidth = (key: string, width: number | undefined) => {
    updateSetting(key, (setting) => ({
      ...setting,
      width,
      span: width ? clampGridSpan(Math.round(width / 42)) : setting.span
    }));
  };

  return (
    <div className="titanic-data-grid-column-modal" role="dialog" aria-modal="true" aria-label={labels.columnsTitle}>
      <div className="titanic-data-grid-column-modal__backdrop" onClick={onClose} />
      <section className="titanic-data-grid-column-modal__card">
        <header className="titanic-data-grid-column-modal__header">
          <div>
            <span>{labels.configureColumns}</span>
            <strong>{labels.columnsTitle}</strong>
            <p>{labels.columnsCaption}</p>
          </div>
          <button
            aria-label={labels.closeColumns}
            className="titanic-data-grid-column-modal__close"
            title={labels.closeColumns}
            type="button"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </header>

        {error ? <p className="titanic-data-grid-column-modal__error">{error}</p> : null}

        <label className="titanic-data-grid-column-modal__search">
          <span>{labels.searchColumnsPlaceholder}</span>
          <input
            placeholder={labels.searchColumnsPlaceholder}
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>

        <div className="titanic-data-grid-column-modal__layout">
          <section className="titanic-data-grid-column-modal__panel">
            <div className="titanic-data-grid-column-modal__panel-head">
              <div>
                <h3>{labels.visibleColumnsTitle}</h3>
                <p>{labels.selectedColumnsSummary}</p>
              </div>
              <span className="titanic-data-grid-column-modal__count">{visibleSettings.length}</span>
            </div>
            <p className="titanic-data-grid-column-modal__hint">{labels.moveColumn}. {labels.selectedColumnsSummary}.</p>
            <div className="titanic-data-grid-column-modal__list">
              {filteredVisibleSettings.length > 0 ? filteredVisibleSettings.map((setting) => {
                const column = columnByKey.get(setting.key);
                const widthValue = setting.width ?? column?.width ?? 160;
                const canRemove = !column?.required && visibleSettings.length > 1;

                return column ? (
                  <article
                    className={draggingKey === setting.key
                      ? "titanic-data-grid-column-modal__row titanic-data-grid-column-modal__row_dragging"
                      : "titanic-data-grid-column-modal__row"}
                    draggable
                    key={setting.key}
                    onDragEnd={() => setDraggingKey(null)}
                    onDragOver={(event) => event.preventDefault()}
                    onDragStart={(event) => handleColumnDragStart(event, setting.key, setDraggingKey)}
                    onDrop={(event) => handleColumnDrop(event, setting.key, draggingKey, moveColumn)}
                  >
                    <div className="titanic-data-grid-column-modal__row-copy">
                      <div className="titanic-data-grid-column-modal__row-title">
                        <strong>{column.label ?? column.path ?? column.key}</strong>
                        {column.required ? (
                          <span className="titanic-data-grid-column-modal__badge">{labels.requiredColumn}</span>
                        ) : null}
                      </div>
                    </div>
                    <label className="titanic-data-grid-column-modal__width">
                      <span>{labels.columnWidth}</span>
                      <input
                        inputMode="numeric"
                        min={80}
                        step={10}
                        type="number"
                        value={widthValue}
                        onChange={(event) => updateColumnWidth(setting.key, normalizeWidth(event.target.value) ?? undefined)}
                      />
                    </label>
                    <button
                      className="titanic-data-grid-column-modal__action"
                      disabled={!canRemove}
                      type="button"
                      onClick={() => removeColumn(setting.key)}
                    >
                      {labels.removeColumn}
                    </button>
                  </article>
                ) : null;
              }) : (
                <p className="titanic-data-grid-column-modal__empty">{labels.noSelectedColumns}</p>
              )}
            </div>
          </section>

          <aside className="titanic-data-grid-column-modal__panel titanic-data-grid-column-modal__available">
            <div className="titanic-data-grid-column-modal__panel-head">
              <div>
                <h3>{labels.availableColumnsTitle}</h3>
                <p>{labels.availableColumnsSummary}</p>
              </div>
              <span className="titanic-data-grid-column-modal__count">{hiddenSettings.length}</span>
            </div>
            <div className="titanic-data-grid-column-modal__list">
              {filteredHiddenSettings.length > 0 ? filteredHiddenSettings.map((setting) => {
                const column = columnByKey.get(setting.key);

                return column ? (
                  <button
                    className="titanic-data-grid-column-modal__available-row"
                    type="button"
                    key={setting.key}
                    onClick={() => addColumn(setting.key)}
                  >
                    <div>
                      <strong>{column.label ?? column.path ?? column.key}</strong>
                      <small>{column.path ?? column.key}</small>
                    </div>
                    <span>{labels.addColumn}</span>
                  </button>
                ) : null;
              }) : (
                <p className="titanic-data-grid-column-modal__empty">{labels.noAvailableColumns}</p>
              )}
            </div>
          </aside>
        </div>

        <footer className="titanic-data-grid-column-modal__footer">
          <button className="titanic-data-grid-column-modal__button" type="button" onClick={() => onApply(draftSettings)}>
            {labels.applyColumns}
          </button>
          <button
            className="titanic-data-grid-column-modal__button titanic-data-grid-column-modal__button_primary"
            type="button"
            disabled={saving}
            onClick={() => onSaveDefault(draftSettings)}
          >
            {saving ? labels.savingColumns : labels.saveDefaultColumns}
          </button>
        </footer>
      </section>
    </div>
  );
}

function EntityDataGridTotalsSettingsModal({
  labels,
  onClose
}: {
  labels: EntityDataGridLabels;
  onClose: () => void;
}) {
  return (
    <div className="titanic-data-grid-column-modal" role="dialog" aria-modal="true" aria-label={labels.totalsTitle}>
      <div className="titanic-data-grid-column-modal__backdrop" onClick={onClose} />
      <section className="titanic-data-grid-column-modal__card">
        <header className="titanic-data-grid-column-modal__header">
          <div>
            <span>{labels.configureTotals}</span>
            <strong>{labels.totalsTitle}</strong>
            <p>{labels.totalsCaption}</p>
          </div>
          <button
            aria-label={labels.closeColumns}
            className="titanic-data-grid-column-modal__close"
            title={labels.closeColumns}
            type="button"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </header>
        <p className="titanic-data-grid-column-modal__empty">{labels.totalsEmpty}</p>
        <footer className="titanic-data-grid-column-modal__footer">
          <button className="titanic-data-grid-column-modal__button" type="button" onClick={onClose}>
            {labels.closeColumns}
          </button>
        </footer>
      </section>
    </div>
  );
}
function mergeGridSettings(
  settings: Partial<EntityDataGridSettings> | undefined,
  labels: EntityDataGridProps["labels"]
): ResolvedEntityDataGridSettings {
  const culture = settings?.locale ?? settings?.culture ?? detectEntityDataGridCulture();

  return {
    ...defaultEntityDataGridSettings,
    ...settings,
    culture,
    locale: culture,
    labels: {
      ...getEntityDataGridLabels(culture),
      ...settings?.labels,
      ...labels
    }
  };
}

function resolveGridEntity(
  entity: EntityDataGridProps["entity"],
  tableName?: string,
  primaryColumn?: string
): EntityDataGridEntityDescriptor {
  if (typeof entity === "string") {
    return {
      tableName: entity,
      primaryColumn: primaryColumn ?? "id"
    };
  }

  return {
    tableName: entity?.tableName ?? tableName,
    entityTypeName: entity?.entityTypeName,
    primaryColumn: entity?.primaryColumn ?? primaryColumn ?? "id"
  };
}

function normalizeGridFilters(
  filter: EntityDataGridProps["filter"],
  filters: EntityDataGridProps["filters"]
): ESQFilter[] {
  const normalizedFilters = [...(filters ?? [])];

  if (isGridFilterArray(filter)) {
    normalizedFilters.push(...filter);
  } else if (filter) {
    normalizedFilters.push(filter);
  }

  return normalizedFilters;
}

function isGridFilterArray(value: EntityDataGridProps["filter"]): value is readonly ESQFilter[] {
  return Array.isArray(value);
}

async function writeTextToClipboard(value: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  if (typeof document === "undefined") {
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = value;
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(textArea);
  }
}

function serializeGridRow(row: unknown): string {
  if (!row || typeof row !== "object") {
    return String(row ?? "");
  }

  if (isEntityApiEntity(row)) {
    return JSON.stringify(toEntityValues(row), null, 2);
  }

  return JSON.stringify(row, null, 2);
}

function getGridRowPrimaryValue<TRow>(
  row: TRow,
  rowIndex: number,
  getRowKey: EntityDataGridProps<TRow>["getRowKey"],
  primaryColumn?: string
): string | null {
  const explicitRowKey = getRowKey?.(row, rowIndex);

  if (explicitRowKey) {
    return explicitRowKey;
  }

  const resolvedPrimaryColumn = primaryColumn ?? "id";

  if (isEntityApiEntity(row)) {
    const value = getEntityValue(row, resolvedPrimaryColumn);
    return value == null ? null : String(value);
  }

  if (row && typeof row === "object") {
    const value = (row as Record<string, unknown>)[resolvedPrimaryColumn];
    return value == null ? null : String(value);
  }

  return null;
}

function mergeRowActions<TRow>(
  defaultActions: readonly EntityDataGridRowAction<TRow>[],
  customActions: readonly EntityDataGridRowAction<TRow>[] | undefined
): EntityDataGridRowAction<TRow>[] {
  if (!customActions?.length) {
    return [...defaultActions];
  }

  const mergedActions = new Map(defaultActions.map((action) => [action.key, action]));
  customActions.forEach((action) => {
    mergedActions.set(action.key, action);
  });

  return [...mergedActions.values()];
}

function getVisibleRowActions<TRow>(
  actions: readonly EntityDataGridRowAction<TRow>[],
  context: EntityDataGridRowActionContext<TRow>
): EntityDataGridRowAction<TRow>[] {
  return actions.filter((action) => !resolveRowActionHidden(action, context));
}

function resolveRowActionHidden<TRow>(
  action: EntityDataGridRowAction<TRow>,
  context: EntityDataGridRowActionContext<TRow>
): boolean {
  return typeof action.hidden === "function"
    ? action.hidden(context)
    : Boolean(action.hidden);
}

function resolveRowActionDisabled<TRow>(
  action: EntityDataGridRowAction<TRow>,
  context: EntityDataGridRowActionContext<TRow>
): boolean {
  return typeof action.disabled === "function"
    ? action.disabled(context)
    : Boolean(action.disabled);
}

function getResolvedGridRowKey<TRow>(
  row: TRow,
  rowIndex: number,
  getRowKey: EntityDataGridProps<TRow>["getRowKey"],
  primaryColumn?: string
): string {
  return getGridRowPrimaryValue(row, rowIndex, getRowKey, primaryColumn) ?? `row-${rowIndex}`;
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.closest(
    'button, a, input, select, textarea, [role="button"], [data-row-menu-ignore="true"]'
  ) !== null;
}

function detectEntityDataGridCulture(): string {
  return Titanic.Localization.getCurrentLocale() || defaultEntityDataGridCulture;
}

function toGridColumn<TRow>(
  column: EntityApiStructureColumnResponse,
  labels: EntityDataGridColumnPickerLabels | undefined,
  tableName: string | undefined
): EntityDataGridColumn<TRow> {
  return {
    key: column.propertyName,
    path: column.propertyName,
    label: getStructureColumnLabel(column, tableName, labels),
    defaultVisible: !column.isPrimary,
    required: column.isPrimary
  };
}

function createGridColumnsFromStructure<TRow>(
  structure: EntityApiManagerStructureResponse,
  rootTableName: string,
  labels: EntityDataGridColumnPickerLabels | undefined,
  maxDepth = relatedColumnMaxDepth
): EntityDataGridColumn<TRow>[] {
  const entityByTableName = new Map(structure.entities.map((entity) => [entity.tableName, entity]));
  const rootEntity = entityByTableName.get(rootTableName);
  const columnsByKey = new Map<string, EntityDataGridColumn<TRow>>();

  if (!rootEntity) {
    return [];
  }

  const visitEntity = (
    entity: EntityApiStructureEntityResponse,
    prefixPath: string,
    prefixLabels: readonly string[],
    depth: number
  ) => {
    entity.columns.forEach((column) => {
      const columnLabel = getStructureColumnLabel(column, entity.tableName, labels);
      const key = prefixPath ? `${prefixPath}.${column.propertyName}` : column.propertyName;
      const label = prefixLabels.length > 0
        ? [...prefixLabels, columnLabel].join(" / ")
        : columnLabel;

      if (!columnsByKey.has(key)) {
        columnsByKey.set(key, {
          key,
          path: key,
          label,
          defaultVisible: depth === 0 && !column.isPrimary,
          required: depth === 0 && column.isPrimary
        });
      }

      if (!column.isReference || !column.referenceTableName || depth >= maxDepth) {
        return;
      }

      const referenceEntity = entityByTableName.get(column.referenceTableName);

      if (!referenceEntity) {
        return;
      }

      visitEntity(referenceEntity, key, [...prefixLabels, columnLabel], depth + 1);
    });
  };

  visitEntity(rootEntity, "", [], 0);

  return [...columnsByKey.values()];
}

function createGridColumnsForPathsFromStructure<TRow>(
  structure: EntityApiManagerStructureResponse,
  rootTableName: string,
  paths: readonly string[],
  labels: EntityDataGridColumnPickerLabels | undefined
): EntityDataGridColumn<TRow>[] {
  const entityByTableName = new Map(structure.entities.map((entity) => [entity.tableName, entity]));
  const rootEntity = entityByTableName.get(rootTableName);
  const columnsByKey = new Map<string, EntityDataGridColumn<TRow>>();

  if (!rootEntity) {
    return [];
  }

  paths.forEach((path) => {
    const column = createGridColumnForStructurePath<TRow>(rootEntity, entityByTableName, path, labels);

    if (column) {
      columnsByKey.set(column.key, column);
    }
  });

  return [...columnsByKey.values()];
}

function createGridColumnForStructurePath<TRow>(
  rootEntity: EntityApiStructureEntityResponse,
  entityByTableName: ReadonlyMap<string, EntityApiStructureEntityResponse>,
  path: string,
  labels: EntityDataGridColumnPickerLabels | undefined
): EntityDataGridColumn<TRow> | null {
  const segments = path.split(".").map((segment) => segment.trim()).filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  const labelParts: string[] = [];
  let currentEntity: EntityApiStructureEntityResponse | undefined = rootEntity;

  for (let index = 0; index < segments.length; index += 1) {
    if (!currentEntity) {
      return null;
    }

    const column = currentEntity.columns.find((item) => item.propertyName === segments[index]);

    if (!column) {
      return null;
    }

    labelParts.push(getStructureColumnLabel(column, currentEntity.tableName, labels));

    if (index === segments.length - 1) {
      return {
        key: path,
        path,
        label: labelParts.join(" / "),
        defaultVisible: false,
        required: false
      };
    }

    if (!column.isReference || !column.referenceTableName) {
      return null;
    }

    currentEntity = entityByTableName.get(column.referenceTableName);
  }

  return null;
}

function mergeColumnPickerLabels(
  labels: EntityDataGridColumnPickerLabels | undefined,
  rootTableName: string | undefined,
  rootColumnLabels: Record<string, string> | undefined
): EntityDataGridColumnPickerLabels | undefined {
  if (!labels && (!rootTableName || !rootColumnLabels)) {
    return labels;
  }

  const rootLabels = rootTableName && rootColumnLabels
    ? {
        [rootTableName]: {
          ...labels?.columns?.[rootTableName],
          ...rootColumnLabels
        }
      }
    : {};

  return {
    entities: labels?.entities,
    columns: {
      ...labels?.columns,
      ...rootLabels
    }
  };
}

function mergeGridColumns<TRow>(
  primaryColumns: readonly EntityDataGridColumn<TRow>[],
  secondaryColumns: readonly EntityDataGridColumn<TRow>[]
): EntityDataGridColumn<TRow>[] {
  const mergedColumns = new Map<string, EntityDataGridColumn<TRow>>();

  primaryColumns.forEach((column) => {
    mergedColumns.set(column.key, column);
  });
  secondaryColumns.forEach((column) => {
    if (!mergedColumns.has(column.key)) {
      mergedColumns.set(column.key, column);
    }
  });

  return [...mergedColumns.values()];
}

function getStructureColumnLabel(
  column: EntityApiStructureColumnResponse,
  tableName: string | undefined,
  labels: EntityDataGridColumnPickerLabels | undefined
): string {
  const tableLabels = tableName ? labels?.columns?.[tableName] : undefined;
  return tableLabels?.[column.propertyName] ?? tableLabels?.[column.columnName] ?? splitPascalCase(column.propertyName);
}

function splitPascalCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim() || value;
}

function getDefaultVisibleColumnKeys<TRow>(columns: readonly EntityDataGridColumn<TRow>[]): string[] {
  const visibleKeys = columns
    .filter((column) => column.defaultVisible !== false)
    .map((column) => column.key);

  return visibleKeys.length > 0 ? visibleKeys : columns.slice(0, 1).map((column) => column.key);
}

function createColumnSettingsFromKeys<TRow>(
  columns: readonly EntityDataGridColumn<TRow>[],
  visibleColumnKeys: readonly string[]
): EntityDataGridColumnSetting[] {
  return visibleColumnKeys
    .flatMap((key, index): EntityDataGridColumnSetting[] => {
      const column = columns.find((item) => item.key === key);

      return column ? [{
        id: createColumnSettingId(column.key, index),
        key: column.key,
        path: column.path ?? column.key,
        visible: true,
        span: getDefaultColumnSpan(column),
        width: column.width,
        order: index
      }] : [];
    });
}

function normalizeColumnSettings<TRow>(
  columns: readonly EntityDataGridColumn<TRow>[],
  settings: readonly EntityDataGridColumnSetting[],
  defaultVisibleColumnKeys?: readonly string[]
): EntityDataGridColumnSetting[] {
  const defaultVisibleKeys = new Set(defaultVisibleColumnKeys ?? getDefaultVisibleColumnKeys(columns));
  const columnByKey = new Map(columns.map((column) => [column.key, column]));
  const columnByPath = new Map(columns.map((column) => [column.path ?? column.key, column]));
  const sourceSettings: readonly EntityDataGridColumnSetting[] = settings.length > 0
    ? settings
    : columns
        .filter((column) => defaultVisibleKeys.has(column.key))
        .map((column, index) => ({
          id: createColumnSettingId(column.key, index),
          key: column.key,
          path: column.path ?? column.key,
          visible: true,
          span: getDefaultColumnSpan(column),
          width: column.width,
          order: index
        } satisfies EntityDataGridColumnSetting));
  const normalizedSettings = sourceSettings
    .flatMap((setting, index): EntityDataGridColumnSetting[] => {
      const settingPath = normalizeColumnPath(setting.path) ?? setting.key;
      const column = columnByKey.get(setting.key) ?? columnByPath.get(settingPath);

      if (!column) {
        return [];
      }

      return [{
        id: getColumnSettingId(setting, index),
        key: column.key,
        path: column.path ?? settingPath,
        visible: setting.visible !== false,
        ...(normalizeLabel(setting.label) ? { label: normalizeLabel(setting.label) } : {}),
        span: normalizeSpan(setting.span) ?? getColumnDesignerSpan(setting, column),
        width: normalizeWidth(setting.width ?? column.width),
        order: setting.order ?? index
      }];
    });
  const hasVisibleColumn = normalizedSettings.some((setting) => setting.visible);

  if (!hasVisibleColumn) {
    const fallbackColumn = columns.find((column) => column.defaultVisible !== false) ?? columns[0];

    if (fallbackColumn) {
      normalizedSettings.push({
        id: createColumnSettingId(fallbackColumn.key),
        key: fallbackColumn.key,
        path: fallbackColumn.path ?? fallbackColumn.key,
        visible: true,
        span: getDefaultColumnSpan(fallbackColumn),
        width: fallbackColumn.width,
        order: 0
      });
    }
  }

  return normalizedSettings.sort((left, right) => {
    if (left.visible !== right.visible) {
      return left.visible ? -1 : 1;
    }

    return (left.order ?? Number.MAX_SAFE_INTEGER) - (right.order ?? Number.MAX_SAFE_INTEGER);
  });
}

function createDraftColumnSettings<TRow>(
  columns: readonly EntityDataGridColumn<TRow>[],
  currentSettings: readonly EntityDataGridColumnSetting[]
): EntityDataGridColumnSetting[] {
  return normalizeDraftColumnSettings(columns, [
    ...currentSettings,
    ...columns
      .filter((column) => !currentSettings.some((setting) => setting.key === column.key))
      .map((column, index) => ({
        id: createColumnSettingId(column.key, currentSettings.length + index),
        key: column.key,
        visible: false,
        span: getDefaultColumnSpan(column),
        width: column.width
      } satisfies EntityDataGridColumnSetting))
  ]);
}

function normalizeDraftColumnSettings<TRow>(
  columns: readonly EntityDataGridColumn<TRow>[],
  settings: readonly EntityDataGridColumnSetting[]
): EntityDataGridColumnSetting[] {
  const normalizedSettings = normalizeColumnSettings(columns, settings);
  const uniqueSettings = new Map<string, EntityDataGridColumnSetting>();

  normalizedSettings.forEach((setting, index) => {
    uniqueSettings.set(setting.key, {
      ...setting,
      id: getColumnSettingId(setting, index)
    });
  });

  columns.forEach((column, index) => {
    if (!uniqueSettings.has(column.key)) {
      uniqueSettings.set(column.key, {
        id: createColumnSettingId(column.key, index),
        key: column.key,
        visible: false,
        span: getDefaultColumnSpan(column),
        width: column.width
      });
    }
  });

  const visible = [...uniqueSettings.values()]
    .filter((setting) => setting.visible)
    .sort((left, right) => (left.order ?? Number.MAX_SAFE_INTEGER) - (right.order ?? Number.MAX_SAFE_INTEGER))
    .map((setting, index) => ({
      ...setting,
      order: index
    }));
  const hidden = [...uniqueSettings.values()]
    .filter((setting) => !setting.visible)
    .sort((left, right) => left.key.localeCompare(right.key))
    .map((setting) => ({
      ...setting,
      order: undefined
    }));

  return [...visible, ...hidden];
}

function moveDraftColumnSettings<TRow>(
  columns: readonly EntityDataGridColumn<TRow>[],
  settings: readonly EntityDataGridColumnSetting[],
  sourceKey: string,
  targetKey: string
): EntityDataGridColumnSetting[] {
  const visibleSettings = settings.filter((setting) => setting.visible);
  const hiddenSettings = settings.filter((setting) => !setting.visible);
  const sourceIndex = visibleSettings.findIndex((setting) => setting.key === sourceKey);
  const targetIndex = visibleSettings.findIndex((setting) => setting.key === targetKey);

  if (sourceIndex < 0 || targetIndex < 0) {
    return normalizeDraftColumnSettings(columns, settings);
  }

  const nextVisibleSettings = [...visibleSettings];
  const [sourceSetting] = nextVisibleSettings.splice(sourceIndex, 1);
  nextVisibleSettings.splice(targetIndex, 0, sourceSetting);

  return normalizeDraftColumnSettings(columns, [
    ...nextVisibleSettings.map((setting, index) => ({
      ...setting,
      order: index
    })),
    ...hiddenSettings
  ]);
}

function matchesColumnSearch<TRow>(
  column: EntityDataGridColumn<TRow> | undefined,
  searchQuery: string
): boolean {
  if (!column) {
    return false;
  }

  if (!searchQuery) {
    return true;
  }

  const haystack = [
    column.label,
    column.path,
    column.key
  ]
    .filter((item): item is string => Boolean(item))
    .join(" ")
    .toLowerCase();

  return haystack.includes(searchQuery);
}

function getQueryColumnKeys<TRow>(
  columns: readonly EntityDataGridColumn<TRow>[],
  visibleColumnKeys: readonly string[]
): string[] {
  const keySet = new Set(visibleColumnKeys);
  const queryKeys = columns
    .filter((column) => keySet.has(column.key) || column.required || column.queryRequired)
    .map((column) => column.path ?? column.key);

  return [...new Set(queryKeys)];
}

function isEntityDataGridQueryFactory(
  value: EntityDataGridQueryInput | undefined
): value is EntityDataGridQueryFactory {
  return typeof value === "function";
}

function resolveEntityDataGridQueryInput(
  query: EntityDataGridQueryInput | undefined,
  createQuery: EntityDataGridQueryFactory | undefined,
  context: EntityDataGridQueryContext
) {
  if (createQuery) {
    return createQuery(context);
  }

  return isEntityDataGridQueryFactory(query)
    ? query(context)
    : query;
}

function mergeDataGridSelectQueryColumns(
  query: ESQ,
  columnPaths: readonly string[],
  skipRow: number,
  rowCount: number
): ESQ | null {
  const columns: ESQColumn[] = [];
  const existingPaths = new Set<string>();

  (query.columns ?? []).forEach((column) => {
    if (isAllColumnsRequestColumn(column)) {
      return;
    }

    const path = normalizeColumnPath(column.path);

    if (!path) {
      if (isSubQueryColumn(column)) {
        columns.push({ ...column });
      }
      return;
    }

    columns.push({ ...column, path });
    existingPaths.add(path.toLowerCase());
  });

  columnPaths.forEach((pathValue) => {
    const path = normalizeColumnPath(pathValue);

    if (!path || existingPaths.has(path.toLowerCase())) {
      return;
    }

    columns.push({ path });
    existingPaths.add(path.toLowerCase());
  });

  if (columns.length === 0) {
    return null;
  }

  return {
    ...query,
    allColumns: false,
    columns,
    skipRow,
    skipRowCount: skipRow,
    rowCount
  };
}

function isGridNearViewportBottom(rootElement: HTMLElement | null): boolean {
  if (!rootElement) {
    return false;
  }

  const rect = rootElement.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom <= window.innerHeight + 160;
}

function isAllColumnsRequestColumn(column: ESQColumn): boolean {
  const path = normalizeColumnPath(column.path)?.toLowerCase();
  const aggregationType = column.aggregationType as unknown;
  const hasAggregation = aggregationType !== undefined &&
    aggregationType !== null &&
    aggregationType !== 0 &&
    aggregationType !== "None";

  return !hasAggregation && (path === "*" || path === "all" || path === "allcolumns");
}

function isSubQueryColumn(column: ESQColumn): boolean {
  return Boolean(column.subQuery);
}

function getCellValue<TRow>(row: TRow, column: EntityDataGridColumn<TRow>): unknown {
  if (column.render) {
    return column.render(row);
  }

  const key = column.path ?? column.key;

  if (isEntityApiEntity(row)) {
    return getEntityApiCellDisplayValue(row, key, column.key);
  }

  if (row && typeof row === "object" && key in row) {
    return (row as Record<string, unknown>)[key];
  }

  if (row && typeof row === "object") {
    const record = row as Record<string, unknown>;
    const aliases = getColumnValueAliases(key, column.key);

    for (const alias of aliases) {
      if (alias in record) {
        return record[alias];
      }
    }
  }

  return null;
}

function getEntityApiCellDisplayValue(row: EntityApiEntity, path: string, key: string): unknown {
  for (const alias of getColumnValueAliases(path, key)) {
    const value = getCellDisplayValue(row, alias);

    if (value !== null && value !== undefined) {
      return value;
    }
  }

  return null;
}

function getColumnValueAliases(path: string, key: string): string[] {
  return [...new Set([
    path,
    key,
    toEntityQueryColumnAlias(path),
    toEntityQueryColumnAlias(key)
  ].filter(Boolean))];
}

function toEntityQueryColumnAlias(path: string): string {
  return path
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_+|_+$/g, "");
}

function isEntityApiEntity(value: unknown): value is EntityApiEntity {
  if (!value || typeof value !== "object") {
    return false;
  }

  return Object.values(value as Record<string, unknown>).some((item) =>
    item !== null && typeof item === "object" && "value" in item
  );
}

function formatCell(value: unknown): ReactNode {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (isValidElement(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    return <>{value as ReactNode}</>;
  }

  return String(value);
}

function getColumnGridTemplate<TRow>(
  columns: readonly (EntityDataGridColumn<TRow> & { span?: number })[],
  gridColumns = 24
): string {
  if (columns.length === 0) {
    return "minmax(0, 1fr)";
  }

  return columns
    .map((column) => `minmax(0, ${getColumnRenderSpan(column, gridColumns)}fr)`)
    .join(" ");
}

function getTileGridTemplate(gridColumns: number): string {
  return `repeat(${clampGridColumns(gridColumns)}, minmax(0, 1fr))`;
}

function getColumnRenderSpan<TRow>(
  column: EntityDataGridColumn<TRow> & { span?: number },
  gridColumns = 24
): number {
  return normalizeSpan(column.span, gridColumns) ??
    normalizeSpan(column.width ? Math.round(column.width / 42) : undefined, gridColumns) ??
    1;
}

function getColumnDesignerSpan<TRow>(
  setting: Pick<EntityDataGridColumnSetting, "span" | "width">,
  column?: EntityDataGridColumn<TRow>
): number {
  return normalizeSpan(setting.span) ?? normalizeSpan(column?.width ? Math.round(column.width / 42) : undefined) ??
    normalizeSpan(setting.width ? Math.round(setting.width / 42) : undefined) ??
    getDefaultColumnSpan(column);
}

function getDefaultColumnSpan<TRow>(column?: EntityDataGridColumn<TRow>): number {
  if (!column?.width) {
    return 8;
  }

  return clampGridSpan(Math.round(column.width / 42));
}

function normalizeWidth(value: unknown): number | undefined {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) && parsedValue > 0 ? Math.round(parsedValue) : undefined;
}

function normalizeLabel(value: unknown): string | undefined {
  const label = typeof value === "string" ? value.trim() : "";
  return label || undefined;
}

function normalizeSpan(value: unknown, gridColumns = 24): number | undefined {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) && parsedValue > 0 ? clampGridSpan(parsedValue, gridColumns) : undefined;
}

function clampGridSpan(value: number, gridColumns = 24): number {
  return Math.max(1, Math.min(clampGridColumns(gridColumns), Math.round(value)));
}

function clampGridColumns(value: number | undefined): number {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) && parsedValue > 0 ? Math.max(1, Math.min(48, Math.round(parsedValue))) : 24;
}

function createColumnSettingId(key: string, index = Date.now()): string {
  return `${toDomId(key)}-${index}-${Math.random().toString(36).slice(2, 8)}`;
}

function getColumnSettingId(setting: EntityDataGridColumnSetting, index: number): string {
  return setting.id || createColumnSettingId(setting.key, index);
}

function handleColumnDragStart(
  event: DragEvent<HTMLElement>,
  settingId: string,
  setDraggingId: (value: string | null) => void
): void {
  setDraggingId(settingId);
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", settingId);
}

function handleColumnDrop(
  event: DragEvent<HTMLElement>,
  targetId: string,
  draggingId: string | null,
  moveColumn: (sourceId: string, targetId: string) => void
): void {
  event.preventDefault();
  const sourceId = draggingId || event.dataTransfer.getData("text/plain");

  if (sourceId) {
    moveColumn(sourceId, targetId);
  }
}

function toDomId(value: string): string {
  return value.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "") || "column";
}

function getColumnSettingsStorageKey(settings: EntityDataGridSettings, gridId: string): string {
  return `${settings.storagePrefix}.${gridId}.columnSettings`;
}

function getLegacyVisibleColumnsStorageKey(settings: EntityDataGridSettings, gridId: string): string {
  return `${settings.storagePrefix}.${gridId}.visibleColumns`;
}

function readStoredGridUserSettings(settings: EntityDataGridSettings, gridId: string): EntityDataGridUserSettings | null {
  if (!settings.persistColumnSettings || typeof window === "undefined") {
    return null;
  }

  try {
    const value = window.localStorage.getItem(getColumnSettingsStorageKey(settings, gridId));
    const parsed = value ? JSON.parse(value) : null;
    const normalizedSettings = normalizeStoredGridUserSettings(parsed);

    if (normalizedSettings) {
      return normalizedSettings;
    }

    const legacyValue = window.localStorage.getItem(getLegacyVisibleColumnsStorageKey(settings, gridId));
    const legacyParsed = legacyValue ? JSON.parse(legacyValue) : null;

    return Array.isArray(legacyParsed) && legacyParsed.every((item) => typeof item === "string")
      ? normalizeGridUserSettings({
          columns: legacyParsed.map((key, index) => ({ key, visible: true, order: index }))
        })
      : null;
  } catch {
    // В приватных режимах хранилище может быть отключено; грид продолжит работать с настройками в памяти.
    return null;
  }
}

function writeStoredGridUserSettings(settings: EntityDataGridSettings, gridId: string, gridUserSettings: EntityDataGridUserSettings): void {
  if (!settings.persistColumnSettings || typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(getColumnSettingsStorageKey(settings, gridId), JSON.stringify(normalizeGridUserSettings(gridUserSettings)));
  } catch {
    // В приватных режимах хранилище может быть отключено; грид продолжит работать с настройками в памяти.
  }
}

function normalizeStoredGridUserSettings(value: unknown): EntityDataGridUserSettings | null {
  if (Array.isArray(value)) {
    const columns = value
      .map(normalizeStoredColumnSetting)
      .filter((item): item is EntityDataGridColumnSetting => Boolean(item));

    return columns.length ? normalizeGridUserSettings({ columns }) : null;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const payload = value as Record<string, unknown>;
  const columns = Array.isArray(payload.columns)
    ? payload.columns
        .map(normalizeStoredColumnSetting)
        .filter((item): item is EntityDataGridColumnSetting => Boolean(item))
    : [];
  const displayMode = normalizeColumnSettingsMode(payload.displayMode) ?? normalizeColumnSettingsMode(payload.columnSettingsMode);
  const columnSettingsMode = normalizeColumnSettingsMode(payload.columnSettingsMode) ?? displayMode;
  const modeSettings = normalizeStoredGridModeSettings(payload.modeSettings);

  if (!columns.length && !displayMode && !columnSettingsMode && !hasGridModeSettings(modeSettings)) {
    return null;
  }

  return normalizeGridUserSettings({
    columns: columns.length ? columns : getGridModeColumns(modeSettings, displayMode ?? columnSettingsMode ?? defaultColumnSettingsMode),
    ...(displayMode ? { displayMode } : {}),
    ...(columnSettingsMode ? { columnSettingsMode } : {}),
    ...(modeSettings ? { modeSettings } : {})
  });
}

function normalizeGridUserSettings(settings: EntityDataGridUserSettings): EntityDataGridUserSettings {
  const displayMode = normalizeColumnSettingsMode(settings.displayMode) ?? normalizeColumnSettingsMode(settings.columnSettingsMode) ?? defaultColumnSettingsMode;
  const columnSettingsMode = normalizeColumnSettingsMode(settings.columnSettingsMode) ?? displayMode;
  const modeSettings = normalizeGridModeSettingsPayload(settings.modeSettings);

  return {
    columns: settings.columns.length ? settings.columns : getGridModeColumns(modeSettings, displayMode),
    displayMode,
    columnSettingsMode,
    ...(modeSettings ? { modeSettings } : {})
  };
}

function normalizeStoredGridModeSettings(value: unknown): EntityDataGridModeSettingsMap | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const payload = value as Record<string, unknown>;
  const modeSettings: EntityDataGridModeSettingsMap = {};

  (["list", "tile"] as const).forEach((mode) => {
    const modePayload = payload[mode];
    const rawColumns = Array.isArray(modePayload)
      ? modePayload
      : modePayload && typeof modePayload === "object" && Array.isArray((modePayload as Record<string, unknown>).columns)
        ? ((modePayload as Record<string, unknown>).columns as readonly unknown[])
        : undefined;

    if (!rawColumns) {
      return;
    }

    const columns = rawColumns
      .map(normalizeStoredColumnSetting)
      .filter((item): item is EntityDataGridColumnSetting => Boolean(item));

    if (columns.length) {
      modeSettings[mode] = { columns };
    }
  });

  return hasGridModeSettings(modeSettings) ? modeSettings : undefined;
}

function normalizeGridModeSettingsPayload(modeSettings: EntityDataGridModeSettingsMap | undefined): EntityDataGridModeSettingsMap | undefined {
  const nextModeSettings: EntityDataGridModeSettingsMap = {};

  (["list", "tile"] as const).forEach((mode) => {
    const columns = modeSettings?.[mode]?.columns;

    if (columns?.length) {
      nextModeSettings[mode] = { columns };
    }
  });

  return hasGridModeSettings(nextModeSettings) ? nextModeSettings : undefined;
}

function normalizeGridModeSettingsForStorage<TRow>(
  columns: readonly EntityDataGridColumn<TRow>[],
  modeSettings: EntityDataGridModeSettingsMap | undefined,
  defaultVisibleColumnKeys: readonly string[] | undefined
): EntityDataGridModeSettingsMap | undefined {
  const nextModeSettings: EntityDataGridModeSettingsMap = {};

  (["list", "tile"] as const).forEach((mode) => {
    const sourceSettings = modeSettings?.[mode]?.columns;

    if (!sourceSettings?.some((setting) => setting.visible !== false)) {
      return;
    }

    const visibleSettings = normalizeColumnSettings(columns, sourceSettings, defaultVisibleColumnKeys)
      .filter((setting) => setting.visible);

    if (visibleSettings.length) {
      nextModeSettings[mode] = { columns: visibleSettings };
    }
  });

  return hasGridModeSettings(nextModeSettings) ? nextModeSettings : undefined;
}

function getGridUserSettingsModeColumnSettings(
  settings: EntityDataGridUserSettings | null | undefined,
  mode: EntityDataGridColumnSettingsMode
): EntityDataGridColumnSetting[] {
  return settings?.modeSettings?.[mode]?.columns.length
    ? settings.modeSettings[mode].columns
    : settings?.columns ?? [];
}

function getGridUserSettingsColumnKeys(settings: EntityDataGridUserSettings | null | undefined): string[] {
  if (!settings) {
    return [];
  }

  return [
    ...settings.columns.map(getColumnSettingPath),
    ...getGridModeSettingsColumnKeys(settings.modeSettings)
  ];
}

function getGridModeSettingsColumnKeys(modeSettings: EntityDataGridModeSettingsMap | undefined): string[] {
  return [
    ...(modeSettings?.list?.columns.map(getColumnSettingPath) ?? []),
    ...(modeSettings?.tile?.columns.map(getColumnSettingPath) ?? [])
  ];
}

function getGridModeColumns(
  modeSettings: EntityDataGridModeSettingsMap | undefined,
  mode: EntityDataGridColumnSettingsMode
): EntityDataGridColumnSetting[] {
  if (modeSettings?.[mode]?.columns.length) {
    return modeSettings[mode].columns;
  }

  return modeSettings?.list?.columns ?? modeSettings?.tile?.columns ?? [];
}

function hasGridModeSettings(modeSettings: EntityDataGridModeSettingsMap | undefined): boolean {
  return Boolean(modeSettings?.list?.columns.length || modeSettings?.tile?.columns.length);
}

function normalizeColumnSettingsMode(value: unknown): EntityDataGridColumnSettingsMode | undefined {
  return value === "list" || value === "tile" ? value : undefined;
}

function normalizeStoredColumnSetting(value: unknown): EntityDataGridColumnSetting | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const setting = value as Record<string, unknown>;
  const key = typeof setting.key === "string" ? setting.key.trim() : "";
  const path = normalizeColumnPath(setting.path);
  const id = typeof setting.id === "string" ? setting.id.trim() : "";
  const label = normalizeLabel(setting.label);
  const span = normalizeSpan(setting.span);

  if (!key) {
    return null;
  }

  return {
    ...(id ? { id } : {}),
    key,
    ...(path ? { path } : {}),
    visible: setting.visible !== false,
    ...(label ? { label } : {}),
    ...(span ? { span } : {}),
    ...(normalizeWidth(setting.width) ? { width: normalizeWidth(setting.width) } : {}),
    ...(typeof setting.order === "number" ? { order: setting.order } : {})
  };
}

function getColumnSettingPath(setting: Pick<EntityDataGridColumnSetting, "key" | "path">): string {
  return normalizeColumnPath(setting.path) ?? setting.key;
}

function normalizeColumnPath(value: unknown): string | undefined {
  const path = typeof value === "string" ? value.trim() : "";
  return path || undefined;
}

function CloseIcon() {
  return <ResourceSvgIcon className="titanic-data-grid-column-modal__close-icon" icon={titanicCommonIcons.titanicClose} />;
}
