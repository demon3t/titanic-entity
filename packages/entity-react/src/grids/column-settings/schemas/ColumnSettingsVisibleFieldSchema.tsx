import type {
  CSSProperties,
  DragEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode
} from "react";
import type { EntityDataGridLabels } from "../../data-grid/EntityDataGridSettings";

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
            <EditIcon />
          </button>
          <button
            aria-label={labels.removeColumn}
            className="titanic-data-grid-column-modal__icon-button"
            disabled={!canRemove}
            title={labels.removeColumn}
            type="button"
            onClick={onRemove}
          >
            <RemoveIcon />
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

function EditIcon() {
  return (
    <svg className="titanic-data-grid-column-modal__mini-icon" aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path d="m5 19 4.2-.8L18 9.4 14.6 6 5.8 14.8 5 19Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg className="titanic-data-grid-column-modal__mini-icon" aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path d="m7 7 10 10M17 7 7 17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
