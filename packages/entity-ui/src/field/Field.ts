import { defineComponentSchema, defineFieldSchema } from "@titanic-entity/entity-base";
import {
  EntityField as Field,
  entityReactFieldNames,
  type EntityFieldProps as FieldProps
} from "@titanic-entity/entity-react/fields";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";

export const fieldComponentSchema = defineComponentSchema<FieldProps>({
  kind: "component",
  name: entityReactComponentNames.EntityField,
  component: Field
});

export const fieldSchema = defineFieldSchema<FieldProps>({
  kind: "field",
  name: entityReactFieldNames.EntityField,
  component: Field
});
