import { defineTemplateSchema } from "@titanic/entity-base";
import { EntityEditPage, entityReactTemplateNames, type EntityEditPageProps } from "@titanic/entity-react";

export const entityEditPageTemplateSchema = defineTemplateSchema<EntityEditPageProps>({
  kind: "template",
  name: entityReactTemplateNames.EntityEditPage,
  component: EntityEditPage
});

export const entityUiTemplateSchemas = [
  entityEditPageTemplateSchema
] as const;

export const entityReactTemplateSchemas = entityUiTemplateSchemas;
