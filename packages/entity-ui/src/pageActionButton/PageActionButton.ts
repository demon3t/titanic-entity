import { defineComponentSchema } from "@titanic-entity/entity-base";
import {
  EntityPageActionButton as PageActionButton,
  type EntityPageActionButtonProps as PageActionButtonProps
} from "@titanic-entity/entity-react/components";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";

export const pageActionButtonComponentSchema = defineComponentSchema<PageActionButtonProps>({
  kind: "component",
  name: entityReactComponentNames.EntityPageActionButton,
  component: PageActionButton
});
