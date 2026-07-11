// Базовая сворачиваемая панель сайта: HTML панели находится в общем UI-пакете.
import type { ReactNode } from "react";
import type { ResourceSvgIconInput } from "../icons/ResourceSvgIcon";
import { SitePanelToggleButton } from "./SitePanelToggleButton";

export interface SiteCollapsiblePanelProps {
  ariaLabel: string;
  children: ReactNode;
  className: string;
  collapsed: boolean;
  collapsedIconDirection: "left" | "right";
  collapseLabel: string;
  expandedIconDirection: "left" | "right";
  expandLabel: string;
  header?: ReactNode;
  icon: ResourceSvgIconInput;
  togglePlacement?: "after-content" | "after-header";
  toggleClassName: string;
  toggleIconClassName: (direction: "left" | "right") => string;
  onToggle: () => void;
}

export function SiteCollapsiblePanel({
  ariaLabel,
  children,
  className,
  collapsed,
  collapsedIconDirection,
  collapseLabel,
  expandedIconDirection,
  expandLabel,
  header,
  icon,
  togglePlacement = "after-content",
  toggleClassName,
  toggleIconClassName,
  onToggle
}: SiteCollapsiblePanelProps) {
  const direction = collapsed ? collapsedIconDirection : expandedIconDirection;
  const toggle = (
    <SitePanelToggleButton
      className={toggleClassName}
      direction={direction}
      expanded={!collapsed}
      icon={icon}
      iconClassName={toggleIconClassName(direction)}
      label={collapsed ? expandLabel : collapseLabel}
      onClick={onToggle}
    />
  );

  return (
    <aside className={className} aria-label={ariaLabel}>
      {header}
      {togglePlacement === "after-header" ? toggle : null}
      {children}
      {togglePlacement === "after-content" ? toggle : null}
    </aside>
  );
}
