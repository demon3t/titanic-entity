import type {
  EntityGridColumnSetting,
  EntityGridColumnSettingsMode,
  EntityGridSortDirection,
  EntityGridSortSetting
} from "@titanic-entity/entity-api";
import type { EntityColumnKindInput } from "@titanic-entity/entity-core";
import type { ReactNode } from "react";

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
  saveRecord: string;
  cancelRecord: string;
  deleteRecord: string;
  copyRecord: string;
  sortColumns: string;
  sortAscending: string;
  sortDescending: string;
  booleanTrue: string;
  booleanFalse: string;
  selectRow: string;
  selectAllRows: string;
  cancelSelection: string;
}

export type EntityDataGridCulture = "en-US" | "ru-RU";

export interface EntityDataGridColumnField {
  key?: string;
  path?: string;
  sortPath?: string;
  alias?: string;
  caption?: string;
  [key: string]: unknown;
}

export interface EntityDataGridColumn<TRow = unknown> {
  key: string;
  path?: string;
  sortPath?: string;
  alias?: string;
  field?: EntityDataGridColumnField;
  label?: string;
  width?: number;
  span?: number;
  defaultVisible?: boolean;
  required?: boolean;
  queryRequired?: boolean;
  editable?: boolean;
  kind?: EntityColumnKindInput;
  className?: string;
  render?: (row: TRow) => unknown;
  editor?: (context: EntityDataGridCellEditorContext<TRow>) => ReactNode;
}

export interface EntityDataGridCellEditorContext<TRow = unknown> {
  column: EntityDataGridColumn<TRow>;
  row: TRow;
  rowIndex: number;
  rowKey: string;
  value: unknown;
  values: Record<string, unknown>;
  setValue: (value: unknown) => void;
}

export interface EntityDataGridColumnSetting extends EntityGridColumnSetting {
  key?: string;
  path?: string;
  sortPath?: string;
  caption?: string;
  field?: EntityDataGridColumnField;
  label?: string;
}

export type {
  EntityGridColumnSettingsMode as EntityDataGridColumnSettingsMode,
  EntityGridSortDirection as EntityDataGridSortDirection,
  EntityGridSortSetting as EntityDataGridSortSetting
};

export interface EntityDataGridModeColumnSettings {
  columns: EntityDataGridColumnSetting[];
}

export type EntityDataGridModeSettingsMap = Partial<
  Record<EntityGridColumnSettingsMode, EntityDataGridModeColumnSettings>
>;

export interface EntityDataGridUserSettings {
  columns: EntityDataGridColumnSetting[];
  displayMode?: EntityGridColumnSettingsMode;
  columnSettingsMode?: EntityGridColumnSettingsMode;
  modeSettings?: EntityDataGridModeSettingsMap;
  sort?: EntityGridSortSetting;
}

export interface EntityDataGridSettings {
  defaultRowCount: number;
  batchRowCount: number;
  gridWidth: number;
  editable: boolean;
  persistColumnSettings: boolean;
  showRowContextMenu: boolean;
  storagePrefix: string;
  locale?: string;
  /** @deprecated Use locale instead. */
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
  labels: {}
};
