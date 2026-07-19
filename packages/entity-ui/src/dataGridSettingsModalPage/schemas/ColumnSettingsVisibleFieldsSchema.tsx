import type { CSSProperties, ReactNode, RefObject } from "react";
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import type {
  EntityDataGridColumnSettingsMode,
  EntityDataGridLabels
} from "../../dataGrid/data-grid-settings";
import { EntityContainer } from "../../container";
import { EntityLabel } from "../../label";
import { columnSettingsDefinedComponentNames } from "./component-names";

export interface ColumnSettingsVisibleFieldsSchemaProps {
  children: ReactNode;
  gridRef: RefObject<HTMLDivElement | null>;
  hasVisibleFields: boolean;
  labels: EntityDataGridLabels;
  mode: EntityDataGridColumnSettingsMode;
  style: CSSProperties;
}

function ColumnSettingsVisibleFieldsSchemaNative({
  children,
  gridRef,
  hasVisibleFields,
  labels,
  mode,
  style
}: ColumnSettingsVisibleFieldsSchemaProps) {
  return (
    <EntityContainer className="titanic-data-grid-column-modal__panel">
      <EntityContainer className="titanic-data-grid-column-modal__panel-head">
        <EntityContainer>
          <EntityLabel as="h3" value={labels.visibleColumnsTitle} />
        </EntityContainer>
      </EntityContainer>

      <EntityContainer
        className={mode === "list"
          ? "titanic-data-grid-column-modal__grid titanic-data-grid-column-modal__grid_list"
          : "titanic-data-grid-column-modal__grid titanic-data-grid-column-modal__grid_tile"}
        containerRef={gridRef}
        style={style}
      >
        {hasVisibleFields ? children : (
          <EntityLabel as="p" className="titanic-data-grid-column-modal__empty" value={labels.noSelectedColumns} />
        )}
      </EntityContainer>
    </EntityContainer>
  );
}

Titanic.define<ColumnSettingsVisibleFieldsSchemaProps>(
  columnSettingsDefinedComponentNames.ColumnSettingsVisibleFields,
  ColumnSettingsVisibleFieldsSchemaNative
);

export const ColumnSettingsVisibleFieldsSchema = Titanic.getReactModule<
  DefinedEntityReactComponent<ColumnSettingsVisibleFieldsSchemaProps>
>(columnSettingsDefinedComponentNames.ColumnSettingsVisibleFields)!;
