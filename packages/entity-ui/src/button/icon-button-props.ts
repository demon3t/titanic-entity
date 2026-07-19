import type { ResourceSvgIconInput } from "../resourceSvgIcon/resource-svg-icon";

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
