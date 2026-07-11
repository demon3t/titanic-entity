import { defineComponentSchema, defineGridSchema } from "@titanic-entity/entity-base";
import { EntityDataGrid as DataGrid, type EntityDataGridProps as DataGridProps } from "@titanic-entity/entity-react/grids";
import { entityReactComponentNames, entityReactGridNames } from "@titanic-entity/entity-react/model";

export const dataGridComponentSchema = defineComponentSchema<DataGridProps<any>>({
  kind: "component",
  name: entityReactComponentNames.EntityDataGrid,
  component: DataGrid
});

export const dataGridSchema = defineGridSchema<DataGridProps<any>>({
  kind: "grid",
  name: entityReactGridNames.EntityDataGrid,
  component: DataGrid
});
