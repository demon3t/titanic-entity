// Контракт свойств UI-компонента 'EntityOrmListProps'.
import type { ReactNode } from "react";
import type { EntityApiEntity, EntityQueryInput, ESQFilterJsonModel, ESQOrderJsonModel } from "@titanic/entity-api";

export interface EntityOrmListClient {
  select(query: EntityQueryInput): Promise<EntityApiEntity[]>;
}

export interface EntityOrmListField<TItem> {
  key: string;
  label: string;
  defaultVisible?: boolean;
  className?: string;
  render: (item: TItem) => ReactNode;
}

export interface EntityOrmListProps<TItem> {
  client: EntityOrmListClient;
  title: string;
  tableName?: string;
  query?: EntityQueryInput;
  columns?: string[];
  filters?: ESQFilterJsonModel[];
  orders?: ESQOrderJsonModel[];
  rowCount?: number;
  allColumns?: boolean;
  activeId?: string;
  refreshKey?: unknown;
  className?: string;
  itemClassName?: string;
  activeItemClassName?: string;
  loadingText?: string;
  emptyText?: string;
  mapRows: (rows: EntityApiEntity[]) => Promise<TItem[]> | TItem[];
  getKey: (item: TItem) => string;
  renderRow: (item: TItem, active: boolean) => ReactNode;
  fields?: EntityOrmListField<TItem>[];
  visibleFieldKeys?: string[];
  onVisibleFieldKeysChange?: (keys: string[]) => void | Promise<void>;
  configureLabel?: string;
  onRowClick?: (item: TItem) => void;
  onRowDoubleClick?: (item: TItem) => void;
}
