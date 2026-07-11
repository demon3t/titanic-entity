import { defineComponentSchema, defineGridSchema } from "@titanic-entity/entity-base";
import { EntityRegistry as Registry, type EntityRegistryProps as RegistryProps } from "@titanic-entity/entity-react/grids";
import { entityReactComponentNames, entityReactGridNames } from "@titanic-entity/entity-react/model";

export const registryComponentSchema = defineComponentSchema<RegistryProps<any>>({
  kind: "component",
  name: entityReactComponentNames.EntityRegistry,
  component: Registry
});

export const registrySchema = defineGridSchema<RegistryProps<any>>({
  kind: "grid",
  name: entityReactGridNames.EntityRegistry,
  component: Registry
});
