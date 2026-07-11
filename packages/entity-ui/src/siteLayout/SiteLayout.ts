import { defineComponentSchema } from "@titanic-entity/entity-base";
import { SiteLayout, type SiteLayoutProps } from "@titanic-entity/entity-react/layout";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";

export const siteLayoutComponentSchema = defineComponentSchema<SiteLayoutProps>({
  kind: "component",
  name: entityReactComponentNames.SiteLayout,
  component: SiteLayout
});
