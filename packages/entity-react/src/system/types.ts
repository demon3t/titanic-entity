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

export interface EntityRecordPageConfig {
  tableName: string;
  primaryColumn: string;
  displayColumn?: string;
  orderColumn?: string;
  title?: string;
  columns?: readonly unknown[];
}
