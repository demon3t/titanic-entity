import { defineComponentSchema } from "@titanic-entity/entity-base";
import { SiteIconButton, type SiteIconButtonProps } from "@titanic-entity/entity-react/components";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";

export const siteIconButtonComponentSchema = defineComponentSchema<SiteIconButtonProps>({
  kind: "component",
  name: entityReactComponentNames.SiteIconButton,
  component: SiteIconButton
});
