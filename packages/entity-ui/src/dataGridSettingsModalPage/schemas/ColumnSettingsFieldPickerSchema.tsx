import type { ChangeEvent } from "react";
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import type { EntityDataGridLabels } from "../../dataGrid/data-grid-settings";
import { Button } from "../../button";
import { EntityContainer } from "../../container";
import { EntityLabel } from "../../label";
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

export interface ColumnSettingsFieldPickerPathItem {
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

function ColumnSettingsFieldPickerSchemaNative({
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
    <EntityContainer
      ariaLabel={labels.availableColumnsTitle}
      className={availableClassName}
    >
      <EntityContainer className="titanic-data-grid-column-modal__panel-head">
        <EntityContainer>
          <EntityLabel as="h3" value={labels.availableColumnsTitle} />
        </EntityContainer>
        <label className="titanic-data-grid-column-modal__field-search">
          <input
            aria-label={labels.searchColumnsPlaceholder}
            placeholder={labels.searchColumnsPlaceholder}
            type="search"
            value={searchValue}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onSearchChange(event.target.value)}
          />
        </label>
      </EntityContainer>

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
    </EntityContainer>
  );
}

Titanic.define<ColumnSettingsFieldPickerSchemaProps>(
  columnSettingsDefinedComponentNames.ColumnSettingsFieldPicker,
  ColumnSettingsFieldPickerSchemaNative
);

export const ColumnSettingsFieldPickerSchema = Titanic.getReactModule<
  DefinedEntityReactComponent<ColumnSettingsFieldPickerSchemaProps>
>(columnSettingsDefinedComponentNames.ColumnSettingsFieldPicker)!;

export interface ColumnSettingsFieldPickerPathProps {
  pathItems: readonly ColumnSettingsFieldPickerPathItem[];
  onPathItemClick: (index: number) => void;
}

function ColumnSettingsFieldPickerPathNative({
  pathItems,
  onPathItemClick
}: ColumnSettingsFieldPickerPathProps) {
  const pathLabel = pathItems.map((item) => item.label).join(" - ");
  const currentPathIndex = Math.max(0, pathItems.length - 1);

  if (pathItems.length === 0) {
    return null;
  }

  return (
    <EntityContainer
      ariaLabel={pathLabel}
      className="titanic-data-grid-column-modal__field-picker-path"
      role="navigation"
      title={pathLabel}
    >
      <EntityContainer className="titanic-data-grid-column-modal__field-picker-trail">
        {pathItems.map((item, index) => {
          const isActive = index === currentPathIndex;
          const crumb = (
            <Button unstyled
              aria-current={isActive ? "page" : undefined}
              className={isActive
                ? "titanic-data-grid-column-modal__field-picker-crumb titanic-data-grid-column-modal__field-picker-crumb_active"
                : "titanic-data-grid-column-modal__field-picker-crumb"}
              type="button"
              onClick={() => onPathItemClick(index)}
            >
              {item.label}
            </Button>
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
      </EntityContainer>
    </EntityContainer>
  );
}

Titanic.define<ColumnSettingsFieldPickerPathProps>(
  columnSettingsDefinedComponentNames.ColumnSettingsFieldPickerPath,
  ColumnSettingsFieldPickerPathNative
);

export const ColumnSettingsFieldPickerPath = Titanic.getReactModule<
  DefinedEntityReactComponent<ColumnSettingsFieldPickerPathProps>
>(columnSettingsDefinedComponentNames.ColumnSettingsFieldPickerPath)!;

export interface ColumnSettingsFieldPickerListProps {
  emptyText: string;
  isFieldVisible: (item: ColumnSettingsFieldPickerItem) => boolean;
  items: readonly ColumnSettingsFieldPickerItem[];
  onAddField: (item: ColumnSettingsFieldPickerItem) => void;
  onOpenReference: (item: ColumnSettingsFieldPickerItem) => void;
}

function ColumnSettingsFieldPickerListNative({
  emptyText,
  isFieldVisible,
  items,
  onAddField,
  onOpenReference
}: ColumnSettingsFieldPickerListProps) {
  return (
    <EntityContainer className="titanic-data-grid-column-modal__field-picker-list">
      {items.length > 0 ? items.map((item) => {
        const canOpenReference = item.isReference && Boolean(item.referenceTableName);
        const referenceLabel = formatReferenceTrailLabel(item);
        const isVisible = isFieldVisible(item);

        return (
          <EntityContainer
            className={canOpenReference
              ? "titanic-data-grid-column-modal__field-picker-row titanic-data-grid-column-modal__field-picker-row_reference"
              : "titanic-data-grid-column-modal__field-picker-row"}
            key={item.path}
          >
            <Button unstyled
              className={canOpenReference
                ? "titanic-data-grid-column-modal__field-picker-main titanic-data-grid-column-modal__field-picker-main_reference"
                : "titanic-data-grid-column-modal__field-picker-main"}
              disabled={isVisible}
              type="button"
              onClick={() => onAddField(item)}
            >
              <EntityLabel as="strong" value={item.label} />
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
          </EntityContainer>
        );
      }) : (
        <EntityLabel as="p" className="titanic-data-grid-column-modal__empty" value={emptyText} />
      )}
    </EntityContainer>
  );
}

Titanic.define<ColumnSettingsFieldPickerListProps>(
  columnSettingsDefinedComponentNames.ColumnSettingsFieldPickerList,
  ColumnSettingsFieldPickerListNative
);

export const ColumnSettingsFieldPickerList = Titanic.getReactModule<
  DefinedEntityReactComponent<ColumnSettingsFieldPickerListProps>
>(columnSettingsDefinedComponentNames.ColumnSettingsFieldPickerList)!;

export interface ColumnSettingsAvailableColumnsListProps {
  columns: readonly ColumnSettingsAvailableColumnItem[];
  emptyText: string;
  onAddColumn: (key: string) => void;
}

function ColumnSettingsAvailableColumnsListNative({
  columns,
  emptyText,
  onAddColumn
}: ColumnSettingsAvailableColumnsListProps) {
  return (
    <EntityContainer className="titanic-data-grid-column-modal__available-list">
      {columns.length > 0 ? columns.map((column) => (
        <Button unstyled
          className="titanic-data-grid-column-modal__available-row"
          disabled={column.isVisible}
          key={column.key}
          type="button"
          onClick={() => onAddColumn(column.key)}
        >
          <span>
            <EntityLabel as="strong" value={column.label} />
            {column.path ? <small>{column.path}</small> : null}
          </span>
        </Button>
      )) : (
        <EntityLabel as="p" className="titanic-data-grid-column-modal__empty" value={emptyText} />
      )}
    </EntityContainer>
  );
}

Titanic.define<ColumnSettingsAvailableColumnsListProps>(
  columnSettingsDefinedComponentNames.ColumnSettingsAvailableColumnsList,
  ColumnSettingsAvailableColumnsListNative
);

export const ColumnSettingsAvailableColumnsList = Titanic.getReactModule<
  DefinedEntityReactComponent<ColumnSettingsAvailableColumnsListProps>
>(columnSettingsDefinedComponentNames.ColumnSettingsAvailableColumnsList)!;
