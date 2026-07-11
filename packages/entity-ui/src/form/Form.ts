import { defineComponentSchema } from "@titanic-entity/entity-base";
import { EntityForm as Form, type EntityFormProps as FormProps } from "@titanic-entity/entity-react/components";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";

export const formComponentSchema = defineComponentSchema<FormProps>({
  kind: "component",
  name: entityReactComponentNames.EntityForm,
  component: Form
});
