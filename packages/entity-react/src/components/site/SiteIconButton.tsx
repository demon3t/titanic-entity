// Базовая иконочная кнопка сайта с ресурсной SVG-иконкой и всплывающей подписью.
import { ResourceSvgIcon } from "../icons/ResourceSvgIcon";
import type { ResourceSvgIconResource } from "@titanic/entity-resources";

export interface SiteIconButtonProps {
  buttonClassName: string;
  icon: ResourceSvgIconResource;
  iconClassName: string;
  label: string;
  tooltipClassName?: string;
  type?: "button" | "submit" | "reset";
  onClick: () => void;
}

export function SiteIconButton({
  buttonClassName,
  icon,
  iconClassName,
  label,
  tooltipClassName,
  type = "button",
  onClick
}: SiteIconButtonProps) {
  return (
    <button className={buttonClassName} type={type} aria-label={label} onClick={onClick}>
      <ResourceSvgIcon className={iconClassName} icon={icon} />
      {tooltipClassName ? <span className={tooltipClassName} role="tooltip">{label}</span> : null}
    </button>
  );
}
