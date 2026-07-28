import { defineComponentSchema } from "@titanic-entity/entity-base";
import { Titanic } from "@titanic-entity/entity-react";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";
import { Fragment, type Key, type ReactNode } from "react";
import { PanelToggleButton } from "../button";
import type { ResourceSvgIconInput } from "../resourceSvgIcon/resource-svg-icon";

export type CollapsiblePanelDirection = "top" | "right" | "bottom" | "left";
export type CollapsiblePanelItemPosition = "before-toggle" | "after-toggle";

export interface CollapsiblePanelItem {
  key: Key;
  expanded: ReactNode;
  collapsed: ReactNode;
  position?: CollapsiblePanelItemPosition;
}

export interface CollapsiblePanelProps {
  ariaLabel: string;
  className?: string;
  collapsed: boolean;
  collapseDirection: CollapsiblePanelDirection;
  collapseLabel: string;
  expandLabel: string;
  icon: ResourceSvgIconInput;
  items: readonly CollapsiblePanelItem[];
  toggleClassName?: string;
  toggleIconClassName?: (direction: CollapsiblePanelDirection) => string;
  onToggle: () => void;
}

export const CollapsiblePanel = Titanic.define<CollapsiblePanelProps>("Titanic.UI.CollapsiblePanel", function CollapsiblePanel({
  ariaLabel,
  className,
  collapsed,
  collapseDirection,
  collapseLabel,
  expandLabel,
  icon,
  items,
  toggleClassName,
  toggleIconClassName,
  onToggle
}: CollapsiblePanelProps) {
  const direction = collapsed ? getOppositeDirection(collapseDirection) : collapseDirection;
  const rootClassName = joinClassNames(
    "titanic-collapsible-panel",
    `titanic-collapsible-panel_${collapseDirection}`,
    collapsed && "titanic-collapsible-panel_collapsed",
    className
  );
  const iconClassName = joinClassNames(
    "titanic-collapsible-panel__toggle-icon",
    `titanic-collapsible-panel__toggle-icon_${direction}`,
    toggleIconClassName?.(direction)
  );
  const toggle = (
    <PanelToggleButton
      className={joinClassNames("titanic-collapsible-panel__toggle", toggleClassName)}
      direction={direction}
      expanded={!collapsed}
      icon={icon}
      iconClassName={iconClassName}
      label={collapsed ? expandLabel : collapseLabel}
      onClick={onToggle}
    />
  );

  return (
    <aside
      aria-label={ariaLabel}
      className={rootClassName}
      data-collapse-direction={collapseDirection}
      data-collapsed={collapsed ? "true" : "false"}
    >
      {renderItems(items, "before-toggle", collapsed)}
      {toggle}
      {renderItems(items, "after-toggle", collapsed)}
    </aside>
  );
});

function renderItems(
  items: readonly CollapsiblePanelItem[],
  position: CollapsiblePanelItemPosition,
  collapsed: boolean
): ReactNode {
  return items
    .filter((item) => (item.position ?? "after-toggle") === position)
    .map((item) => (
      <Fragment key={item.key}>
        {collapsed ? item.collapsed : item.expanded}
      </Fragment>
    ));
}

function getOppositeDirection(direction: CollapsiblePanelDirection): CollapsiblePanelDirection {
  switch (direction) {
    case "top":
      return "bottom";
    case "right":
      return "left";
    case "bottom":
      return "top";
    case "left":
      return "right";
  }
}

function joinClassNames(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

export const collapsiblePanelComponentSchema = defineComponentSchema<CollapsiblePanelProps>({
  kind: "component",
  name: entityReactComponentNames.CollapsiblePanel,
  component: CollapsiblePanel
});
