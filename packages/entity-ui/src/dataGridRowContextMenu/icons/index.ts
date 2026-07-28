import { defineIconModuleSchema } from "@titanic-entity/entity-base";
import { titanicDataGridRowActionIcons } from "@titanic-entity/entity-icons";

export { titanicDataGridRowActionIcons } from "@titanic-entity/entity-icons";

export const titanicDataGridRowContextMenuIconGroups = {
  rowActions: titanicDataGridRowActionIcons
} as const;

export const dataGridRowContextMenuIconModuleSchema = defineIconModuleSchema({
  name: "Titanic.UI.DataGridRowContextMenu.Icons",
  exports: {
    icons: titanicDataGridRowContextMenuIconGroups,
    titanicDataGridRowContextMenuIconGroups,
    titanicDataGridRowActionIcons
  }
});

export const dataGridRowContextMenuIconSchemas = [
  dataGridRowContextMenuIconModuleSchema
] as const;
