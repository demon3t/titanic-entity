import { defineComponentSchema } from "@titanic-entity/entity-base";
import {
  EntityPageActions as PageActions,
  type EntityPageActionsProps as PageActionsProps
} from "@titanic-entity/entity-react/components";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";

export const pageActionsComponentSchema = defineComponentSchema<PageActionsProps>({
  kind: "component",
  name: entityReactComponentNames.EntityPageActions,
  component: PageActions
});
