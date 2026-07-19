import { defineComponentSchema } from "@titanic-entity/entity-base";
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";
import "../resourceSvgIcon/resource-svg-icon";
import "./button";
import "./icon-button";
import "./icon-dropdown-button";
import "./panel-toggle-button";
import type { ButtonProps } from "./button-props";
import type { IconButtonProps, SiteIconButtonProps } from "./icon-button-props";
import type {
  IconDropdownButtonProps,
  SiteIconDropdownProps
} from "./icon-dropdown-button-props";
import type {
  PanelToggleButtonProps,
  SitePanelToggleButtonProps
} from "./panel-toggle-button-props";

export type {
  ButtonMenuAction,
  ButtonMenuItem,
  ButtonMenuSeparator,
  ButtonProps,
  ButtonVariant
} from "./button-props";
export type { IconButtonProps, SiteIconButtonProps } from "./icon-button-props";
export type {
  IconDropdownButtonProps,
  IconDropdownOption,
  SiteIconDropdownOption,
  SiteIconDropdownProps
} from "./icon-dropdown-button-props";
export type {
  PanelToggleButtonProps,
  SitePanelToggleButtonProps
} from "./panel-toggle-button-props";

export const Button = Titanic.getReactModule<DefinedEntityReactComponent<ButtonProps>>(
  "Titanic.UI.Button"
)!;

export const IconButton = Titanic.getReactModule<DefinedEntityReactComponent<IconButtonProps>>(
  "Titanic.UI.IconButton"
)!;

export const IconDropdownButton = Titanic.getReactModule<DefinedEntityReactComponent<IconDropdownButtonProps>>(
  "Titanic.UI.IconDropdownButton"
)!;

export const PanelToggleButton = Titanic.getReactModule<DefinedEntityReactComponent<PanelToggleButtonProps>>(
  "Titanic.UI.PanelToggleButton"
)!;

export const SiteIconButton = IconButton;
export const SiteIconDropdown = IconDropdownButton;
export const SitePanelToggleButton = PanelToggleButton;

export const buttonComponentSchema = defineComponentSchema<ButtonProps>({
  kind: "component",
  name: entityReactComponentNames.Button,
  component: Button
});

export const siteIconButtonComponentSchema = defineComponentSchema<SiteIconButtonProps>({
  kind: "component",
  name: entityReactComponentNames.SiteIconButton,
  component: SiteIconButton
});

export const siteIconDropdownComponentSchema = defineComponentSchema<SiteIconDropdownProps>({
  kind: "component",
  name: entityReactComponentNames.SiteIconDropdown,
  component: SiteIconDropdown
});

export const sitePanelToggleButtonComponentSchema = defineComponentSchema<SitePanelToggleButtonProps>({
  kind: "component",
  name: entityReactComponentNames.SitePanelToggleButton,
  component: SitePanelToggleButton
});
