import type { EntityDataGridSettingsModalPageRenderer } from "../dataGridSettingsModalPage/model/EntityDataGridSettingsModalPageContext";

export interface EntityDataGridPackageExtension<TRow = unknown> {
  renderColumnSettingsDialog?: EntityDataGridSettingsModalPageRenderer<TRow>;
}

export interface EntityDataGridPackage<TRow = unknown> {
  name: string;
  order: number;
  extension: EntityDataGridPackageExtension<TRow>;
}
