import type { EntityDataGridColumn } from "../grids";
import { EntityDataGrid } from "./grid/EntityDataGrid";
import type { EntityTableProps } from "./models/EntityTableProps";

export type { EntityTableProps } from "./models/EntityTableProps";

export function EntityTable({ schema, rows, loading = false, emptyText = "РќРµС‚ РґР°РЅРЅС‹С…", onRowClick }: EntityTableProps) {
  const columns: readonly EntityDataGridColumn[] = schema.columns
    .filter((column) => !column.hidden)
    .map((column) => ({
      key: column.alias || column.path,
      path: column.path,
      label: column.label ?? column.path,
      defaultVisible: true
    }));

  return (
    <EntityDataGrid
      columns={columns}
      emptyText={emptyText}
      gridId={`entity-table.${schema.tableName}`}
      loading={loading}
      primaryColumn={schema.primaryColumn}
      rows={rows}
      tableName={schema.tableName}
      title={schema.title}
      onRowClick={onRowClick}
    />
  );
}
