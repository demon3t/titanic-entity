export interface EntityGridColumnSetting {
  id?: string;
  key: string;
  path?: string;
  visible: boolean;
  span?: number;
  width?: number;
  order?: number;
  label?: string;
}

export type EntityGridColumnSettingsMode = "list" | "tile";

export interface EntityGridModeColumnSettings {
  columns: EntityGridColumnSetting[];
}

export type EntityGridModeSettingsMap = Partial<Record<EntityGridColumnSettingsMode, EntityGridModeColumnSettings>>;

// DTO пользовательской настройки колонок грида, которая хранится в системной таблице Entity ORM.
export interface EntityGridColumnSettingsDto {
  id: string;
  userId: string;
  gridId: string;
  name: string;
  columns: EntityGridColumnSetting[];
  displayMode?: EntityGridColumnSettingsMode;
  columnSettingsMode?: EntityGridColumnSettingsMode;
  modeSettings?: EntityGridModeSettingsMap;
  isDefault: boolean;
  updatedAt: string;
}

export interface EntityGridColumnSettingsSaveRequest {
  userId: string;
  gridId: string;
  name?: string;
  columns: readonly EntityGridColumnSetting[];
  displayMode?: EntityGridColumnSettingsMode;
  columnSettingsMode?: EntityGridColumnSettingsMode;
  modeSettings?: EntityGridModeSettingsMap;
  isDefault?: boolean;
}
