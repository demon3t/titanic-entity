import type { DragEvent } from "react";
import type {
  EntityDataGridColumn,
  EntityDataGridColumnField,
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

export function createColumnSettingsPayload<TRow>(
  columns: readonly EntityDataGridColumn<TRow>[],
  settings: readonly EntityDataGridColumnSetting[]
): EntityDataGridColumnSetting[] {
  const columnByKey = new Map(columns.map((column) => [column.key, column]));

  return settings.flatMap((setting, index) => {
    const key = getSettingKey(setting);
    const column = key ? columnByKey.get(key) : undefined;
    const path = getSettingPath(setting, column);

    if (!path) {
      return [];
    }

    const caption = getSettingCaption(setting)
      ?? normalizeLabel(column?.label)
      ?? getReadableLabelFromPath(path)
      ?? getLabelFromPath(path);
    const field = createSettingField(column, setting, key ?? path, path, caption);
    const order = Number(setting.order);
    const hasRelativeSpan = hasPositiveSpan(setting.span);

    return [{
      ...(setting.id ? { id: setting.id } : {}),
      path,
      ...(caption ? { caption } : {}),
      ...(field ? { field } : {}),
      visible: setting.visible !== false,
      ...(hasRelativeSpan ? { span: setting.span } : {}),
      ...(!hasRelativeSpan && setting.width ? { width: setting.width } : {}),
      order: Number.isFinite(order) ? order : index
    } satisfies EntityDataGridColumnSetting];
  });
}

export function createModeSettingsPayload<TRow>(
  columns: readonly EntityDataGridColumn<TRow>[],
  modeSettings: EditorDraftSettingsByMode
): EntityDataGridModeSettingsMap {
  const nextModeSettings: EntityDataGridModeSettingsMap = {};

  columnSettingsModes.forEach((mode) => {
    const modeColumns = modeSettings[mode];

    if (modeColumns?.length) {
      nextModeSettings[mode] = { columns: createColumnSettingsPayload(columns, modeColumns) };
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
      .filter((column) => !currentSettings.some((setting) => getSettingKey(setting) === column.key))
      .map((column, index) => {
        const path = column.path ?? column.key;
        const caption = column.label;

        return {
          id: createColumnSettingId(column.key, currentSettings.length + index),
          key: column.key,
          path,
          caption,
          field: createSettingField(column, undefined, column.key, path, caption),
          visible: false,
          span: getDefaultColumnSpan(column, gridColumns),
          width: column.width
        } satisfies EntityDataGridColumnSetting;
      })
  ], gridColumns);
}

function createDefaultColumnSettings<TRow>(
  columns: readonly EntityDataGridColumn<TRow>[],
  gridColumns: number
): EntityDataGridColumnSetting[] {
  const visibleColumns = columns.filter((column) => column.defaultVisible !== false);
  const sourceColumns = visibleColumns.length > 0 ? visibleColumns : columns.slice(0, 1);

  return normalizeDraftColumnSettings(columns, [
    ...sourceColumns.map((column, index) => {
      const path = column.path ?? column.key;
      const caption = column.label;

      return {
        id: createColumnSettingId(column.key, index),
        key: column.key,
        path,
        caption,
        field: createSettingField(column, undefined, column.key, path, caption),
        visible: true,
        span: getDefaultColumnSpan(column, gridColumns),
        width: column.width,
        order: index
      } satisfies EntityDataGridColumnSetting;
    }),
    ...columns
      .filter((column) => !sourceColumns.some((visibleColumn) => visibleColumn.key === column.key))
      .map((column, index) => {
        const path = column.path ?? column.key;
        const caption = column.label;

        return {
          id: createColumnSettingId(column.key, sourceColumns.length + index),
          key: column.key,
          path,
          caption,
          field: createSettingField(column, undefined, column.key, path, caption),
          visible: false,
          span: getDefaultColumnSpan(column, gridColumns),
          width: column.width
        } satisfies EntityDataGridColumnSetting;
      })
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
    const key = getSettingKey(setting);

    if (!key) {
      return;
    }

    const normalizedSetting = { ...setting, key };
    const column = columnByKey.get(key) ?? createColumnFromSetting<TRow>(normalizedSetting);

    if (!column) {
      return;
    }

    const span = normalizeSpan(setting.span, gridColumns) ?? getDefaultColumnSpan(column, gridColumns);
    const path = getSettingPath(normalizedSetting, column) ?? key;
    const caption = getSettingCaption(setting) ?? (columnByKey.has(key) ? undefined : normalizeLabel(column.label));

    uniqueSettings.set(key, {
      ...normalizedSetting,
      id: getColumnSettingId(normalizedSetting, index),
      path,
      caption,
      field: createSettingField(column, normalizedSetting, key, path, caption ?? column.label),
      visible: setting.visible !== false,
      span,
      width: setting.width,
      order: setting.visible !== false ? setting.order ?? index : undefined,
      label: undefined
    });
  });

  columns.forEach((column, index) => {
    if (!uniqueSettings.has(column.key)) {
      const span = getDefaultColumnSpan(column, gridColumns);
      const path = column.path ?? column.key;
      const caption = column.label;

      uniqueSettings.set(column.key, {
        id: createColumnSettingId(column.key, index),
        key: column.key,
        path,
        caption,
        field: createSettingField(column, undefined, column.key, path, caption),
        visible: false,
        span,
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
    .sort((left, right) => (getSettingKey(left) ?? "").localeCompare(getSettingKey(right) ?? ""))
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
  const normalizedKey = normalizePath(key);
  const normalizedSettings = normalizeColumnSettingsForEditorMode(columns, settings, gridColumns, mode);

  if (!normalizedKey) {
    return normalizedSettings;
  }

  const targetColumn = column ?? columns.find((candidate) => candidate.key === normalizedKey);
  const currentSetting = normalizedSettings.find((setting) => getSettingKey(setting) === normalizedKey);

  if (currentSetting?.visible) {
    return normalizedSettings;
  }

  if (!currentSetting && !targetColumn) {
    return normalizedSettings;
  }

  const fallbackSetting = currentSetting ?? ({
    key: normalizedKey,
    path: targetColumn?.path ?? normalizedKey
  } as EntityDataGridColumnSetting);
  const targetPath = getSettingPath(fallbackSetting, targetColumn) ?? normalizedKey;
  const targetCaption = normalizeLabel(column?.label)
    ?? (currentSetting ? getSettingCaption(currentSetting) : undefined)
    ?? normalizeLabel(targetColumn?.label);
  const targetSetting = {
    ...(currentSetting ?? {
      id: createColumnSettingId(normalizedKey, normalizedSettings.length),
      span: getDefaultColumnSpan(targetColumn, gridColumns),
      width: targetColumn?.width
    }),
    key: normalizedKey,
    path: targetPath,
    caption: targetCaption,
    field: createSettingField(
      targetColumn,
      currentSetting,
      normalizedKey,
      targetPath,
      targetCaption
    ),
    visible: false,
    span: currentSetting?.span ?? getDefaultColumnSpan(targetColumn, gridColumns),
    width: currentSetting?.width ?? targetColumn?.width
  } satisfies EntityDataGridColumnSetting;
  const sourceSettings = currentSetting
    ? normalizedSettings.map((setting) =>
      getSettingKey(setting) === normalizedKey ? targetSetting : setting
    )
    : [...normalizedSettings, targetSetting];
  const visibleSettings = sourceSettings.filter((setting) => setting.visible && getSettingKey(setting) !== normalizedKey);
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
  const visibleSettingEntries: [string, EntityDataGridColumnSetting][] = [];

  visibleSettings.forEach((setting, index) => {
    const key = getSettingKey(setting);

    if (!key) {
      return;
    }

    visibleSettingEntries.push([
      key,
      {
        ...setting,
        key,
        visible: true,
        order: index
      } satisfies EntityDataGridColumnSetting
    ]);
  });

  const visibleSettingByKey = new Map(visibleSettingEntries);

  return settings.map((setting) => visibleSettingByKey.get(getSettingKey(setting) ?? "") ?? hideColumnSetting(setting));
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
  const { width: _width, ...settingWithoutWidth } = setting;

  return {
    ...settingWithoutWidth,
    visible: true,
    span: nextSpan
  };
}

function sortHiddenColumnSettings(
  settings: readonly EntityDataGridColumnSetting[]
): EntityDataGridColumnSetting[] {
  return [...settings]
    .map(hideColumnSetting)
    .sort((left, right) => (getSettingKey(left) ?? "").localeCompare(getSettingKey(right) ?? ""));
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
  const normalizedKey = normalizePath(key) ?? key;
  const row = getEditorGridRows(settings, gridColumns).find((items) =>
    items.some((setting) => getSettingKey(setting) === normalizedKey)
  );

  if (!row) {
    return gridColumns;
  }

  const usedByRowNeighbors = row.reduce((totalSpan, setting) =>
    getSettingKey(setting) === normalizedKey
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
  const normalizedSourceKey = normalizePath(sourceKey) ?? sourceKey;
  const normalizedTargetKey = normalizePath(targetKey) ?? targetKey;
  const visibleSettings = settings.filter((setting) => setting.visible);
  const hiddenSettings = settings.filter((setting) => !setting.visible);
  const sourceIndex = visibleSettings.findIndex((setting) => getSettingKey(setting) === normalizedSourceKey);
  const targetIndex = visibleSettings.findIndex((setting) => getSettingKey(setting) === normalizedTargetKey);

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

export function createEditorColumnsFromSettings<TRow>(
  columns: readonly EntityDataGridColumn<TRow>[],
  settingsGroups: readonly (readonly EntityDataGridColumnSetting[] | null | undefined)[]
): EntityDataGridColumn<TRow>[] {
  const knownColumnKeys = new Set(columns.map((column) => column.key));
  const settingColumns: EntityDataGridColumn<TRow>[] = [];

  settingsGroups.forEach((settings) => {
    settings?.forEach((setting) => {
      const key = getSettingKey(setting);

      if (!key || knownColumnKeys.has(key)) {
        return;
      }

      const column = createColumnFromSetting<TRow>({ ...setting, key });

      if (!column) {
        return;
      }

      knownColumnKeys.add(column.key);
      settingColumns.push(column);
    });
  });

  return settingColumns;
}

function normalizeLabel(value: unknown): string | undefined {
  const label = typeof value === "string" ? value.trim() : "";
  return label || undefined;
}

function normalizePath(value: unknown): string | undefined {
  const path = typeof value === "string" ? value.trim() : "";
  return path || undefined;
}

function getSettingField(setting: Pick<EntityDataGridColumnSetting, "field"> | undefined): EntityDataGridColumnField | undefined {
  return setting?.field && typeof setting.field === "object" && !Array.isArray(setting.field)
    ? setting.field
    : undefined;
}

function getColumnField<TRow>(column: EntityDataGridColumn<TRow> | undefined): EntityDataGridColumnField | undefined {
  return column?.field && typeof column.field === "object" && !Array.isArray(column.field)
    ? column.field
    : undefined;
}

function getSettingKey(setting: EntityDataGridColumnSetting): string | undefined {
  const field = getSettingField(setting);

  return normalizePath(setting.key)
    ?? normalizePath(field?.key)
    ?? normalizePath(field?.alias)
    ?? normalizePath(field?.path)
    ?? normalizePath(setting.path);
}

function getSettingPath<TRow>(
  setting: EntityDataGridColumnSetting,
  column?: EntityDataGridColumn<TRow>
): string | undefined {
  const field = getSettingField(setting);

  return normalizePath(setting.path)
    ?? normalizePath(field?.path)
    ?? normalizePath(column?.path)
    ?? getSettingKey(setting);
}

function getSettingCaption(setting: EntityDataGridColumnSetting): string | undefined {
  const field = getSettingField(setting);

  return normalizeLabel(setting.caption)
    ?? normalizeLabel(setting.label)
    ?? normalizeLabel(field?.caption);
}

function createSettingField<TRow>(
  column: EntityDataGridColumn<TRow> | undefined,
  setting: EntityDataGridColumnSetting | undefined,
  key: string | undefined,
  path: string | undefined,
  caption: string | undefined
): EntityDataGridColumnField | undefined {
  const columnField = getColumnField(column);
  const settingField = getSettingField(setting);
  const alias = normalizePath(settingField?.alias) ?? normalizePath(columnField?.alias) ?? normalizePath(column?.alias);
  const sortPath =
    normalizePath(setting?.sortPath) ??
    normalizePath(settingField?.sortPath) ??
    normalizePath(column?.sortPath) ??
    normalizePath(columnField?.sortPath);
  const nextField: EntityDataGridColumnField = {
    ...(columnField ?? {}),
    ...(settingField ?? {}),
    ...(key ? { key } : {}),
    ...(path ? { path } : {}),
    ...(sortPath ? { sortPath } : {}),
    ...(alias ? { alias } : {}),
    ...(caption ? { caption } : {})
  };

  return Object.keys(nextField).length ? nextField : undefined;
}

function createColumnFromSetting<TRow>(
  setting: EntityDataGridColumnSetting
): EntityDataGridColumn<TRow> | undefined {
  const key = getSettingKey(setting);

  if (!key) {
    return undefined;
  }

  const path = getSettingPath(setting) ?? key;
  const settingCaption = getSettingCaption(setting);
  const label = settingCaption && !isPathLeafLabel(settingCaption, path)
    ? settingCaption
    : getReadableLabelFromPath(path) ?? settingCaption ?? getLabelFromPath(path);

  return {
    key,
    label,
    path,
    ...(setting.sortPath ? { sortPath: setting.sortPath } : {}),
    field: createSettingField(undefined, setting, key, path, label),
    defaultVisible: false,
    width: setting.width
  };
}

function getLabelFromPath(path: string): string {
  return path
    .split(".")
    .map((part) => part.trim())
    .filter(Boolean)
    .pop() ?? path;
}

function splitTechnicalName(value: string): string {
  const normalizedValue = value.trim().replace(/Id$/, "");

  return normalizedValue
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim() || value;
}

function getReadableLabelFromPath(path: string): string | undefined {
  const parts = path
    .split(".")
    .map((part) => splitTechnicalName(part))
    .filter(Boolean);

  return parts.length > 0 ? parts.join(" / ") : undefined;
}

function isPathLeafLabel(label: string | undefined, path: string | undefined): boolean {
  if (!label || !path?.includes(".")) {
    return false;
  }

  return getLabelFromPath(path).localeCompare(label, undefined, { sensitivity: "accent" }) === 0;
}

export function getColumnLabel<TRow>(
  column: EntityDataGridColumn<TRow>,
  setting: EntityDataGridColumnSetting
): string {
  const settingCaption = getSettingCaption(setting);
  const path = getSettingPath(setting, column) ?? normalizePath(column.key);

  if (settingCaption && !isPathLeafLabel(settingCaption, path)) {
    return settingCaption;
  }

  return getColumnBaseLabel(column);
}

export function getColumnBaseLabel<TRow>(column?: EntityDataGridColumn<TRow>): string {
  const field = getColumnField(column);

  return column?.label ?? field?.caption ?? column?.path ?? field?.path ?? column?.key ?? "";
}

function normalizeSpan(value: unknown, gridColumns: number): number | undefined {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? clampGridSpan(parsedValue, gridColumns) : undefined;
}

function hasPositiveSpan(value: unknown): boolean {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) && parsedValue > 0;
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
  return setting.id || createColumnSettingId(getSettingKey(setting) ?? setting.path ?? "column", index);
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
