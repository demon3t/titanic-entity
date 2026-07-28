import type { ReactNode } from "react";
import type { EntityApiClient, EntityApiManagerStructureResponse } from "@titanic-entity/entity-api";
import type { EntityDataGridColumnPickerLabels } from "../../dataGrid";
import type {
  EntityDataGridColumnSetting,
  EntityDataGridColumn,
  EntityDataGridColumnSettingsMode,
  EntityDataGridLabels,
  EntityDataGridModeSettingsMap
} from "../../dataGrid/data-grid-settings";

export interface EntityDataGridSettingsModalPageContext<TRow = unknown> {
  columns: readonly EntityDataGridColumn<TRow>[];
  client?: EntityApiClient;
  columnSettingsMode: EntityDataGridColumnSettingsMode;
  currentSettings: readonly EntityDataGridColumnSetting[];
  error: string | null;
  gridId?: string;
  gridKey?: string;
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
  ) => void | Promise<void>;
  onClose: () => void;
  onSave?: (
    settings: EntityDataGridColumnSetting[],
    columnSettingsMode: EntityDataGridColumnSettingsMode,
    modeSettings?: EntityDataGridModeSettingsMap
  ) => void | Promise<void>;
  onSaveDefault: (
    settings: EntityDataGridColumnSetting[],
    columnSettingsMode: EntityDataGridColumnSettingsMode,
    modeSettings?: EntityDataGridModeSettingsMap
  ) => void | Promise<void>;
}

export type EntityDataGridSettingsModalPageRenderer<TRow = unknown> = (
  context: EntityDataGridSettingsModalPageContext<TRow>
) => ReactNode;
