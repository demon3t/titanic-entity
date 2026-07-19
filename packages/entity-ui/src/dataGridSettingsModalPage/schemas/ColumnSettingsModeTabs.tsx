import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import type {
  EntityDataGridColumnSettingsMode,
  EntityDataGridLabels
} from "../../dataGrid/data-grid-settings";
import { Button } from "../../button";
import { columnSettingsDefinedComponentNames } from "./component-names";

export interface ColumnSettingsModeTabsProps {
  labels: EntityDataGridLabels;
  mode: EntityDataGridColumnSettingsMode;
  onChange: (mode: EntityDataGridColumnSettingsMode) => void;
}

function ColumnSettingsModeTabsNative({
  labels,
  mode,
  onChange
}: ColumnSettingsModeTabsProps) {
  return (
    <div className="titanic-data-grid-column-modal__toolbar">
      <div className="titanic-data-grid-column-modal__modes" role="tablist" aria-label={labels.configureColumns}>
        <Button unstyled
          aria-selected={mode === "list"}
          className={mode === "list" ? "titanic-data-grid-column-modal__mode titanic-data-grid-column-modal__mode_active" : "titanic-data-grid-column-modal__mode"}
          role="tab"
          type="button"
          onClick={() => onChange("list")}
        >
          {labels.listMode}
        </Button>
        <Button unstyled
          aria-selected={mode === "tile"}
          className={mode === "tile" ? "titanic-data-grid-column-modal__mode titanic-data-grid-column-modal__mode_active" : "titanic-data-grid-column-modal__mode"}
          role="tab"
          type="button"
          onClick={() => onChange("tile")}
        >
          {labels.tileMode}
        </Button>
      </div>
    </div>
  );
}

Titanic.define<ColumnSettingsModeTabsProps>(
  columnSettingsDefinedComponentNames.ColumnSettingsModeTabs,
  ColumnSettingsModeTabsNative
);

export const ColumnSettingsModeTabs = Titanic.getReactModule<
  DefinedEntityReactComponent<ColumnSettingsModeTabsProps>
>(columnSettingsDefinedComponentNames.ColumnSettingsModeTabs)!;
