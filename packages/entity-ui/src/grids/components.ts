import { defineComponentSchema } from "@titanic/entity-base";
import { EntityDataGrid, EntityGrid, entityReactComponentNames, type EntityDataGridProps, type EntityGridProps } from "@titanic/entity-react";

export const entityDataGridComponentSchema = defineComponentSchema<EntityDataGridProps<any>>({
  kind: "component",
  name: entityReactComponentNames.EntityDataGrid,
  component: EntityDataGrid
});

export const entityGridComponentSchema = defineComponentSchema<EntityGridProps>({
  kind: "component",
  name: entityReactComponentNames.EntityGrid,
  component: EntityGrid
});

export const entityUiGridComponentSchemas = [
  entityDataGridComponentSchema,
  entityGridComponentSchema
] as const;
