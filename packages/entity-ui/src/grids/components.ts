import { defineComponentSchema } from "@titanic-entity/entity-base";
import { EntityDataGrid, type EntityDataGridProps } from "@titanic-entity/entity-react/grids";
import { EntityGrid, type EntityGridProps } from "@titanic-entity/entity-react/layout";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";

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
