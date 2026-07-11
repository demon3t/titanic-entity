import { defineComponentSchema } from "@titanic-entity/entity-base";
import { SitePanelToggleButton, type SitePanelToggleButtonProps } from "@titanic-entity/entity-react/layout";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";

export const sitePanelToggleButtonComponentSchema = defineComponentSchema<SitePanelToggleButtonProps>({
  kind: "component",
  name: entityReactComponentNames.SitePanelToggleButton,
  component: SitePanelToggleButton
});
