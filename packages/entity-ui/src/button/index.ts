import { defineComponentSchema } from "@titanic-entity/entity-base";
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";
import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";
import type { ResourceSvgIconInput } from "../resourceSvgIcon/resource-svg-icon";
import "../resourceSvgIcon/resource-svg-icon";
import "./button";
import "./icon-button";
import "./icon-dropdown-button";
import "./panel-toggle-button";

export type ButtonVariant = "default" | "primary" | "secondary" | "danger" | "ghost";
export type PanelToggleDirection = "top" | "right" | "bottom" | "left";

export interface ButtonMenuAction {
  kind?: "item";
  key: string;
  label: ReactNode;
  className?: string;
  danger?: boolean;
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  title?: string;
}

export interface ButtonMenuSeparator {
  kind: "separator";
  key: string;
}

export type ButtonMenuItem = ButtonMenuAction | ButtonMenuSeparator;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  items?: readonly ButtonMenuItem[] | null;
  method?: string;
  methodArgs?: readonly unknown[];
  menuAriaLabel?: string;
  menuClassName?: string;
  menuItemClassName?: string;
  menuSeparatorClassName?: string;
  unstyled?: boolean;
  variant?: ButtonVariant;
}

export { ButtonMethodProvider } from "./button-method-context";
export type { ButtonMethodProviderProps, ButtonMethodRunner } from "./button-method-context";

export interface IconButtonProps {
  buttonClassName: string;
  icon: ResourceSvgIconInput;
  iconClassName: string;
  label: string;
  tooltipClassName?: string;
  type?: "button" | "submit" | "reset";
  onClick: () => void;
}

export type SiteIconButtonProps = IconButtonProps;

export interface IconDropdownOption {
  icon?: ResourceSvgIconInput;
  label: string;
  value: string;
}

export interface IconDropdownButtonProps {
  chevron?: ReactNode;
  chevronClassName?: string;
  className?: string;
  disabled?: boolean;
  errorClassName?: string;
  errorText?: string | null;
  iconClassName?: string;
  label: string;
  labelClassName?: string;
  menuClassName?: string;
  optionActiveClassName?: string;
  optionClassName?: string;
  options: readonly IconDropdownOption[];
  selectedLabelClassName?: string;
  tooltipClassName?: string;
  triggerClassName?: string;
  value: string;
  onChange: (value: string) => void;
}

export type SiteIconDropdownOption = IconDropdownOption;
export type SiteIconDropdownProps = IconDropdownButtonProps;

export interface PanelToggleButtonProps {
  className?: string;
  direction: PanelToggleDirection;
  expanded: boolean;
  icon: ResourceSvgIconInput;
  iconClassName?: string;
  label: string;
  onClick: () => void;
}

export type SitePanelToggleButtonProps = PanelToggleButtonProps;

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
