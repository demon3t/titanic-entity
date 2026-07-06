import { defineGridSchema } from "@titanic-entity/entity-base";
import {
  EntityDataGrid,
  EntityGrid,
  EntityOrmList,
  EntityRegistry,
  EntityTable,
  entityReactGridNames,
  type EntityDataGridProps,
  type EntityGridProps,
  type EntityOrmListProps,
  type EntityRegistryProps,
  type EntityTableProps
} from "@titanic-entity/entity-react";

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
