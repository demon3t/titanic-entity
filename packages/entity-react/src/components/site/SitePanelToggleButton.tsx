// Базовая кнопка сворачивания панели сайта, переиспользуемая пакетными оболочками.
import { ResourceSvgIcon, type ResourceSvgIconInput } from "../icons/ResourceSvgIcon";

export interface SitePanelToggleButtonProps {
  className?: string;
  direction: "left" | "right";
  expanded: boolean;
  icon: ResourceSvgIconInput;
  iconClassName?: string;
  label: string;
  onClick: () => void;
}

export function SitePanelToggleButton({
  className = "",
  direction,
  expanded,
  icon,
  iconClassName = "",
  label,
  onClick
}: SitePanelToggleButtonProps) {
  return (
    <button
      aria-expanded={expanded}
      aria-label={label}
      className={className}
      title={label}
      type="button"
      onClick={onClick}
    >
      <ResourceSvgIcon className={iconClassName} icon={icon} />
      <span className="titanic-site-toggle__direction" data-direction={direction} hidden />
    </button>
  );
}
