import type { EntityGridColumnSetting, EntityGridColumnSettingsMode, EntityGridModeSettingsMap } from "@titanic-entity/entity-api";
import { defaultEntityDataGridColumnSettingsLabels } from "../column-settings/resources/entityDataGridColumnSettingsLabels";

export interface EntityDataGridLabels {
  gridSettings: string;
  configureColumns: string;
  configureTotals: string;
  rowActions: string;
  closeColumns: string;
  columnsTitle: string;
  columnsCaption: string;
  listMode: string;
  tileMode: string;
  totalsTitle: string;
  totalsCaption: string;
  totalsEmpty: string;
  visibleColumnsTitle: string;
  availableColumnsTitle: string;
  searchColumnsPlaceholder: string;
  selectedColumnsSummary: string;
  availableColumnsSummary: string;
  addColumn: string;
  removeColumn: string;
  moveColumn: string;
  moveColumnUp: string;
  moveColumnDown: string;
  columnWidth: string;
  columnSpan: string;
  columnLabel: string;
  columnTechnicalName: string;
  columnPropertiesTitle: string;
  columnPropertiesEmpty: string;
  requiredColumn: string;
  renameColumn: string;
  resetColumns: string;
  saveColumns: string;
  cancelColumns: string;
  showColumn: string;
  hideColumn: string;
  noAvailableColumns: string;
  noSelectedColumns: string;
  noColumnsToSaveWarning: string;
  applyColumns: string;
  saveDefaultColumns: string;
  savingColumns: string;
  columnSettingsLoadError: string;
  columnSettingsSaveError: string;
  loading: string;
  loadingMore: string;
  loadingStructure: string;
  empty: string;
  error: string;
  openRecord: string;
  deleteRecord: string;
  copyRecord: string;
}

export type EntityDataGridCulture = "en-US" | "ru-RU";

export interface EntityDataGridColumn<TRow = unknown> {
  key: string;
  path?: string;
  label?: string;
  width?: number;
  defaultVisible?: boolean;
  required?: boolean;
  queryRequired?: boolean;
  className?: string;
  render?: (row: TRow) => unknown;
}

export type {
  EntityGridColumnSetting as EntityDataGridColumnSetting,
  EntityGridColumnSettingsMode as EntityDataGridColumnSettingsMode,
  EntityGridModeSettingsMap as EntityDataGridModeSettingsMap
};

export interface EntityDataGridModeColumnSettings {
  columns: EntityGridColumnSetting[];
}

export interface EntityDataGridUserSettings {
  columns: EntityGridColumnSetting[];
  displayMode?: EntityGridColumnSettingsMode;
  columnSettingsMode?: EntityGridColumnSettingsMode;
  modeSettings?: EntityGridModeSettingsMap;
}

export interface EntityDataGridSettings {
  defaultRowCount: number;
  batchRowCount: number;
  gridWidth: number;
  editable: boolean;
  persistColumnSettings: boolean;
  showRowContextMenu: boolean;
  storagePrefix: string;
  culture?: string;
  labels?: Partial<EntityDataGridLabels>;
}

export const defaultEntityDataGridSettings: EntityDataGridSettings = {
  defaultRowCount: 15,
  batchRowCount: 15,
  gridWidth: 24,
  editable: false,
  persistColumnSettings: true,
  showRowContextMenu: true,
  storagePrefix: "titanic.entityDataGrid",
  labels: {
    ...defaultEntityDataGridColumnSettingsLabels
  }
};
