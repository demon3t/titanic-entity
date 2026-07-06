import { ConditionOperator } from "../enums/ConditionOperator";
import { createEntityGuid, getEntityValue, normalizeEntityProfileKey } from "../client/entityHelpers";
import type { EntityApiClient } from "../client/EntityApiClient";
import type { EntityApiEntity } from "../models/EntityApiEntity";
import type { EntityGridColumnSettingsDto, EntityGridColumnSettingsSaveRequest } from "../models/EntityGridColumnSettings";

export interface EntityGridColumnSettingsClient {
  getEntityGridColumnDefaultSettings(gridId: string, userId: string): Promise<EntityGridColumnSettingsDto | null>;
  saveEntityGridColumnDefaultSettings(request: EntityGridColumnSettingsSaveRequest): Promise<EntityGridColumnSettingsDto>;
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

export class EntityGridColumnSettingsApiClient implements EntityGridColumnSettingsClient {
  constructor(private readonly client: EntityGridColumnSettingsTransport) {}

  async getEntityGridColumnDefaultSettings(gridId: string, userId: string): Promise<EntityGridColumnSettingsDto | null> {
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
        value: true
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

  async saveEntityGridColumnDefaultSettings(request: EntityGridColumnSettingsSaveRequest): Promise<EntityGridColumnSettingsDto> {
    const columns = gridColumnSettingsEntity.columns;
    const safeGridId = normalizeEntityProfileKey(request.gridId);
    const safeUserId = normalizeEntityProfileKey(request.userId);
    const existing = await this.getEntityGridColumnDefaultSettings(safeGridId, safeUserId);
    const values = {
      [columns.id]: existing?.id ?? createEntityGuid(),
      [columns.userId]: safeUserId,
      [columns.gridId]: safeGridId,
      [columns.name]: request.name?.trim() || "Default",
      [columns.columnsJson]: JSON.stringify(normalizeEntityGridColumnSettingsPayload({
        columns: request.columns,
        displayMode: request.displayMode,
        columnSettingsMode: request.columnSettingsMode,
        modeSettings: request.modeSettings
      })),
      [columns.isDefault]: request.isDefault ?? true,
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
    isDefault: toBoolean(getEntityValue<unknown>(row, columns.isDefault)),
    updatedAt: getEntityValue<string>(row, columns.updatedAt) ?? ""
  };
}

type ParsedEntityGridColumnSettings = Pick<EntityGridColumnSettingsDto, "columns" | "displayMode" | "columnSettingsMode" | "modeSettings">;

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
      const columns = Array.isArray(payload.columns)
        ? normalizeEntityGridColumnSettings(payload.columns)
        : getEntityGridModeColumns(modeSettings, displayMode ?? columnSettingsMode);

      return {
        columns,
        ...(displayMode ? { displayMode } : {}),
        ...(columnSettingsMode ? { columnSettingsMode } : {}),
        ...(modeSettings ? { modeSettings } : {})
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
}): ParsedEntityGridColumnSettings {
  const displayMode = toColumnSettingsMode(value.displayMode) ?? toColumnSettingsMode(value.columnSettingsMode);
  const columnSettingsMode = toColumnSettingsMode(value.columnSettingsMode) ?? displayMode;
  const columns = normalizeEntityGridColumnSettings(value.columns);
  const modeSettings = normalizeEntityGridModeSettings(value.modeSettings);
  const nextModeSettings = displayMode
    ? {
        ...modeSettings,
        [displayMode]: { columns }
      }
    : modeSettings;
  const normalizedModeSettings = normalizeEntityGridModeSettings(nextModeSettings);

  return {
    columns,
    ...(displayMode ? { displayMode } : {}),
    ...(columnSettingsMode ? { columnSettingsMode } : {}),
    ...(normalizedModeSettings ? { modeSettings: normalizedModeSettings } : {})
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
    const key = typeof column.key === "string" ? column.key.trim() : "";
    const path = toPositiveString(column.path);
    const id = typeof column.id === "string" ? column.id.trim() : "";
    const label = toPositiveString(column.label);
    const span = toGridSpan(column.span);
    const width = toPositiveNumber(column.width);

    if (!key) {
      return;
    }

    settings.push({
      ...(id ? { id } : {}),
      key,
      ...(path ? { path } : {}),
      visible: column.visible !== false,
      ...(label ? { label } : {}),
      ...(span ? { span } : {}),
      ...(width ? { width } : {}),
      order: toFiniteNumber(column.order) ?? index
    });
  });

  return settings;
}

function toColumnSettingsMode(value: unknown): EntityGridColumnSettingsDto["columnSettingsMode"] {
  return value === "list" || value === "tile" ? value : undefined;
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
