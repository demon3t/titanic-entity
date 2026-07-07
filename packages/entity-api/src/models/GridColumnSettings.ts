/** Single grid column setting persisted for a user-defined layout. */
export interface GridColumnSetting {
  /** Optional stable setting identifier. */
  id?: string;

  /** Logical column key used by the UI. */
  key: string;

  /** Optional entity path used to resolve the column value. */
  path?: string;

  /** Indicates whether the column is visible in the selected mode. */
  visible: boolean;

  /** Optional grid span used by responsive layouts. */
  span?: number;

  /** Optional fixed width of the column. */
  width?: number;

  /** Optional ordering index inside the current mode. */
  order?: number;

  /** Optional custom label shown in the UI. */
  label?: string;
}

/** Supported display modes for grid column settings. */
export type GridColumnSettingsMode = "list" | "tile";

/** Column collection for a single grid display mode. */
export interface GridModeColumnSettings {
  /** Columns configured for the mode. */
  columns: GridColumnSetting[];
}

/** Grid column settings grouped by display mode. */
export type GridModeSettingsMap = Partial<Record<GridColumnSettingsMode, GridModeColumnSettings>>;

/** Persisted grid column settings record returned by the backend. */
export interface GridColumnSettingsDto {
  /** Record identifier. */
  id: string;

  /** User identifier that owns the settings. */
  userId: string;

  /** Target grid identifier. */
  gridId: string;

  /** Human-readable settings name. */
  name: string;

  /** Visible column settings for the active mode. */
  columns: GridColumnSetting[];

  /** Optional display mode selected by the user. */
  displayMode?: GridColumnSettingsMode;

  /** Optional persisted editor mode used by the settings dialog. */
  columnSettingsMode?: GridColumnSettingsMode;

  /** Optional per-mode column settings payload. */
  modeSettings?: GridModeSettingsMap;

  /** Indicates whether the record is the default layout for the grid. */
  isDefault: boolean;

  /** Last update timestamp in ISO-8601 format. */
  updatedAt: string;
}

/** Payload used to save grid column settings through the API. */
export interface GridColumnSettingsSaveRequest {
  /** User identifier that owns the settings. */
  userId: string;

  /** Target grid identifier. */
  gridId: string;

  /** Optional human-readable settings name. */
  name?: string;

  /** Columns that should be stored for the active mode. */
  columns: readonly GridColumnSetting[];

  /** Optional display mode selected by the user. */
  displayMode?: GridColumnSettingsMode;

  /** Optional editor mode used by the settings dialog. */
  columnSettingsMode?: GridColumnSettingsMode;

  /** Optional per-mode column settings payload. */
  modeSettings?: GridModeSettingsMap;

  /** Indicates whether the saved record should become the default layout. */
  isDefault?: boolean;
}
