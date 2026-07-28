import type { CSSProperties, ReactNode, RefObject } from "react";
import { Titanic } from "@titanic-entity/entity-react";
import type {
  EntityDataGridColumnSettingsMode,
  EntityDataGridLabels
} from "../../dataGrid/data-grid-settings";
import { Container } from "../../container";
import { Label } from "../../label";
import { columnSettingsDefinedComponentNames } from "./component-names";

export interface ColumnSettingsVisibleFieldsSchemaProps {
  children: ReactNode;
  gridRef: RefObject<HTMLDivElement | null>;
  hasVisibleFields: boolean;
  labels: EntityDataGridLabels;
  mode: EntityDataGridColumnSettingsMode;
  style: CSSProperties;
}

export const ColumnSettingsVisibleFieldsSchema = Titanic.define<ColumnSettingsVisibleFieldsSchemaProps>(columnSettingsDefinedComponentNames.ColumnSettingsVisibleFields, function ColumnSettingsVisibleFieldsSchema({
  children,
  gridRef,
  hasVisibleFields,
  labels,
  mode,
  style
}: ColumnSettingsVisibleFieldsSchemaProps) {
  return (
    <Container className="titanic-data-grid-column-modal__panel">
      <Container className="titanic-data-grid-column-modal__panel-head">
        <Container>
          <Label as="h3" value={labels.visibleColumnsTitle} />
        </Container>
      </Container>

      <Container
        className={mode === "list"
          ? "titanic-data-grid-column-modal__grid titanic-data-grid-column-modal__grid_list"
          : "titanic-data-grid-column-modal__grid titanic-data-grid-column-modal__grid_tile"}
        containerRef={gridRef}
        style={style}
      >
        {hasVisibleFields ? children : (
          <Label as="p" className="titanic-data-grid-column-modal__empty" value={labels.noSelectedColumns} />
        )}
      </Container>
    </Container>
  );
});
