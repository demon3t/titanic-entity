import type { CSSProperties, ReactNode, RefObject } from "react";
import {
  EntityDataGridColumnSettingsMode,
  type EntityDataGridLabels
} from "../../data-grid/EntityDataGridSettings";

export interface ColumnSettingsVisibleFieldsSchemaProps {
  children: ReactNode;
  gridRef: RefObject<HTMLDivElement | null>;
  hasVisibleFields: boolean;
  labels: EntityDataGridLabels;
  mode: EntityDataGridColumnSettingsMode;
  style: CSSProperties;
}

export function ColumnSettingsVisibleFieldsSchema({
  children,
  gridRef,
  hasVisibleFields,
  labels,
  mode,
  style
}: ColumnSettingsVisibleFieldsSchemaProps) {
  return (
    <section className="titanic-data-grid-column-modal__panel">
      <div className="titanic-data-grid-column-modal__panel-head">
        <div>
          <h3>{labels.visibleColumnsTitle}</h3>
        </div>
      </div>

      <div
        className={mode === EntityDataGridColumnSettingsMode.List
          ? "titanic-data-grid-column-modal__grid titanic-data-grid-column-modal__grid_list"
          : "titanic-data-grid-column-modal__grid titanic-data-grid-column-modal__grid_tile"}
        ref={gridRef}
        style={style}
      >
        {hasVisibleFields ? children : (
          <p className="titanic-data-grid-column-modal__empty">{labels.noSelectedColumns}</p>
        )}
      </div>
    </section>
  );
}
