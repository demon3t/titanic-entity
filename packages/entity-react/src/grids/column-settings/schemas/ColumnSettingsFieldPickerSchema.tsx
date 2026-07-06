import type { ChangeEvent } from "react";
import type { EntityDataGridLabels } from "../../data-grid/EntityDataGridSettings";
import {
  formatReferenceTrailLabel,
  type ColumnSettingsAvailableColumnItem,
  type ColumnSettingsFieldPickerItem
} from "../model/columnSettingsFieldPickerModel";
export type {
  ColumnSettingsAvailableColumnItem,
  ColumnSettingsFieldPickerItem,
  ColumnSettingsFieldPickerTrailItem
} from "../model/columnSettingsFieldPickerModel";

export interface ColumnSettingsFieldPickerSchemaProps {
  availableColumns: readonly ColumnSettingsAvailableColumnItem[];
  emptyText: string;
  isFieldVisible: (item: ColumnSettingsFieldPickerItem) => boolean;
  items: readonly ColumnSettingsFieldPickerItem[] | null;
  labels: EntityDataGridLabels;
  pathItems: readonly { label: string; path: string }[];
  searchValue: string;
  onAddAvailableColumn: (key: string) => void;
  onAddField: (item: ColumnSettingsFieldPickerItem) => void;
  onOpenReference: (item: ColumnSettingsFieldPickerItem) => void;
  onPathItemClick: (index: number) => void;
  onSearchChange: (value: string) => void;
}

export function ColumnSettingsFieldPickerSchema({
  availableColumns,
  emptyText,
  isFieldVisible,
  items,
  labels,
  pathItems,
  searchValue,
  onAddAvailableColumn,
  onAddField,
  onOpenReference,
  onPathItemClick,
  onSearchChange
}: ColumnSettingsFieldPickerSchemaProps) {
  return (
    <aside className="titanic-data-grid-column-modal__available" aria-label={labels.availableColumnsTitle}>
      <div className="titanic-data-grid-column-modal__panel-head">
        <div>
          <h3>{labels.availableColumnsTitle}</h3>
        </div>
        <label className="titanic-data-grid-column-modal__field-search">
          <input
            aria-label={labels.searchColumnsPlaceholder}
            placeholder={labels.searchColumnsPlaceholder}
            type="search"
            value={searchValue}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onSearchChange(event.target.value)}
          />
        </label>
      </div>

      {items ? (
        <FieldPickerList
          emptyText={emptyText}
          isFieldVisible={isFieldVisible}
          items={items}
          pathItems={pathItems}
          onAddField={onAddField}
          onOpenReference={onOpenReference}
          onPathItemClick={onPathItemClick}
        />
      ) : (
        <AvailableColumnsList
          columns={availableColumns}
          emptyText={emptyText}
          onAddColumn={onAddAvailableColumn}
        />
      )}
    </aside>
  );
}

function FieldPickerList({
  emptyText,
  isFieldVisible,
  items,
  pathItems,
  onAddField,
  onOpenReference,
  onPathItemClick
}: {
  emptyText: string;
  isFieldVisible: (item: ColumnSettingsFieldPickerItem) => boolean;
  items: readonly ColumnSettingsFieldPickerItem[];
  pathItems: readonly { label: string; path: string }[];
  onAddField: (item: ColumnSettingsFieldPickerItem) => void;
  onOpenReference: (item: ColumnSettingsFieldPickerItem) => void;
  onPathItemClick: (index: number) => void;
}) {
  const pathLabel = pathItems.map((item) => item.label).join(" - ");
  const currentPathIndex = Math.max(0, pathItems.length - 1);

  return (
    <div className="titanic-data-grid-column-modal__field-picker">
      <nav
        className="titanic-data-grid-column-modal__field-picker-path"
        aria-label={pathLabel}
        title={pathLabel}
      >
        {pathItems.map((item, index) => {
          const isActive = index === currentPathIndex;
          const crumb = (
            <button
              aria-current={isActive ? "page" : undefined}
              className={isActive
                ? "titanic-data-grid-column-modal__field-picker-crumb titanic-data-grid-column-modal__field-picker-crumb_active"
                : "titanic-data-grid-column-modal__field-picker-crumb"}
              type="button"
              onClick={() => onPathItemClick(index)}
            >
              {item.label}
            </button>
          );

          return index === 0 ? (
            <span key={item.path || "__root"}>{crumb}</span>
          ) : (
            <span className="titanic-data-grid-column-modal__field-picker-step" key={item.path}>
              <span className="titanic-data-grid-column-modal__field-picker-separator">-</span>
              {crumb}
            </span>
          );
        })}
      </nav>

      <div className="titanic-data-grid-column-modal__field-picker-list">
        {items.length > 0 ? items.map((item) => {
          const canOpenReference = item.isReference && Boolean(item.referenceTableName);
          const referenceLabel = formatReferenceTrailLabel(item);
          const isVisible = isFieldVisible(item);

          return (
            <div
              className={canOpenReference
                ? "titanic-data-grid-column-modal__field-picker-row titanic-data-grid-column-modal__field-picker-row_reference"
                : "titanic-data-grid-column-modal__field-picker-row"}
              key={item.path}
            >
              <button
                className={canOpenReference
                  ? "titanic-data-grid-column-modal__field-picker-main titanic-data-grid-column-modal__field-picker-main_reference"
                  : "titanic-data-grid-column-modal__field-picker-main"}
                disabled={isVisible}
                type="button"
                onClick={() => onAddField(item)}
              >
                <strong>{item.label}</strong>
                {canOpenReference ? <span>{item.referenceEntityLabel}</span> : null}
              </button>
              {canOpenReference ? (
                <button
                  aria-label={referenceLabel}
                  className="titanic-data-grid-column-modal__field-picker-add"
                  title={referenceLabel}
                  type="button"
                  onClick={() => onOpenReference(item)}
                >
                  +
                </button>
              ) : null}
            </div>
          );
        }) : (
          <p className="titanic-data-grid-column-modal__empty">{emptyText}</p>
        )}
      </div>
    </div>
  );
}

function AvailableColumnsList({
  columns,
  emptyText,
  onAddColumn
}: {
  columns: readonly ColumnSettingsAvailableColumnItem[];
  emptyText: string;
  onAddColumn: (key: string) => void;
}) {
  return (
    <div className="titanic-data-grid-column-modal__available-list">
      {columns.length > 0 ? columns.map((column) => (
        <button
          className="titanic-data-grid-column-modal__available-row"
          disabled={column.isVisible}
          key={column.key}
          type="button"
          onClick={() => onAddColumn(column.key)}
        >
          <span>
            <strong>{column.label}</strong>
          </span>
        </button>
      )) : (
        <p className="titanic-data-grid-column-modal__empty">{emptyText}</p>
      )}
    </div>
  );
}
