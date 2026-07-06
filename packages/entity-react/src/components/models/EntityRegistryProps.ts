// Контракт свойств UI-компонента 'EntityRegistryProps'.
import type { ReactNode } from "react";
import type {
  EntityApiClient,
  EntityApiEntity,
  EntityGridColumnSettingsClient,
  EntityQueryInput,
  EntityUserProfileDto,
  ESQFilterJsonModel,
  ESQOrderJsonModel
} from "@titanic-entity/entity-api";
import type { EntityDataGridLabels, EntityDataGridRowAction, EntityDataGridSettings } from "../../grids";

export interface EntityRegistryClient {
  select(query: EntityQueryInput): Promise<EntityApiEntity[]>;
}

export interface EntityRegistryProfileClient {
  getUserProfile(key: string): Promise<EntityUserProfileDto>;
  saveUserProfile(key: string, data: string): Promise<EntityUserProfileDto>;
}

export interface EntityRegistryField<TItem> {
  key: string;
  label: string;
  defaultVisible?: boolean;
  className?: string;
  render: (item: TItem) => ReactNode;
  renderDetails?: (item: TItem) => ReactNode;
}

export interface EntityRegistryType<TItem> {
  name: string;
  title: string;
  tableName: string;
  primaryKey?: string;
  query?: EntityQueryInput;
  columns?: string[];
  filters?: ESQFilterJsonModel[];
  orders?: ESQOrderJsonModel[];
  rowCount?: number;
  allColumns?: boolean;
  fields: EntityRegistryField<TItem>[];
  mapRows: (rows: EntityApiEntity[]) => Promise<TItem[]> | TItem[];
  getKey: (item: TItem) => string;
  getTitle?: (item: TItem) => ReactNode;
  getOpenLabel?: (item: TItem) => ReactNode;
  renderPage?: (item: TItem, context: EntityRegistryPageContext<TItem>) => ReactNode;
}

export interface EntityRegistryPageContext<TItem> {
  item: TItem;
  open: () => void;
  refresh: () => void;
}

export interface EntityRegistryGridOptions<TItem> {
  gridId?: string;
  client?: EntityApiClient;
  columnSettingsClient?: EntityGridColumnSettingsClient;
  currentUserId?: string;
  batchRowCount?: number;
  gridWidth?: number;
  editable?: boolean;
  labels?: Partial<EntityDataGridLabels>;
  settings?: Partial<EntityDataGridSettings>;
  rowActions?: readonly EntityDataGridRowAction<TItem>[];
}

export interface EntityRegistryProps<TItem> {
  client: EntityRegistryClient;
  profileClient?: EntityRegistryProfileClient;
  type: EntityRegistryType<TItem>;
  grid?: EntityRegistryGridOptions<TItem>;
  profileKey?: string;
  activeId?: string;
  refreshKey?: unknown;
  className?: string;
  visibleFieldKeys?: string[];
  onVisibleFieldKeysChange?: (keys: string[]) => void | Promise<void>;
  onOpenItem?: (item: TItem) => void;
  onSelectedItemChange?: (item: TItem | null) => void;
  loadingText?: string;
  emptyText?: string;
  configureLabel?: string;
}
