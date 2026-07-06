import { useMemo } from "react";
import { entityQuery, type EntityApiClient } from "@titanic-entity/entity-api";
import type { EntityDataGridColumn } from "../grids";
import { EntityDataGrid } from "./grid/EntityDataGrid";
import type { EntityOrmListProps } from "./models/EntityOrmListProps";

export type { EntityOrmListProps } from "./models/EntityOrmListProps";

export function EntityOrmList<TItem>({
  client,
  title,
  tableName,
  query,
  columns,
  filters,
  orders,
  rowCount,
  allColumns,
  activeId,
  refreshKey,
  className = "",
  loadingText = "Р—Р°РіСЂСѓР·РєР° РёР· Entity ORM API...",
  emptyText = "РќРµС‚ Р·Р°РїРёСЃРµР№",
  mapRows,
  getKey,
  renderRow,
  fields,
  visibleFieldKeys,
  onVisibleFieldKeysChange,
  configureLabel = "РќР°СЃС‚СЂРѕРёС‚СЊ РїРѕР»СЏ",
  onRowClick,
  onRowDoubleClick
}: EntityOrmListProps<TItem>) {
  const gridColumns = useMemo<readonly EntityDataGridColumn<TItem>[]>(() => {
    if (fields?.length) {
      return fields.map((field) => ({
        key: field.key,
        label: field.label,
        defaultVisible: field.defaultVisible,
        className: field.className,
        render: field.render
      }));
    }

    return [{
      key: "__entityOrmListItem",
      label: title,
      defaultVisible: true,
      render: (item: TItem) => renderRow(item, getKey(item) === activeId)
    }];
  }, [activeId, fields, getKey, renderRow, title]);
  const sourceQuery = useMemo(() => {
    if (query) {
      return query;
    }

    if (!tableName) {
      throw new Error("EntityOrmList requires either query or tableName.");
    }

    return entityQuery(tableName)
      .allColumns(allColumns ?? !columns?.length)
      .columns(...(columns ?? []))
      .filters(filters ?? [])
      .orders(...(orders ?? []));
  }, [allColumns, columns, filters, orders, query, tableName]);

  return (
    <EntityDataGrid<TItem>
      activeRowKey={activeId ?? null}
      className={className}
      client={client as EntityApiClient}
      columns={gridColumns}
      emptyText={emptyText}
      getRowKey={(item) => getKey(item)}
      gridId={`entity-orm-list.${tableName ?? title}`}
      labels={{
        configureColumns: configureLabel,
        loading: loadingText,
        loadingStructure: loadingText
      }}
      mapRows={mapRows}
      query={sourceQuery}
      refreshKey={refreshKey}
      rowCount={rowCount}
      tableName={tableName}
      title={title}
      visibleColumnKeys={visibleFieldKeys}
      onRowClick={onRowClick}
      onRowDoubleClick={onRowDoubleClick}
      onVisibleColumnKeysChange={(keys) => {
        void onVisibleFieldKeysChange?.(keys);
      }}
    />
  );
}
