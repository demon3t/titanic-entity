import type { ResourceSvgIconInput } from "../resourceSvgIcon/resource-svg-icon";

export interface PanelToggleButtonProps {
  className?: string;
  direction: "left" | "right";
  expanded: boolean;
  icon: ResourceSvgIconInput;
  iconClassName?: string;
  label: string;
  onClick: () => void;
}

export type SitePanelToggleButtonProps = PanelToggleButtonProps;
