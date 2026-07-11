import { defineComponentSchema, defineGridSchema } from "@titanic-entity/entity-base";
import { EntityTable as Table, type EntityTableProps as TableProps } from "@titanic-entity/entity-react/grids";
import { entityReactComponentNames, entityReactGridNames } from "@titanic-entity/entity-react/model";

export const tableComponentSchema = defineComponentSchema<TableProps>({
  kind: "component",
  name: entityReactComponentNames.EntityTable,
  component: Table
});

export const tableSchema = defineGridSchema<TableProps>({
  kind: "grid",
  name: entityReactGridNames.EntityTable,
  component: Table
});
