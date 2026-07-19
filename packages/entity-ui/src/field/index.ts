import { defineComponentSchema, defineFieldSchema } from "@titanic-entity/entity-base";
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import { entityReactComponentNames, entityReactFieldNames } from "@titanic-entity/entity-react/model";
import "./field-context";
import "./input-builder";
import "./field";
import type { EntityFieldProps } from "./field-props";

export type { EntityFieldProps } from "./field-props";

export const EntityField = Titanic.getReactModule<DefinedEntityReactComponent<EntityFieldProps>>(
  "Titanic.UI.EntityField"
)!;

export const fieldComponentSchema = defineComponentSchema<EntityFieldProps>({
  kind: "component",
  name: entityReactComponentNames.EntityField,
  component: EntityField
});

export const fieldSchema = defineFieldSchema<EntityFieldProps>({
  kind: "field",
  name: entityReactFieldNames.EntityField,
  component: EntityField
});

export * from "./field-context";
export * from "./input-builder";
export * from "./input-resolver";
export * from "./icons";
export * from "./lcz";
