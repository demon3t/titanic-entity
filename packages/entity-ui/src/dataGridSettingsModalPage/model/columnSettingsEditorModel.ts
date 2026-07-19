import type { DragEvent } from "react";
import type {
  EntityDataGridColumn,
  EntityDataGridColumnSetting,
  EntityDataGridColumnSettingsMode,
  EntityDataGridModeSettingsMap
} from "../../dataGrid/data-grid-settings";

export const columnEditorGap = 8;
export const columnEditorRowHeight = 56;
export const columnWidthUnit = 42;
const defaultGridColumns = 24;
const newColumnPreferredSpan = 4;
const columnSettingsModes = ["list", "tile"] as const;

export type EditorDraftSettingsByMode = Partial<Record<EntityDataGridColumnSettingsMode, EntityDataGridColumnSetting[]>>;

export function createEditorDraftSettingsByMode<TRow>(
  columns: readonly EntityDataGridColumn<TRow>[],
  currentSettings: readonly EntityDataGridColumnSetting[],
  gridColumns: number,
  currentMode: EntityDataGridColumnSettingsMode,
  modeSettings: EntityDataGridModeSettingsMap | undefined
): EditorDraftSettingsByMode {
  const draftSettingsByMode: EditorDraftSettingsByMode = {};

  columnSettingsModes.forEach((mode) => {
    const hasModeSettings = Boolean(modeSettings?.[mode]?.columns.length);

    if (mode !== currentMode && !hasModeSettings) {
      return;
    }

    draftSettingsByMode[mode] = createEditorDraftColumnSettingsForMode(
      columns,
      currentSettings,
      gridColumns,
      currentMode,
      mode,
      modeSettings
    );
  });

  return draftSettingsByMode;
}

export function createEditorDraftColumnSettingsForMode<TRow>(
  columns: readonly EntityDataGridColumn<TRow>[],
  currentSettings: readonly EntityDataGridColumnSetting[],
  gridColumns: number,
  currentMode: EntityDataGridColumnSettingsMode,
  targetMode: EntityDataGridColumnSettingsMode,
  modeSettings: EntityDataGridModeSettingsMap | undefined
): EntityDataGridColumnSetting[] {
  const modeColumns = modeSettings?.[targetMode]?.columns;
  const sourceSettings = modeColumns?.length
    ? modeColumns
    : targetMode === currentMode
      ? currentSettings
      : createDefaultColumnSettings(columns, gridColumns);

  return createEditorDraftColumnSettings(columns, sourceSettings, gridColumns, targetMode);
}

export function createModeSettingsPayload(modeSettings: EditorDraftSettingsByMode): EntityDataGridModeSettingsMap {
  const nextModeSettings: EntityDataGridModeSettingsMap = {};

  columnSettingsModes.forEach((mode) => {
    const columns = modeSettings[mode];

    if (columns?.length) {
      nextModeSettings[mode] = { columns };
    }
  });

  return nextModeSettings;
}

function createEditorDraftColumnSettings<TRow>(
  columns: readonly EntityDataGridColumn<TRow>[],
  currentSettings: readonly EntityDataGridColumnSetting[],
  gridColumns: number,
  mode: EntityDataGridColumnSettingsMode
): EntityDataGridColumnSetting[] {
  const draftSettings = createDraftColumnSettings(columns, currentSettings, gridColumns);

  return normalizeColumnSettingsForEditorMode(
    columns,
    draftSettings,
    getEditorGridColumns(gridColumns, mode, draftSettings),
    mode
  );
}

function createDraftColumnSettings<TRow>(
  columns: readonly EntityDataGridColumn<TRow>[],
  currentSettings: readonly EntityDataGridColumnSetting[],
  gridColumns: number
): EntityDataGridColumnSetting[] {
  return normalizeDraftColumnSettings(columns, [
    ...currentSettings,
    ...columns
      .filter((column) => !currentSettings.some((setting) => setting.key === column.key))
      .map((column, index) => ({
        id: createColumnSettingId(column.key, currentSettings.length + index),
        key: column.key,
        path: column.path ?? column.key,
        visible: false,
        span: getDefaultColumnSpan(column, gridColumns),
        width: column.width
      } satisfies EntityDataGridColumnSetting))
  ], gridColumns);
}

function createDefaultColumnSettings<TRow>(
  columns: readonly EntityDataGridColumn<TRow>[],
  gridColumns: number
): EntityDataGridColumnSetting[] {
  const visibleColumns = columns.filter((column) => column.defaultVisible !== false);
  const sourceColumns = visibleColumns.length > 0 ? visibleColumns : columns.slice(0, 1);

  return normalizeDraftColumnSettings(columns, [
    ...sourceColumns.map((column, index) => ({
      id: createColumnSettingId(column.key, index),
      key: column.key,
      path: column.path ?? column.key,
      visible: true,
      span: getDefaultColumnSpan(column, gridColumns),
      width: column.width,
      order: index
    } satisfies EntityDataGridColumnSetting)),
    ...columns
      .filter((column) => !sourceColumns.some((visibleColumn) => visibleColumn.key === column.key))
      .map((column, index) => ({
        id: createColumnSettingId(column.key, sourceColumns.length + index),
        key: column.key,
        path: column.path ?? column.key,
        visible: false,
        span: getDefaultColumnSpan(column, gridColumns),
        width: column.width
      } satisfies EntityDataGridColumnSetting))
  ], gridColumns);
}

function normalizeDraftColumnSettings<TRow>(
  columns: readonly EntityDataGridColumn<TRow>[],
  settings: readonly EntityDataGridColumnSetting[],
  gridColumns: number
): EntityDataGridColumnSetting[] {
  const columnByKey = new Map(columns.map((column) => [column.key, column]));
  const uniqueSettings = new Map<string, EntityDataGridColumnSetting>();

  settings.forEach((setting, index) => {
    const column = columnByKey.get(setting.key);

    if (!column) {
      return;
    }

    const span = normalizeSpan(setting.span, gridColumns) ?? getDefaultColumnSpan(column, gridColumns);
    const label = normalizeLabel(setting.label);
    const path = normalizePath(setting.path) ?? column.path ?? setting.key;

    uniqueSettings.set(setting.key, {
      ...setting,
      id: getColumnSettingId(setting, index),
      path,
      visible: setting.visible !== false,
      span,
      width: setting.width ?? span * columnWidthUnit,
      order: setting.visible !== false ? setting.order ?? index : undefined,
      ...(label ? { label } : { label: undefined })
    });
  });

  columns.forEach((column, index) => {
    if (!uniqueSettings.has(column.key)) {
      const span = getDefaultColumnSpan(column, gridColumns);
      uniqueSettings.set(column.key, {
        id: createColumnSettingId(column.key, index),
        key: column.key,
        path: column.path ?? column.key,
        visible: false,
        span,
        width: column.width ?? span * columnWidthUnit
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
    .map((setting): EntityDataGridColumnSetting => {
      const { order: _order, ...hiddenSetting } = setting;
      return hiddenSetting;
    });

  return [...visible, ...hidden];
}

export function normalizeColumnSettingsForEditorMode<TRow>(
  columns: readonly EntityDataGridColumn<TRow>[],
  settings: readonly EntityDataGridColumnSetting[],
  gridColumns: number,
  mode: EntityDataGridColumnSettingsMode
): EntityDataGridColumnSetting[] {
  const normalizedSettings = normalizeDraftColumnSettings(columns, settings, gridColumns);

  if (mode !== "list") {
    return normalizedSettings;
  }

  return normalizeListColumnSettings(normalizedSettings, gridColumns);
}

export function addColumnToEditorSettings<TRow>(
  columns: readonly EntityDataGridColumn<TRow>[],
  settings: readonly EntityDataGridColumnSetting[],
  key: string,
  gridColumns: number,
  mode: EntityDataGridColumnSettingsMode,
  column?: EntityDataGridColumn<TRow>
): EntityDataGridColumnSetting[] {
  const targetColumn = column ?? columns.find((candidate) => candidate.key === key);
  const normalizedSettings = normalizeColumnSettingsForEditorMode(columns, settings, gridColumns, mode);
  const currentSetting = normalizedSettings.find((setting) => setting.key === key);

  if (currentSetting?.visible) {
    return normalizedSettings;
  }

  if (!currentSetting && !targetColumn) {
    return normalizedSettings;
  }

  const targetSetting = currentSetting ?? {
    id: createColumnSettingId(key, normalizedSettings.length),
    key,
    path: targetColumn?.path ?? key,
    visible: false,
    span: getDefaultColumnSpan(targetColumn, gridColumns),
    width: targetColumn?.width
  } satisfies EntityDataGridColumnSetting;
  const sourceSettings = currentSetting ? normalizedSettings : [...normalizedSettings, targetSetting];
  const visibleSettings = sourceSettings.filter((setting) => setting.visible && setting.key !== key);
  const nextVisibleSettings = mode === "list"
    ? addColumnToListRow(visibleSettings, targetSetting, gridColumns)
    : addColumnToTileRows(visibleSettings, targetSetting, gridColumns);

  return normalizeColumnSettingsForEditorMode(
    columns,
    applyVisibleColumnOrder(sourceSettings, nextVisibleSettings),
    gridColumns,
    mode
  );
}

function normalizeListColumnSettings(
  settings: readonly EntityDataGridColumnSetting[],
  gridColumns: number
): EntityDataGridColumnSetting[] {
  const visibleSettings: EntityDataGridColumnSetting[] = [];
  const hiddenSettings: EntityDataGridColumnSetting[] = [];
  let occupiedColumns = 0;

  settings.forEach((setting) => {
    if (!setting.visible) {
      hiddenSettings.push(hideColumnSetting(setting));
      return;
    }

    const span = clampGridSpan(setting.span ?? 1, gridColumns);

    if (occupiedColumns + span > gridColumns) {
      hiddenSettings.push(hideColumnSetting(setting));
      return;
    }

    visibleSettings.push({
      ...updateSettingSpan(setting, span, gridColumns),
      order: visibleSettings.length
    });
    occupiedColumns += span;
  });

  return [...visibleSettings, ...sortHiddenColumnSettings(hiddenSettings)];
}

function addColumnToListRow(
  visibleSettings: readonly EntityDataGridColumnSetting[],
  targetSetting: EntityDataGridColumnSetting,
  gridColumns: number
): EntityDataGridColumnSetting[] {
  const nextVisibleSettings = visibleSettings.map((setting) =>
    updateSettingSpan(setting, setting.span ?? 1, gridColumns)
  );
  const preferredSpan = clampGridSpan(newColumnPreferredSpan, gridColumns);
  let availableColumns = gridColumns - getSettingsSpanSum(nextVisibleSettings, gridColumns);

  if (availableColumns <= 0) {
    const shrinkableIndex = findLastShrinkableColumnIndex(nextVisibleSettings, gridColumns);

    if (shrinkableIndex >= 0) {
      const shrinkableSetting = nextVisibleSettings[shrinkableIndex];
      nextVisibleSettings[shrinkableIndex] = updateSettingSpan(
        shrinkableSetting,
        clampGridSpan((shrinkableSetting.span ?? 1) - 1, gridColumns),
        gridColumns
      );
    } else {
      nextVisibleSettings.pop();
    }

    availableColumns = Math.max(1, gridColumns - getSettingsSpanSum(nextVisibleSettings, gridColumns));
  }

  return [
    ...nextVisibleSettings,
    updateSettingSpan(targetSetting, Math.min(preferredSpan, availableColumns), gridColumns)
  ];
}

function addColumnToTileRows(
  visibleSettings: readonly EntityDataGridColumnSetting[],
  targetSetting: EntityDataGridColumnSetting,
  gridColumns: number
): EntityDataGridColumnSetting[] {
  const preferredSpan = clampGridSpan(newColumnPreferredSpan, gridColumns);
  const rows = getEditorGridRows(visibleSettings, gridColumns);
  const lastRow = rows[rows.length - 1] ?? [];
  const availableColumns = Math.max(0, gridColumns - getSettingsSpanSum(lastRow, gridColumns));
  const span = availableColumns > 0 ? Math.min(preferredSpan, availableColumns) : preferredSpan;

  return [...visibleSettings, updateSettingSpan(targetSetting, span, gridColumns)];
}

function applyVisibleColumnOrder(
  settings: readonly EntityDataGridColumnSetting[],
  visibleSettings: readonly EntityDataGridColumnSetting[]
): EntityDataGridColumnSetting[] {
  const visibleSettingByKey = new Map(
    visibleSettings.map((setting, index) => [
      setting.key,
      {
        ...setting,
        visible: true,
        order: index
      } satisfies EntityDataGridColumnSetting
    ])
  );

  return settings.map((setting) => visibleSettingByKey.get(setting.key) ?? hideColumnSetting(setting));
}

function findLastShrinkableColumnIndex(
  settings: readonly EntityDataGridColumnSetting[],
  gridColumns: number
): number {
  for (let index = settings.length - 1; index >= 0; index -= 1) {
    if (clampGridSpan(settings[index].span ?? 1, gridColumns) > 1) {
      return index;
    }
  }

  return -1;
}

function getSettingsSpanSum(settings: readonly EntityDataGridColumnSetting[], gridColumns: number): number {
  return settings.reduce((totalSpan, setting) => totalSpan + clampGridSpan(setting.span ?? 1, gridColumns), 0);
}

function updateSettingSpan(
  setting: EntityDataGridColumnSetting,
  span: number,
  gridColumns: number
): EntityDataGridColumnSetting {
  const nextSpan = clampGridSpan(span, gridColumns);

  return {
    ...setting,
    visible: true,
    span: nextSpan,
    width: nextSpan * columnWidthUnit
  };
}

function sortHiddenColumnSettings(
  settings: readonly EntityDataGridColumnSetting[]
): EntityDataGridColumnSetting[] {
  return [...settings]
    .map(hideColumnSetting)
    .sort((left, right) => left.key.localeCompare(right.key));
}

function hideColumnSetting(setting: EntityDataGridColumnSetting): EntityDataGridColumnSetting {
  const { order: _order, ...hiddenSetting } = setting;

  return {
    ...hiddenSetting,
    visible: false
  };
}

export function getEditorGridColumns(
  gridColumns: number,
  _mode: EntityDataGridColumnSettingsMode,
  _settings: readonly EntityDataGridColumnSetting[]
): number {
  return gridColumns;
}

export function getEditorGridRowCount(settings: readonly EntityDataGridColumnSetting[], gridColumns: number): number {
  return Math.max(1, getEditorGridRows(settings, gridColumns).length);
}

export function getMaxResizeSpanForCurrentRow(
  settings: readonly EntityDataGridColumnSetting[],
  key: string,
  gridColumns: number
): number {
  const row = getEditorGridRows(settings, gridColumns).find((items) =>
    items.some((setting) => setting.key === key)
  );

  if (!row) {
    return gridColumns;
  }

  const usedByRowNeighbors = row.reduce((totalSpan, setting) =>
    setting.key === key
      ? totalSpan
      : totalSpan + clampGridSpan(setting.span ?? 1, gridColumns),
  0);

  return Math.max(1, gridColumns - usedByRowNeighbors);
}

export function getEditorGridRows(
  settings: readonly EntityDataGridColumnSetting[],
  gridColumns: number
): EntityDataGridColumnSetting[][] {
  const rows: EntityDataGridColumnSetting[][] = [];
  let currentRow: EntityDataGridColumnSetting[] = [];
  let occupiedColumns = 0;

  settings
    .filter((setting) => setting.visible)
    .forEach((setting) => {
      const span = clampGridSpan(setting.span ?? 1, gridColumns);

      if (currentRow.length > 0 && occupiedColumns + span > gridColumns) {
        rows.push(currentRow);
        currentRow = [];
        occupiedColumns = 0;
      }

      currentRow.push(setting);
      occupiedColumns += span;

      if (occupiedColumns >= gridColumns) {
        rows.push(currentRow);
        currentRow = [];
        occupiedColumns = 0;
      }
    });

  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return rows;
}

export function moveDraftColumnSettings<TRow>(
  columns: readonly EntityDataGridColumn<TRow>[],
  settings: readonly EntityDataGridColumnSetting[],
  sourceKey: string,
  targetKey: string,
  gridColumns: number
): EntityDataGridColumnSetting[] {
  const visibleSettings = settings.filter((setting) => setting.visible);
  const hiddenSettings = settings.filter((setting) => !setting.visible);
  const sourceIndex = visibleSettings.findIndex((setting) => setting.key === sourceKey);
  const targetIndex = visibleSettings.findIndex((setting) => setting.key === targetKey);

  if (sourceIndex < 0 || targetIndex < 0) {
    return normalizeDraftColumnSettings(columns, settings, gridColumns);
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
  ], gridColumns);
}

export function mergeEditorColumns<TRow>(
  primaryColumns: readonly EntityDataGridColumn<TRow>[],
  secondaryColumns: readonly EntityDataGridColumn<TRow>[]
): EntityDataGridColumn<TRow>[] {
  const mergedColumns = new Map<string, EntityDataGridColumn<TRow>>();

  primaryColumns.forEach((column) => mergedColumns.set(column.key, column));
  secondaryColumns.forEach((column) => {
    if (!mergedColumns.has(column.key)) {
      mergedColumns.set(column.key, column);
    }
  });

  return [...mergedColumns.values()];
}

function normalizeLabel(value: unknown): string | undefined {
  const label = typeof value === "string" ? value.trim() : "";
  return label || undefined;
}

function normalizePath(value: unknown): string | undefined {
  const path = typeof value === "string" ? value.trim() : "";
  return path || undefined;
}

export function getColumnLabel<TRow>(
  column: EntityDataGridColumn<TRow>,
  setting: EntityDataGridColumnSetting
): string {
  return setting.label || getColumnBaseLabel(column);
}

export function getColumnBaseLabel<TRow>(column?: EntityDataGridColumn<TRow>): string {
  return column?.label ?? column?.path ?? column?.key ?? "";
}

function normalizeSpan(value: unknown, gridColumns: number): number | undefined {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? clampGridSpan(parsedValue, gridColumns) : undefined;
}

export function getDefaultColumnSpan<TRow>(column: EntityDataGridColumn<TRow> | undefined, gridColumns: number): number {
  if (column?.width) {
    return clampGridSpan(Math.round(column.width / columnWidthUnit), gridColumns);
  }

  return clampGridSpan(Math.max(1, Math.round(gridColumns / 6)), gridColumns);
}

export function clampGridColumns(value: number | undefined): number {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? Math.max(1, Math.min(48, Math.round(parsedValue))) : defaultGridColumns;
}

export function clampGridSpan(value: number, gridColumns: number): number {
  return Math.max(1, Math.min(gridColumns, Math.round(value)));
}

export function createColumnSettingId(key: string, index = Date.now()): string {
  return `${toDomId(key)}-${index}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getColumnSettingId(setting: EntityDataGridColumnSetting, index: number): string {
  return setting.id || createColumnSettingId(setting.key, index);
}

export function handleColumnDragStart(
  event: DragEvent<HTMLElement>,
  settingId: string,
  setDraggingId: (value: string | null) => void
): void {
  setDraggingId(settingId);
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", settingId);
}

export function handleColumnDrop(
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
