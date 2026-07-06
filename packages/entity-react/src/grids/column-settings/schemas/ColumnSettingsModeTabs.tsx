import type {
  EntityDataGridColumnSettingsMode,
  EntityDataGridLabels
} from "../../data-grid/EntityDataGridSettings";

export interface ColumnSettingsModeTabsProps {
  labels: EntityDataGridLabels;
  mode: EntityDataGridColumnSettingsMode;
  onChange: (mode: EntityDataGridColumnSettingsMode) => void;
}

export function ColumnSettingsModeTabs({
  labels,
  mode,
  onChange
}: ColumnSettingsModeTabsProps) {
  return (
    <div className="titanic-data-grid-column-modal__toolbar">
      <div className="titanic-data-grid-column-modal__modes" role="tablist" aria-label={labels.configureColumns}>
        <button
          aria-selected={mode === "list"}
          className={mode === "list" ? "titanic-data-grid-column-modal__mode titanic-data-grid-column-modal__mode_active" : "titanic-data-grid-column-modal__mode"}
          role="tab"
          type="button"
          onClick={() => onChange("list")}
        >
          {labels.listMode}
        </button>
        <button
          aria-selected={mode === "tile"}
          className={mode === "tile" ? "titanic-data-grid-column-modal__mode titanic-data-grid-column-modal__mode_active" : "titanic-data-grid-column-modal__mode"}
          role="tab"
          type="button"
          onClick={() => onChange("tile")}
        >
          {labels.tileMode}
        </button>
      </div>
    </div>
  );
}
