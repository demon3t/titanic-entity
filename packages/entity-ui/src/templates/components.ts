import { defineComponentSchema } from "@titanic/entity-base";
import { EntityEditPage, entityReactComponentNames, type EntityEditPageProps } from "@titanic/entity-react";

export const entityEditPageComponentSchema = defineComponentSchema<EntityEditPageProps>({
  kind: "component",
  name: entityReactComponentNames.EntityEditPage,
  component: EntityEditPage
});

export const entityUiTemplateComponentSchemas = [
  entityEditPageComponentSchema
] as const;
