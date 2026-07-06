import { EntityDataGridColumnSettingsDialog } from "./components/EntityDataGridColumnSettingsDialog";
import type { EntityDataGridPackage } from "../data-grid/EntityDataGridPackage";

export function createEntityDataGridColumnSettingsPackage<TRow = unknown>(): EntityDataGridPackage<TRow> {
  return {
    name: "column-settings",
    order: 100,
    extension: {
      renderColumnSettingsDialog: (context) => <EntityDataGridColumnSettingsDialog<TRow> {...context} />
    }
  };
}
