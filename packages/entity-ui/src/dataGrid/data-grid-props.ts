import type {
  EntityApiClient,
  EntityApiEntity,
  EntityApiManagerStructureResponse,
  EntityGridColumnSettingsClient,
  EntityGridColumnSettingsDto,
  EntityQueryInput,
  ESQ,
  ESQFilter,
  ESQOrder
} from "@titanic-entity/entity-api";
import type { Entity } from "@titanic-entity/entity-core";
import type { ReactNode } from "react";
import type { GifCollectionResource } from "@titanic-entity/entity-resources";
import type { ResourceSvgIconInput } from "../resourceSvgIcon/resource-svg-icon";
import type { EntityDataGridPackage } from "./data-grid-package";
import type {
  EntityDataGridColumn,
  EntityDataGridCellEditorContext,
  EntityDataGridColumnSettingsMode,
  EntityDataGridLabels,
  EntityDataGridSettings
} from "./data-grid-settings";

export interface EntityDataGridEntityDescriptor {
  tableName?: string;
  entityTypeName?: string;
  primaryColumn?: string;
}

export type EntityDataGridEntityInput = string | EntityDataGridEntityDescriptor | Entity;

export interface EntityDataGridRowActionContext<TRow = EntityApiEntity> {
  client?: EntityApiClient;
  cancelRowEdit: () => void;
  closeMenu: () => void;
  editing: EntityDataGridRowEditingContext;
  entity?: EntityDataGridEntityDescriptor;
  refresh: () => void;
  row: TRow;
  rowIndex: number;
  rowKey: string;
  saveRow: () => Promise<void>;
}

export interface EntityDataGridRowEditingContext {
  changes: Record<string, unknown>;
  dirty: boolean;
  saving: boolean;
  values: Record<string, unknown>;
}

export interface EntityDataGridRowAction<TRow = EntityApiEntity> {
  key: string;
  label: string;
  icon?: ResourceSvgIconInput;
  danger?: boolean;
  disabled?: boolean | ((context: EntityDataGridRowActionContext<TRow>) => boolean);
  hidden?: boolean | ((context: EntityDataGridRowActionContext<TRow>) => boolean);
  onClick: (context: EntityDataGridRowActionContext<TRow>) => Promise<void> | void;
}

export interface EntityDataGridColumnPickerLabels {
  entities?: Record<string, string>;
  columns?: Record<string, Record<string, string>>;
}

export interface EntityDataGridQueryContext {
  columnPaths: readonly string[];
  columns: readonly string[];
  entity?: EntityDataGridEntityDescriptor;
  entityTypeName?: string;
  filters: readonly ESQFilter[];
  orders?: readonly ESQOrder[];
  pageIndex: number;
  pageSize: number;
  primaryColumn?: string;
  rowCount: number;
  skipRow: number;
  tableName?: string;
}

export type EntityDataGridQueryFactory = (context: EntityDataGridQueryContext) => EntityQueryInput;
export type EntityDataGridQueryInput = EntityQueryInput | EntityDataGridQueryFactory;
export type EntityDataGridQueryColumnsFactory = (context: EntityDataGridQueryContext) => readonly string[];
export type EntityDataGridQueryHandler = (query: ESQ, context: EntityDataGridQueryContext) => EntityQueryInput | void;

export interface EntityDataGridRowRenderContext<TRow = EntityApiEntity> {
  client?: EntityApiClient;
  columns: readonly EntityDataGridColumn<TRow>[];
  displayMode: EntityDataGridColumnSettingsMode;
  entity: EntityDataGridEntityDescriptor;
  gridWidth: number;
  labels: EntityDataGridLabels;
  row: TRow;
  rowIndex: number;
  rowKey: string;
  settings: EntityDataGridSettings;
  visibleColumns: readonly EntityDataGridColumn<TRow>[];
}

export interface EntityDataGridToolbarContext<TRow = EntityApiEntity> {
  client?: EntityApiClient;
  columns: readonly EntityDataGridColumn<TRow>[];
  disableMultiSelect: () => void;
  displayMode: EntityDataGridColumnSettingsMode;
  enableMultiSelect: () => void;
  entity: EntityDataGridEntityDescriptor;
  labels: EntityDataGridLabels;
  loading: boolean;
  openColumnSettings: () => void;
  openTotalsSettings: () => void;
  refresh: () => void;
  rows: readonly TRow[];
  selectedRowKeys: readonly string[];
  selectedRows: readonly TRow[];
  selectedRowKey: string | null;
  selectionModeEnabled: boolean;
  settings: EntityDataGridSettings;
  toggleMultiSelect: () => void;
  visibleColumns: readonly EntityDataGridColumn<TRow>[];
}

export type EntityDataGridToolbarItemInput<TRow = EntityApiEntity> =
  | ReactNode
  | ((context: EntityDataGridToolbarContext<TRow>) => ReactNode);
export type EntityDataGridToolbarFactory<TRow = EntityApiEntity> =
  (context: EntityDataGridToolbarContext<TRow>) => readonly EntityDataGridToolbarItemInput<TRow>[];

export interface EntityDataGridEditableOptions {
  enabled?: boolean;
  saveOnBlur?: boolean;
}

export interface EntityDataGridRowSaveContext<TRow = EntityApiEntity> {
  changes: Record<string, unknown>;
  client?: EntityApiClient;
  entity: EntityDataGridEntityDescriptor;
  refresh: () => void;
  row: TRow;
  rowIndex: number;
  rowKey: string;
  values: Record<string, unknown>;
}

export interface EntityDataGridSelectionChangeContext<TRow = EntityApiEntity> {
  selectedRowKeys: readonly string[];
  selectedRows: readonly TRow[];
  selectionModeEnabled: boolean;
}

export type EntityDataGridSettingsScope = "default" | "personal";

export interface EntityDataGridSettingsLookupOptions {
  gridId?: string;
  gridKey?: string;
  scope?: EntityDataGridSettingsScope;
  userId?: string;
}

export interface EntityDataGridHandle<TRow = EntityApiEntity> {
  clearSelection: () => void;
  disableMultiSelect: () => void;
  enableMultiSelect: () => void;
  getGridColumnSettings: (options?: EntityDataGridSettingsLookupOptions) => Promise<EntityGridColumnSettingsDto | null>;
  getSelectedRowKeys: () => readonly string[];
  getSelectedRows: () => readonly TRow[];
  openColumnSettings: () => void;
  refresh: () => void;
}

export interface EntityDataGridProps<TRow = EntityApiEntity> {
  gridId?: string;
  gridKey?: string;
  title?: string;
  client?: EntityApiClient;
  columnSettingsClient?: EntityGridColumnSettingsClient;
  currentUserId?: string;
  entity?: EntityDataGridEntityInput;
  structure?: EntityApiManagerStructureResponse | null;
  tableName?: string;
  primaryColumn?: string;
  query?: EntityDataGridQueryInput;
  createQuery?: EntityDataGridQueryFactory;
  createQueryColumns?: EntityDataGridQueryColumnsFactory;
  prepareQuery?: EntityDataGridQueryHandler;
  rows?: readonly TRow[];
  mapRows?: (rows: EntityApiEntity[]) => Promise<TRow[]> | TRow[];
  columns?: readonly EntityDataGridColumn<TRow>[];
  packages?: readonly EntityDataGridPackage<TRow>[];
  columnLabels?: Record<string, string>;
  columnPickerLabels?: EntityDataGridColumnPickerLabels;
  defaultVisibleColumnKeys?: readonly string[];
  visibleColumnKeys?: readonly string[];
  filter?: ESQFilter | readonly ESQFilter[];
  filters?: readonly ESQFilter[];
  orders?: readonly ESQOrder[];
  rowCount?: number;
  batchRowCount?: number;
  gridWidth?: number;
  editable?: boolean | EntityDataGridEditableOptions;
  defaultMultiSelectEnabled?: boolean;
  rowMode?: EntityDataGridColumnSettingsMode;
  renderRow?: (context: EntityDataGridRowRenderContext<TRow>) => ReactNode;
  rowActions?: readonly EntityDataGridRowAction<TRow>[];
  createToolbarLeftItems?: EntityDataGridToolbarFactory<TRow>;
  createToolbarCenterItems?: EntityDataGridToolbarFactory<TRow>;
  createToolbarRightItems?: EntityDataGridToolbarFactory<TRow>;
  refreshKey?: unknown;
  loading?: boolean;
  loaderCollection?: GifCollectionResource;
  emptyIcon?: ResourceSvgIconInput;
  emptyText?: string;
  labels?: Partial<EntityDataGridLabels>;
  settings?: Partial<EntityDataGridSettings>;
  className?: string;
  activeRowKey?: string | null;
  getRowKey?: (row: TRow, index: number) => string;
  onVisibleColumnKeysChange?: (keys: string[]) => void;
  onRowsLoaded?: (rows: TRow[]) => void;
  onCellValueChange?: (context: EntityDataGridCellEditorContext<TRow>) => void;
  onRowSave?: (context: EntityDataGridRowSaveContext<TRow>) => Promise<void> | void;
  onSelectionChange?: (context: EntityDataGridSelectionChangeContext<TRow>) => void;
  onMultiSelectChange?: (enabled: boolean) => void;
  onRowClick?: (row: TRow) => void;
  onRowDoubleClick?: (row: TRow) => void;
}
