import { defineComponentSchema } from "@titanic-entity/entity-base";
import { SiteCollapsiblePanel, type SiteCollapsiblePanelProps } from "@titanic-entity/entity-react/layout";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";

export const siteCollapsiblePanelComponentSchema = defineComponentSchema<SiteCollapsiblePanelProps>({
  kind: "component",
  name: entityReactComponentNames.SiteCollapsiblePanel,
  component: SiteCollapsiblePanel
});
