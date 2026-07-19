import type { ReactNode } from "react";
import type { ResourceSvgIconInput } from "../resourceSvgIcon/resource-svg-icon";

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
