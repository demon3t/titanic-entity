import { createEntityGuid, getEntityValue, normalizeEntityProfileKey } from "../client/entityHelpers";
import { ConditionOperator } from "../enums/ConditionOperator";
import type { EntityApiClient } from "../client/EntityApiClient";
import type { EntityApiEntity } from "../models/EntityApiEntity";
import type { EntityGridColumnSettingsDto, EntityGridColumnSettingsSaveRequest } from "../models/EntityGridColumnSettings";

/** Service contract for persisting per-user grid column settings. */
export interface EntityGridColumnSettingsClient {
  /**
   * Loads the default settings for a grid and user pair.
   *
   * @param gridId Grid identifier.
   * @param userId User identifier.
   */
  getEntityGridColumnDefaultSettings(gridId: string, userId: string): Promise<EntityGridColumnSettingsDto | null>;

  /**
   * Loads the personal settings for a grid and user pair.
   *
   * @param gridId Grid identifier.
   * @param userId User identifier.
   */
  getEntityGridColumnPersonalSettings?(gridId: string, userId: string): Promise<EntityGridColumnSettingsDto | null>;

  /**
   * Saves the default settings for a grid and user pair.
   *
   * @param request Settings payload to persist.
   */
  saveEntityGridColumnDefaultSettings(request: EntityGridColumnSettingsSaveRequest): Promise<EntityGridColumnSettingsDto>;

  /**
   * Saves the personal settings for a grid and user pair.
   *
   * @param request Settings payload to persist.
   */
  saveEntityGridColumnPersonalSettings?(request: EntityGridColumnSettingsSaveRequest): Promise<EntityGridColumnSettingsDto>;
}

type EntityGridColumnSettingsTransport = Pick<EntityApiClient, "save" | "selectRows">;

const gridColumnSettingsEntity = {
  name: "sys_user_grid_column_setting",
  columns: {
    id: "Id",
    userId: "UserId",
    gridId: "GridId",
    name: "Name",
    columnsJson: "ColumnsJson",
    isDefault: "IsDefault",
    updatedAt: "UpdatedAt"
  }
} as const;

/** Default implementation backed by {@link EntityApiClient}. */
export class EntityGridColumnSettingsApiClient implements EntityGridColumnSettingsClient {
  /**
   * Creates a new grid column settings client.
   *
   * @param client Entity API transport used to read and save records.
   */
  constructor(private readonly client: EntityGridColumnSettingsTransport) {}

  /**
   * Loads the default settings for a grid and user pair.
   *
   * @param gridId Grid identifier.
   * @param userId User identifier.
   */
  async getEntityGridColumnDefaultSettings(gridId: string, userId: string): Promise<EntityGridColumnSettingsDto | null> {
    return this.getEntityGridColumnSettingsByDefaultState(gridId, userId, true);
  }

  /**
   * Loads the personal settings for a grid and user pair.
   *
   * @param gridId Grid identifier.
   * @param userId User identifier.
   */
  async getEntityGridColumnPersonalSettings(gridId: string, userId: string): Promise<EntityGridColumnSettingsDto | null> {
    return this.getEntityGridColumnSettingsByDefaultState(gridId, userId, false);
  }

  private async getEntityGridColumnSettingsByDefaultState(
    gridId: string,
    userId: string,
    isDefault: boolean
  ): Promise<EntityGridColumnSettingsDto | null> {
    const columns = gridColumnSettingsEntity.columns;
    const safeGridId = normalizeEntityProfileKey(gridId);
    const safeUserId = normalizeEntityProfileKey(userId);
    const rows = await this.client.selectRows(gridColumnSettingsEntity.name, [
      {
        path: columns.gridId,
        comparisonType: ConditionOperator.Equal,
        value: safeGridId
      },
      {
        path: columns.userId,
        comparisonType: ConditionOperator.Equal,
        value: safeUserId
      },
      {
        path: columns.isDefault,
        comparisonType: ConditionOperator.Equal,
        value: isDefault
      }
    ], undefined, 1, [
      columns.id,
      columns.userId,
      columns.gridId,
      columns.name,
      columns.columnsJson,
      columns.isDefault,
      columns.updatedAt
    ]);

    return rows[0] ? mapEntityGridColumnSettingsRow(rows[0]) : null;
  }

  /**
   * Saves the default settings for a grid and user pair.
   *
   * @param request Settings payload to persist.
   */
  async saveEntityGridColumnDefaultSettings(request: EntityGridColumnSettingsSaveRequest): Promise<EntityGridColumnSettingsDto> {
    return this.saveEntityGridColumnSettingsByDefaultState(request, true);
  }

  /**
   * Saves the personal settings for a grid and user pair.
   *
   * @param request Settings payload to persist.
   */
  async saveEntityGridColumnPersonalSettings(request: EntityGridColumnSettingsSaveRequest): Promise<EntityGridColumnSettingsDto> {
    return this.saveEntityGridColumnSettingsByDefaultState(request, false);
  }

  private async saveEntityGridColumnSettingsByDefaultState(
    request: EntityGridColumnSettingsSaveRequest,
    isDefault: boolean
  ): Promise<EntityGridColumnSettingsDto> {
    const columns = gridColumnSettingsEntity.columns;
    const safeGridId = normalizeEntityProfileKey(request.gridId);
    const safeUserId = normalizeEntityProfileKey(request.userId);
    const existing = await this.getEntityGridColumnSettingsByDefaultState(safeGridId, safeUserId, isDefault);
    const values = {
      [columns.id]: existing?.id ?? createEntityGuid(),
      [columns.userId]: safeUserId,
      [columns.gridId]: safeGridId,
      [columns.name]: request.name?.trim() || (isDefault ? "Default" : "Personal"),
      [columns.columnsJson]: JSON.stringify(normalizeEntityGridColumnSettingsPayload({
        columns: request.columns,
        displayMode: request.displayMode,
        columnSettingsMode: request.columnSettingsMode,
        modeSettings: request.modeSettings,
        sort: request.sort
      })),
      [columns.isDefault]: isDefault,
      [columns.updatedAt]: new Date().toISOString()
    };

    const savedRow = await this.client.save(gridColumnSettingsEntity.name, values);

    return mapEntityGridColumnSettingsRow(savedRow);
  }
}

function mapEntityGridColumnSettingsRow(row: EntityApiEntity): EntityGridColumnSettingsDto {
  const columns = gridColumnSettingsEntity.columns;
  const parsedSettings = parseEntityGridColumnSettings(getEntityValue<string>(row, columns.columnsJson));

  return {
    id: getEntityValue<string>(row, columns.id) ?? "",
    userId: getEntityValue<string>(row, columns.userId) ?? "",
    gridId: getEntityValue<string>(row, columns.gridId) ?? "",
    name: getEntityValue<string>(row, columns.name) ?? "",
    columns: parsedSettings.columns,
    ...(parsedSettings.displayMode ? { displayMode: parsedSettings.displayMode } : {}),
    ...(parsedSettings.columnSettingsMode ? { columnSettingsMode: parsedSettings.columnSettingsMode } : {}),
    ...(parsedSettings.modeSettings ? { modeSettings: parsedSettings.modeSettings } : {}),
    ...(parsedSettings.sort ? { sort: parsedSettings.sort } : {}),
    isDefault: toBoolean(getEntityValue<unknown>(row, columns.isDefault)),
    updatedAt: getEntityValue<string>(row, columns.updatedAt) ?? ""
  };
}

type ParsedEntityGridColumnSettings = {
  columns: EntityGridColumnSettingsDto["columns"];
  displayMode?: EntityGridColumnSettingsDto["displayMode"];
  columnSettingsMode?: EntityGridColumnSettingsDto["columnSettingsMode"];
  modeSettings?: EntityGridColumnSettingsDto["modeSettings"];
  sort?: EntityGridColumnSettingsDto["sort"];
};

function parseEntityGridColumnSettings(value: string | null): ParsedEntityGridColumnSettings {
  if (!value) {
    return { columns: [] };
  }

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return { columns: normalizeEntityGridColumnSettings(parsed) };
    }

    if (parsed && typeof parsed === "object") {
      const payload = parsed as Record<string, unknown>;
      const displayMode = toColumnSettingsMode(payload.displayMode) ?? toColumnSettingsMode(payload.columnSettingsMode);
      const columnSettingsMode = toColumnSettingsMode(payload.columnSettingsMode) ?? displayMode;
      const modeSettings = normalizeEntityGridModeSettings(payload.modeSettings);
      const sort = normalizeEntityGridSortSetting(payload.sort);
      const columns = Array.isArray(payload.columns)
        ? normalizeEntityGridColumnSettings(payload.columns)
        : getEntityGridModeColumns(modeSettings, displayMode ?? columnSettingsMode);

      return {
        columns,
        ...(displayMode ? { displayMode } : {}),
        ...(columnSettingsMode ? { columnSettingsMode } : {}),
        ...(modeSettings ? { modeSettings } : {}),
        ...(sort ? { sort } : {})
      };
    }

    return { columns: [] };
  } catch {
    return { columns: [] };
  }
}

function normalizeEntityGridColumnSettingsPayload(value: {
  columns: readonly unknown[];
  displayMode?: unknown;
  columnSettingsMode?: unknown;
  modeSettings?: unknown;
  sort?: unknown;
}): ParsedEntityGridColumnSettings {
  const displayMode = toColumnSettingsMode(value.displayMode) ?? toColumnSettingsMode(value.columnSettingsMode);
  const columnSettingsMode = toColumnSettingsMode(value.columnSettingsMode) ?? displayMode;
  const columns = normalizeEntityGridColumnSettings(value.columns);
  const modeSettings = normalizeEntityGridModeSettings(value.modeSettings);
  const sort = normalizeEntityGridSortSetting(value.sort);
  const activeMode = columnSettingsMode ?? displayMode;

  const nextModeSettings = activeMode
    ? {
        ...modeSettings,
        [activeMode]: { columns }
      }
    : modeSettings;
  const normalizedModeSettings = normalizeEntityGridModeSettings(nextModeSettings);

  return {
    columns,
    ...(displayMode ? { displayMode } : {}),
    ...(columnSettingsMode ? { columnSettingsMode } : {}),
    ...(normalizedModeSettings ? { modeSettings: normalizedModeSettings } : {}),
    ...(sort ? { sort } : {})
  };
}

function normalizeEntityGridModeSettings(value: unknown): EntityGridColumnSettingsDto["modeSettings"] {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const payload = value as Record<string, unknown>;
  const modeSettings: EntityGridColumnSettingsDto["modeSettings"] = {};

  (["list", "tile"] as const).forEach((mode) => {
    const modePayload = payload[mode];
    const rawColumns = Array.isArray(modePayload)
      ? modePayload
      : modePayload && typeof modePayload === "object" && Array.isArray((modePayload as Record<string, unknown>).columns)
        ? (modePayload as Record<string, unknown>).columns as readonly unknown[]
        : undefined;

    if (!rawColumns) {
      return;
    }

    const columns = normalizeEntityGridColumnSettings(rawColumns);

    if (columns.length) {
      modeSettings[mode] = { columns };
    }
  });

  return hasEntityGridModeSettings(modeSettings) ? modeSettings : undefined;
}

function getEntityGridModeColumns(
  modeSettings: EntityGridColumnSettingsDto["modeSettings"],
  mode: EntityGridColumnSettingsDto["columnSettingsMode"]
): EntityGridColumnSettingsDto["columns"] {
  if (mode && modeSettings?.[mode]?.columns.length) {
    return modeSettings[mode].columns;
  }

  return modeSettings?.list?.columns ?? modeSettings?.tile?.columns ?? [];
}

function hasEntityGridModeSettings(modeSettings: EntityGridColumnSettingsDto["modeSettings"]): boolean {
  return Boolean(modeSettings?.list?.columns.length || modeSettings?.tile?.columns.length);
}

function normalizeEntityGridColumnSettings(value: readonly unknown[]): EntityGridColumnSettingsDto["columns"] {
  const settings: EntityGridColumnSettingsDto["columns"] = [];

  value.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      return;
    }

    const column = item as Record<string, unknown>;
    const rawField = normalizeEntityGridColumnField(column.field);
    const legacyKey = toPositiveString(column.key);
    const fieldPath = toPositiveString(rawField?.path);
    const fieldKey = toPositiveString(rawField?.key) ?? legacyKey;
    const fieldAlias = toPositiveString(rawField?.alias);
    const fieldCaption = toPositiveString(rawField?.caption);
    const path = toPositiveString(column.path) ?? fieldPath ?? fieldKey ?? fieldAlias ?? legacyKey;
    const id = typeof column.id === "string" ? column.id.trim() : "";
    const caption = toPositiveString(column.caption) ?? toPositiveString(column.label) ?? fieldCaption;
    const span = toGridSpan(column.span);
    const width = toPositiveNumber(column.width);

    if (!path) {
      return;
    }

    const field = normalizeEntityGridColumnField({
      ...rawField,
      ...(fieldKey ? { key: fieldKey } : {}),
      path,
      ...(fieldAlias ? { alias: fieldAlias } : {}),
      ...(caption ? { caption } : {})
    });

    settings.push({
      ...(id ? { id } : {}),
      path,
      visible: column.visible !== false,
      ...(caption ? { caption } : {}),
      ...(field ? { field } : {}),
      ...(span ? { span } : {}),
      ...(width ? { width } : {}),
      order: toFiniteNumber(column.order) ?? index
    });
  });

  return settings;
}

function normalizeEntityGridColumnField(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const field: Record<string, unknown> = {};

  Object.entries(value as Record<string, unknown>).forEach(([key, fieldValue]) => {
    if (fieldValue === null || fieldValue === undefined) {
      return;
    }

    if (typeof fieldValue === "string") {
      const normalizedValue = fieldValue.trim();

      if (normalizedValue) {
        field[key] = normalizedValue;
      }

      return;
    }

    field[key] = fieldValue;
  });

  return Object.keys(field).length ? field : undefined;
}

function toColumnSettingsMode(value: unknown): EntityGridColumnSettingsDto["columnSettingsMode"] {
  return value === "list" || value === "tile" ? value : undefined;
}

function normalizeEntityGridSortSetting(value: unknown): EntityGridColumnSettingsDto["sort"] {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const payload = value as Record<string, unknown>;
  const path = toPositiveString(payload.path);
  const key = toPositiveString(payload.key) ?? path;

  if (!key) {
    return undefined;
  }

  const rawDirection = typeof payload.direction === "string" ? payload.direction.toLowerCase() : "";
  const direction = rawDirection === "desc" || rawDirection === "descending" ? "desc" : "asc";

  return {
    key,
    ...(path ? { path } : {}),
    direction
  };
}

function toPositiveNumber(value: unknown): number | undefined {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) && parsedValue > 0 ? Math.round(parsedValue) : undefined;
}

function toPositiveString(value: unknown): string | undefined {
  const normalizedValue = typeof value === "string" ? value.trim() : "";

  return normalizedValue || undefined;
}

function toGridSpan(value: unknown): number | undefined {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? Math.max(1, Math.min(24, Math.round(parsedValue)))
    : undefined;
}

function toFiniteNumber(value: unknown): number | undefined {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

function toBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === "1" ||
    (typeof value === "string" && value.toLowerCase() === "true");
}
