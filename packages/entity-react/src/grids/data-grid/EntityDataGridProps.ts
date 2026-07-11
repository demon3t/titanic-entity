import type {
  EntityApiClient,
  EntityApiEntity,
  EntityGridColumnSettingsClient,
  EntityQueryInput,
  ESQFilterJsonModel,
  ESQOrderJsonModel
} from "@titanic-entity/entity-api";
import type { GifCollectionResource } from "@titanic-entity/entity-resources";
import type { ResourceSvgIconInput } from "../../components/icons/ResourceSvgIcon";
import type { EntityDataGridColumn, EntityDataGridLabels, EntityDataGridSettings } from "./EntityDataGridSettings";

export interface EntityDataGridEntityDescriptor {
  tableName?: string;
  entityTypeName?: string;
  primaryColumn?: string;
}

export interface EntityDataGridRowActionContext<TRow = EntityApiEntity> {
  client?: EntityApiClient;
  closeMenu: () => void;
  entity?: EntityDataGridEntityDescriptor;
  refresh: () => void;
  row: TRow;
  rowIndex: number;
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
  filters: readonly ESQFilterJsonModel[];
  orders?: readonly ESQOrderJsonModel[];
  pageIndex: number;
  pageSize: number;
  primaryColumn?: string;
  rowCount: number;
  skipRow: number;
  tableName?: string;
}

export type EntityDataGridQueryFactory = (context: EntityDataGridQueryContext) => EntityQueryInput;
export type EntityDataGridQueryInput = EntityQueryInput | EntityDataGridQueryFactory;

export interface EntityDataGridProps<TRow = EntityApiEntity> {
  gridId: string;
  title?: string;
  client?: EntityApiClient;
  columnSettingsClient?: EntityGridColumnSettingsClient;
  currentUserId?: string;
  entity?: string | EntityDataGridEntityDescriptor;
  tableName?: string;
  primaryColumn?: string;
  query?: EntityDataGridQueryInput;
  createQuery?: EntityDataGridQueryFactory;
  rows?: readonly TRow[];
  mapRows?: (rows: EntityApiEntity[]) => Promise<TRow[]> | TRow[];
  columns?: readonly EntityDataGridColumn<TRow>[];
  columnLabels?: Record<string, string>;
  columnPickerLabels?: EntityDataGridColumnPickerLabels;
  defaultVisibleColumnKeys?: readonly string[];
  visibleColumnKeys?: readonly string[];
  filter?: ESQFilterJsonModel | readonly ESQFilterJsonModel[];
  filters?: readonly ESQFilterJsonModel[];
  orders?: readonly ESQOrderJsonModel[];
  rowCount?: number;
  batchRowCount?: number;
  gridWidth?: number;
  editable?: boolean;
  rowActions?: readonly EntityDataGridRowAction<TRow>[];
  refreshKey?: unknown;
  loading?: boolean;
  loaderCollection?: GifCollectionResource;
  emptyText?: string;
  labels?: Partial<EntityDataGridLabels>;
  settings?: Partial<EntityDataGridSettings>;
  className?: string;
  activeRowKey?: string | null;
  getRowKey?: (row: TRow, index: number) => string;
  onVisibleColumnKeysChange?: (keys: string[]) => void;
  onRowsLoaded?: (rows: TRow[]) => void;
  onRowClick?: (row: TRow) => void;
  onRowDoubleClick?: (row: TRow) => void;
}
