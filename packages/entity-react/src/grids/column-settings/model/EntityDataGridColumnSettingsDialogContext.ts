import type { ReactNode } from "react";
import type {
  EntityDataGridColumnSetting,
  EntityDataGridColumn,
  EntityDataGridColumnSettingsMode,
  EntityDataGridModeSettingsMap
} from "../../data-grid/EntityDataGridSettings";
import type { EntityDataGridLabels } from "../../data-grid/EntityDataGridSettings";
import type { EntityApiManagerStructureResponse } from "@titanic/entity-api";
import type { EntityDataGridColumnPickerLabels } from "../../data-grid/EntityDataGridProps";

export interface EntityDataGridColumnSettingsDialogContext<TRow = unknown> {
  columns: readonly EntityDataGridColumn<TRow>[];
  columnSettingsMode: EntityDataGridColumnSettingsMode;
  currentSettings: readonly EntityDataGridColumnSetting[];
  error: string | null;
  gridWidth: number;
  isOpen: boolean;
  labels: EntityDataGridLabels;
  columnPickerLabels?: EntityDataGridColumnPickerLabels;
  modeSettings?: EntityDataGridModeSettingsMap;
  rootTableName?: string | null;
  saving: boolean;
  structure?: EntityApiManagerStructureResponse | null;
  title?: string;
  onApply: (
    settings: EntityDataGridColumnSetting[],
    columnSettingsMode: EntityDataGridColumnSettingsMode,
    modeSettings?: EntityDataGridModeSettingsMap
  ) => void;
  onClose: () => void;
  onSaveDefault: (
    settings: EntityDataGridColumnSetting[],
    columnSettingsMode: EntityDataGridColumnSettingsMode,
    modeSettings?: EntityDataGridModeSettingsMap
  ) => void;
}

export type EntityDataGridColumnSettingsDialogRenderer<TRow = unknown> = (
  context: EntityDataGridColumnSettingsDialogContext<TRow>
) => ReactNode;
