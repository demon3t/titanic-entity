import type { EntityDataGridColumnSettingsDialogRenderer } from "../column-settings/model/EntityDataGridColumnSettingsDialogContext";

export interface EntityDataGridPackageExtension<TRow = unknown> {
  renderColumnSettingsDialog?: EntityDataGridColumnSettingsDialogRenderer<TRow>;
}

export interface EntityDataGridPackage<TRow = unknown> {
  name: string;
  order: number;
  extension: EntityDataGridPackageExtension<TRow>;
}
