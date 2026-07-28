import type {
  CSSProperties,
  DragEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode
} from "react";
import { Titanic } from "@titanic-entity/entity-react";
import type { EntityDataGridLabels } from "../../dataGrid/data-grid-settings";
import { ResourceSvgIcon } from "../../resourceSvgIcon/resource-svg-icon";
import { titanicCommonIcons, titanicDataGridRowActionIcons } from "@titanic-entity/entity-icons";
import { Button } from "../../button";
import { EntityDragDropItem } from "../../dragDrop/drag-drop-item";
import { columnSettingsDefinedComponentNames } from "./component-names";

export interface ColumnSettingsVisibleFieldSchemaProps {
  canRemove: boolean;
  children: ReactNode;
  className: string;
  dragValue?: string;
  draggable: boolean;
  isRequired: boolean;
  labels: EntityDataGridLabels;
  span: number;
  style: CSSProperties;
  onDragEnd: () => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDragStart: (event: DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
  onRemove: () => void;
  onResizeStart: (event: ReactPointerEvent<HTMLElement>) => void;
}

export const ColumnSettingsVisibleFieldSchema = Titanic.define<ColumnSettingsVisibleFieldSchemaProps>(columnSettingsDefinedComponentNames.ColumnSettingsVisibleField, function ColumnSettingsVisibleFieldSchema({
  canRemove,
  children,
  className,
  dragValue,
  draggable,
  isRequired,
  labels,
  span,
  style,
  onDragEnd,
  onDragOver,
  onDragStart,
  onDrop,
  onRemove,
  onResizeStart
}: ColumnSettingsVisibleFieldSchemaProps) {
  return (
    <EntityDragDropItem
      as="article"
      className={className}
      dragValue={dragValue}
      draggable={draggable}
      style={style}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragStart={onDragStart}
      onDrop={onDrop}
    >
      <div className="titanic-data-grid-column-modal__field-head">
        <div className="titanic-data-grid-column-modal__field-title">
          <ResourceSvgIcon className="titanic-data-grid-column-modal__drag-icon" icon={titanicCommonIcons.titanicDragHandle} />
          {children}
        </div>
        <div className="titanic-data-grid-column-modal__field-actions">
          {isRequired ? (
            <span className="titanic-data-grid-column-modal__badge">{labels.requiredColumn}</span>
          ) : null}
          <Button unstyled
            aria-label={labels.removeColumn}
            className="titanic-data-grid-column-modal__icon-button"
            disabled={!canRemove}
            title={labels.removeColumn}
            type="button"
            onClick={onRemove}
          >
            <ResourceSvgIcon className="titanic-data-grid-column-modal__mini-icon" icon={titanicDataGridRowActionIcons.titanicDelete} />
          </Button>
        </div>
      </div>

      <Button unstyled
        aria-label={labels.columnWidth}
        className="titanic-data-grid-column-modal__resize-handle"
        title={`${labels.columnWidth}: ${span}`}
        type="button"
        onPointerDown={onResizeStart}
      />
    </EntityDragDropItem>
  );
});
