import type {
  CSSProperties,
  DragEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode
} from "react";
import type { EntityDataGridLabels } from "../../data-grid/EntityDataGridSettings";
import { ResourceSvgIcon } from "../../../components/icons/ResourceSvgIcon";

export interface ColumnSettingsVisibleFieldSchemaProps {
  canRemove: boolean;
  children: ReactNode;
  className: string;
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
  onRename: () => void;
  onResizeStart: (event: ReactPointerEvent<HTMLElement>) => void;
}

export function ColumnSettingsVisibleFieldSchema({
  canRemove,
  children,
  className,
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
  onRename,
  onResizeStart
}: ColumnSettingsVisibleFieldSchemaProps) {
  return (
    <article
      className={className}
      draggable={draggable}
      style={style}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragStart={onDragStart}
      onDrop={onDrop}
    >
      <div className="titanic-data-grid-column-modal__field-head">
        <div className="titanic-data-grid-column-modal__field-title">
          {children}
        </div>
        <div className="titanic-data-grid-column-modal__field-actions">
          {isRequired ? (
            <span className="titanic-data-grid-column-modal__badge">{labels.requiredColumn}</span>
          ) : null}
          <button
            aria-label={labels.renameColumn}
            className="titanic-data-grid-column-modal__icon-button"
            title={labels.renameColumn}
            type="button"
            onClick={onRename}
          >
            <ResourceSvgIcon className="titanic-data-grid-column-modal__mini-icon" icon="edit" />
          </button>
          <button
            aria-label={labels.removeColumn}
            className="titanic-data-grid-column-modal__icon-button"
            disabled={!canRemove}
            title={labels.removeColumn}
            type="button"
            onClick={onRemove}
          >
            <ResourceSvgIcon className="titanic-data-grid-column-modal__mini-icon" icon="remove" />
          </button>
        </div>
      </div>

      <button
        aria-label={labels.columnWidth}
        className="titanic-data-grid-column-modal__resize-handle"
        title={`${labels.columnWidth}: ${span}`}
        type="button"
        onPointerDown={onResizeStart}
      />
    </article>
  );
}
