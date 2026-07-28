import { defineIconModuleSchema } from "@titanic-entity/entity-base";
import {
  titanicCommonIcons,
  titanicDataGridRowActionIcons,
  titanicDataGridSettingsIcons
} from "@titanic-entity/entity-icons";

export {
  titanicCommonIcons,
  titanicDataGridRowActionIcons,
  titanicDataGridSettingsIcons
} from "@titanic-entity/entity-icons";

export const titanicDataGridCommonIcons = {
  titanicClose: titanicCommonIcons.titanicClose
} as const;

export const titanicDataGridIconGroups = {
  common: titanicDataGridCommonIcons,
  rowActions: titanicDataGridRowActionIcons,
  settings: titanicDataGridSettingsIcons
} as const;

export const dataGridIconModuleSchema = defineIconModuleSchema({
  name: "Titanic.UI.DataGrid.Icons",
  exports: {
    icons: titanicDataGridIconGroups,
    titanicDataGridCommonIcons,
    titanicDataGridIconGroups,
    titanicDataGridRowActionIcons,
    titanicDataGridSettingsIcons
  }
});

export const dataGridIconSchemas = [
  dataGridIconModuleSchema
] as const;
