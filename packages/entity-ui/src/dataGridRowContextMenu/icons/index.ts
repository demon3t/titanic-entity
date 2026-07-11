import { defineIconModuleSchema } from "@titanic-entity/entity-base";
import { titanicDataGridRowActionIcons } from "@titanic-entity/entity-react/components";

export { titanicDataGridRowActionIcons } from "@titanic-entity/entity-react/components";

export const titanicDataGridRowContextMenuIconGroups = {
  rowActions: titanicDataGridRowActionIcons
} as const;

export const dataGridRowContextMenuIconModuleSchema = defineIconModuleSchema({
  name: "Titanic.EntityUi.DataGridRowContextMenu.Icons",
  exports: {
    icons: titanicDataGridRowContextMenuIconGroups,
    titanicDataGridRowContextMenuIconGroups,
    titanicDataGridRowActionIcons
  }
});

export const dataGridRowContextMenuIconSchemas = [
  dataGridRowContextMenuIconModuleSchema
] as const;
