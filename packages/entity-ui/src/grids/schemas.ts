import { defineGridSchema } from "@titanic-entity/entity-base";
import {
  EntityDataGrid,
  EntityOrmList,
  EntityRegistry,
  EntityTable,
  type EntityDataGridProps,
  type EntityOrmListProps,
  type EntityRegistryProps,
  type EntityTableProps
} from "@titanic-entity/entity-react/grids";
import { EntityGrid, type EntityGridProps } from "@titanic-entity/entity-react/layout";
import { entityReactGridNames } from "@titanic-entity/entity-react/model";

export const entityDataGridSchema = defineGridSchema<EntityDataGridProps<any>>({
  kind: "grid",
  name: entityReactGridNames.EntityDataGrid,
  component: EntityDataGrid
});

export const entityGridSchema = defineGridSchema<EntityGridProps>({
  kind: "grid",
  name: entityReactGridNames.EntityGrid,
  component: EntityGrid
});

export const entityOrmListSchema = defineGridSchema<EntityOrmListProps<any>>({
  kind: "grid",
  name: entityReactGridNames.EntityOrmList,
  component: EntityOrmList
});

export const entityRegistrySchema = defineGridSchema<EntityRegistryProps<any>>({
  kind: "grid",
  name: entityReactGridNames.EntityRegistry,
  component: EntityRegistry
});

export const entityTableSchema = defineGridSchema<EntityTableProps>({
  kind: "grid",
  name: entityReactGridNames.EntityTable,
  component: EntityTable
});

export const entityUiGridSchemas = [
  entityDataGridSchema,
  entityGridSchema,
  entityOrmListSchema,
  entityRegistrySchema,
  entityTableSchema
] as const;

export const entityReactGridSchemas = entityUiGridSchemas;
