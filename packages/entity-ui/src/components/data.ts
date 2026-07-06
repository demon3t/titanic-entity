import { defineComponentSchema } from "@titanic/entity-base";
import {
  EntityForm,
  EntityOrmList,
  EntityRecordDetails,
  EntityRegistry,
  EntityTable,
  entityReactComponentNames,
  type EntityFormProps,
  type EntityOrmListProps,
  type EntityRecordDetailsProps,
  type EntityRegistryProps,
  type EntityTableProps
} from "@titanic/entity-react";

export const entityFormComponentSchema = defineComponentSchema<EntityFormProps>({
  kind: "component",
  name: entityReactComponentNames.EntityForm,
  component: EntityForm
});

export const entityOrmListComponentSchema = defineComponentSchema<EntityOrmListProps<any>>({
  kind: "component",
  name: entityReactComponentNames.EntityOrmList,
  component: EntityOrmList
});

export const entityRecordDetailsComponentSchema = defineComponentSchema<EntityRecordDetailsProps>({
  kind: "component",
  name: entityReactComponentNames.EntityRecordDetails,
  component: EntityRecordDetails
});

export const entityRegistryComponentSchema = defineComponentSchema<EntityRegistryProps<any>>({
  kind: "component",
  name: entityReactComponentNames.EntityRegistry,
  component: EntityRegistry
});

export const entityTableComponentSchema = defineComponentSchema<EntityTableProps>({
  kind: "component",
  name: entityReactComponentNames.EntityTable,
  component: EntityTable
});

export const entityUiDataComponentSchemas = [
  entityFormComponentSchema,
  entityOrmListComponentSchema,
  entityRecordDetailsComponentSchema,
  entityRegistryComponentSchema,
  entityTableComponentSchema
] as const;
