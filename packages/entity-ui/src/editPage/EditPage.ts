import { defineComponentSchema, defineTemplateSchema } from "@titanic-entity/entity-base";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";
import {
  EntityEditPage as EditPage,
  entityReactTemplateNames,
  type EntityEditPageProps as EditPageProps
} from "@titanic-entity/entity-react/templates";

export const editPageComponentSchema = defineComponentSchema<EditPageProps>({
  kind: "component",
  name: entityReactComponentNames.EntityEditPage,
  component: EditPage
});

export const editPageTemplateSchema = defineTemplateSchema<EditPageProps>({
  kind: "template",
  name: entityReactTemplateNames.EntityEditPage,
  component: EditPage
});
