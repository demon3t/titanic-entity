import { defineComponentSchema } from "@titanic-entity/entity-base";
import {
  EntityDataGridRowContextMenu as DataGridRowContextMenu,
  type EntityDataGridRowContextMenuProps as DataGridRowContextMenuProps
} from "@titanic-entity/entity-react/components";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";

export const dataGridRowContextMenuComponentSchema = defineComponentSchema<DataGridRowContextMenuProps<any>>({
  kind: "component",
  name: entityReactComponentNames.EntityDataGridRowContextMenu,
  component: DataGridRowContextMenu
});
