import { defineComponentSchema } from "@titanic/entity-base";
import {
  EntityPageActionButton,
  EntityPageActions,
  entityReactComponentNames,
  type EntityPageActionButtonProps,
  type EntityPageActionsProps
} from "@titanic/entity-react";

export const entityPageActionButtonComponentSchema = defineComponentSchema<EntityPageActionButtonProps>({
  kind: "component",
  name: entityReactComponentNames.EntityPageActionButton,
  component: EntityPageActionButton
});

export const entityPageActionsComponentSchema = defineComponentSchema<EntityPageActionsProps>({
  kind: "component",
  name: entityReactComponentNames.EntityPageActions,
  component: EntityPageActions
});

export const entityUiActionComponentSchemas = [
  entityPageActionButtonComponentSchema,
  entityPageActionsComponentSchema
] as const;
