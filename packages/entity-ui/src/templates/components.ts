import { defineComponentSchema } from "@titanic-entity/entity-base";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";
import { EntityEditPage, type EntityEditPageProps } from "@titanic-entity/entity-react/templates";

export const entityEditPageComponentSchema = defineComponentSchema<EntityEditPageProps>({
  kind: "component",
  name: entityReactComponentNames.EntityEditPage,
  component: EntityEditPage
});

export const entityUiTemplateComponentSchemas = [
  entityEditPageComponentSchema
] as const;
