import type { ChangeEvent } from "react";
import { Titanic } from "@titanic-entity/entity-react";
import type { EntityDataGridLabels } from "../../dataGrid/data-grid-settings";
import { Button } from "../../button";
import { Container } from "../../container";
import { Label } from "../../label";
import { NavigationTrail, type NavigationTrailItem } from "../../navigationTrail";
import {
  formatReferenceTrailLabel,
  type ColumnSettingsAvailableColumnItem,
  type ColumnSettingsFieldPickerItem,
  type ColumnSettingsFieldPickerPathOption
} from "../model/columnSettingsFieldPickerModel";
import { columnSettingsDefinedComponentNames } from "./component-names";
export type {
  ColumnSettingsAvailableColumnItem,
  ColumnSettingsFieldPickerItem,
  ColumnSettingsFieldPickerPathOption,
  ColumnSettingsFieldPickerTrailItem
} from "../model/columnSettingsFieldPickerModel";

export interface ColumnSettingsFieldPickerPathItem extends NavigationTrailItem {
  label: string;
  path: string;
}

export interface ColumnSettingsFieldPickerSchemaProps {
  availableColumns: readonly ColumnSettingsAvailableColumnItem[];
  emptyText: string;
  isFieldVisible: (item: ColumnSettingsFieldPickerItem) => boolean;
  items: readonly ColumnSettingsFieldPickerItem[] | null;
  labels: EntityDataGridLabels;
  pathItems: readonly ColumnSettingsFieldPickerPathItem[];
  pathOptions: readonly ColumnSettingsFieldPickerPathOption[];
  searchValue: string;
  selectedPath: string;
  onAddAvailableColumn: (key: string) => void;
  onAddField: (item: ColumnSettingsFieldPickerItem) => void;
  onOpenReference: (item: ColumnSettingsFieldPickerItem) => void;
  onPathChange: (path: string) => void;
  onPathItemClick: (index: number) => void;
  onSearchChange: (value: string) => void;
}

export const ColumnSettingsFieldPickerSchema = Titanic.define<ColumnSettingsFieldPickerSchemaProps>(columnSettingsDefinedComponentNames.ColumnSettingsFieldPicker, function ColumnSettingsFieldPickerSchema({
  availableColumns,
  emptyText,
  isFieldVisible,
  items,
  labels,
  pathItems,
  pathOptions,
  searchValue,
  onAddAvailableColumn,
  onAddField,
  onOpenReference,
  onPathItemClick,
  onSearchChange
}: ColumnSettingsFieldPickerSchemaProps) {
  const hasPathPicker = pathOptions.length > 0;
  const availableClassName = hasPathPicker
    ? "titanic-data-grid-column-modal__available titanic-data-grid-column-modal__available_with-path"
    : "titanic-data-grid-column-modal__available";

  return (
    <Container
      ariaLabel={labels.availableColumnsTitle}
      className={availableClassName}
    >
      <Container className="titanic-data-grid-column-modal__panel-head">
        <Container>
          <Label as="h3" value={labels.availableColumnsTitle} />
        </Container>
        <label className="titanic-data-grid-column-modal__field-search">
          <input
            aria-label={labels.searchColumnsPlaceholder}
            placeholder={labels.searchColumnsPlaceholder}
            type="search"
            value={searchValue}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onSearchChange(event.target.value)}
          />
        </label>
      </Container>

      {hasPathPicker ? (
        <ColumnSettingsFieldPickerPath
          pathItems={pathItems}
          onPathItemClick={onPathItemClick}
        />
      ) : null}

      {items ? (
        <>
          <ColumnSettingsFieldPickerList
            emptyText={emptyText}
            isFieldVisible={isFieldVisible}
            items={items}
            onAddField={onAddField}
            onOpenReference={onOpenReference}
          />
        </>
      ) : (
        <ColumnSettingsAvailableColumnsList
          columns={availableColumns}
          emptyText={emptyText}
          onAddColumn={onAddAvailableColumn}
        />
      )}
    </Container>
  );
});

export interface ColumnSettingsFieldPickerPathProps {
  pathItems: readonly ColumnSettingsFieldPickerPathItem[];
  onPathItemClick: (index: number) => void;
}

export const ColumnSettingsFieldPickerPath = Titanic.define<ColumnSettingsFieldPickerPathProps>(columnSettingsDefinedComponentNames.ColumnSettingsFieldPickerPath, function ColumnSettingsFieldPickerPath({
  pathItems,
  onPathItemClick
}: ColumnSettingsFieldPickerPathProps) {
  return (
    <NavigationTrail
      classNames={{
        root: "titanic-data-grid-column-modal__field-picker-path",
        list: "titanic-data-grid-column-modal__field-picker-trail",
        item: "titanic-data-grid-column-modal__field-picker-crumb",
        activeItem: "titanic-data-grid-column-modal__field-picker-crumb_active",
        step: "titanic-data-grid-column-modal__field-picker-step",
        separator: "titanic-data-grid-column-modal__field-picker-separator"
      }}
      items={pathItems}
      onItemClick={(_, index) => onPathItemClick(index)}
    />
  );
});

export interface ColumnSettingsFieldPickerListProps {
  emptyText: string;
  isFieldVisible: (item: ColumnSettingsFieldPickerItem) => boolean;
  items: readonly ColumnSettingsFieldPickerItem[];
  onAddField: (item: ColumnSettingsFieldPickerItem) => void;
  onOpenReference: (item: ColumnSettingsFieldPickerItem) => void;
}

export const ColumnSettingsFieldPickerList = Titanic.define<ColumnSettingsFieldPickerListProps>(columnSettingsDefinedComponentNames.ColumnSettingsFieldPickerList, function ColumnSettingsFieldPickerList({
  emptyText,
  isFieldVisible,
  items,
  onAddField,
  onOpenReference
}: ColumnSettingsFieldPickerListProps) {
  return (
    <Container className="titanic-data-grid-column-modal__field-picker-list">
      {items.length > 0 ? items.map((item) => {
        const canOpenReference = item.isReference && Boolean(item.referenceTableName);
        const referenceLabel = formatReferenceTrailLabel(item);
        const isVisible = isFieldVisible(item);
        const mainButtonDisabled = isVisible;

        return (
          <Container
            className={canOpenReference
              ? "titanic-data-grid-column-modal__field-picker-row titanic-data-grid-column-modal__field-picker-row_reference"
              : "titanic-data-grid-column-modal__field-picker-row"}
            key={item.path}
          >
            <Button unstyled
              className={canOpenReference
                ? "titanic-data-grid-column-modal__field-picker-main titanic-data-grid-column-modal__field-picker-main_reference"
                : "titanic-data-grid-column-modal__field-picker-main"}
              disabled={mainButtonDisabled}
              title={canOpenReference ? referenceLabel : undefined}
              type="button"
              onClick={() => onAddField(item)}
            >
              <Label as="strong" value={item.label} />
              {canOpenReference ? <span>{item.referenceEntityLabel}</span> : null}
            </Button>
            {canOpenReference ? (
              <Button unstyled
                aria-label={referenceLabel}
                className="titanic-data-grid-column-modal__field-picker-add"
                title={referenceLabel}
                type="button"
                onClick={() => onOpenReference(item)}
              >
                +
              </Button>
            ) : null}
          </Container>
        );
      }) : (
        <Label as="p" className="titanic-data-grid-column-modal__empty" value={emptyText} />
      )}
    </Container>
  );
});

export interface ColumnSettingsAvailableColumnsListProps {
  columns: readonly ColumnSettingsAvailableColumnItem[];
  emptyText: string;
  onAddColumn: (key: string) => void;
}

export const ColumnSettingsAvailableColumnsList = Titanic.define<ColumnSettingsAvailableColumnsListProps>(columnSettingsDefinedComponentNames.ColumnSettingsAvailableColumnsList, function ColumnSettingsAvailableColumnsList({
  columns,
  emptyText,
  onAddColumn
}: ColumnSettingsAvailableColumnsListProps) {
  return (
    <Container className="titanic-data-grid-column-modal__available-list">
      {columns.length > 0 ? columns.map((column) => (
        <Button unstyled
          className="titanic-data-grid-column-modal__available-row"
          disabled={column.isVisible}
          key={column.key}
          type="button"
          onClick={() => onAddColumn(column.key)}
        >
          <span>
            <Label as="strong" value={column.label} />
            {column.path ? <small>{column.path}</small> : null}
          </span>
        </Button>
      )) : (
        <Label as="p" className="titanic-data-grid-column-modal__empty" value={emptyText} />
      )}
    </Container>
  );
});
