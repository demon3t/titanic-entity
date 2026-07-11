import { defineComponentSchema } from "@titanic-entity/entity-base";
import { SiteIconDropdown, type SiteIconDropdownProps } from "@titanic-entity/entity-react/components";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";

export const siteIconDropdownComponentSchema = defineComponentSchema<SiteIconDropdownProps>({
  kind: "component",
  name: entityReactComponentNames.SiteIconDropdown,
  component: SiteIconDropdown
});
