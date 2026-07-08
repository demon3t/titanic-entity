import { defineComponentSchema } from "@titanic-entity/entity-base";
import { SiteIconButton, type SiteIconButtonProps } from "@titanic-entity/entity-react/components";
import {
  PackageSiteShell,
  SiteCollapsiblePanel,
  SiteLayout,
  SitePanelToggleButton,
  type PackageSiteShellProps,
  type SiteCollapsiblePanelProps,
  type SiteLayoutProps,
  type SitePanelToggleButtonProps
} from "@titanic-entity/entity-react/layout";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";

export const packageSiteShellComponentSchema = defineComponentSchema<PackageSiteShellProps>({
  kind: "component",
  name: entityReactComponentNames.PackageSiteShell,
  component: PackageSiteShell
});

export const siteCollapsiblePanelComponentSchema = defineComponentSchema<SiteCollapsiblePanelProps>({
  kind: "component",
  name: entityReactComponentNames.SiteCollapsiblePanel,
  component: SiteCollapsiblePanel
});

export const siteIconButtonComponentSchema = defineComponentSchema<SiteIconButtonProps>({
  kind: "component",
  name: entityReactComponentNames.SiteIconButton,
  component: SiteIconButton
});

export const siteLayoutComponentSchema = defineComponentSchema<SiteLayoutProps>({
  kind: "component",
  name: entityReactComponentNames.SiteLayout,
  component: SiteLayout
});

export const sitePanelToggleButtonComponentSchema = defineComponentSchema<SitePanelToggleButtonProps>({
  kind: "component",
  name: entityReactComponentNames.SitePanelToggleButton,
  component: SitePanelToggleButton
});

export const entityUiSiteComponentSchemas = [
  packageSiteShellComponentSchema,
  siteCollapsiblePanelComponentSchema,
  siteIconButtonComponentSchema,
  siteLayoutComponentSchema,
  sitePanelToggleButtonComponentSchema
] as const;
