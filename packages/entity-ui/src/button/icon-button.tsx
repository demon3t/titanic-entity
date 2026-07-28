import { Titanic } from "@titanic-entity/entity-react";
import { ResourceSvgIcon } from "../resourceSvgIcon/resource-svg-icon";
import { Button } from "./button";
import type { IconButtonProps } from "./index";

export const IconButton = Titanic.define<IconButtonProps>("Titanic.UI.IconButton", function IconButton({
  buttonClassName,
  icon,
  iconClassName,
  label,
  tooltipClassName,
  type = "button",
  onClick
}: IconButtonProps) {
  return (
    <Button
      unstyled
      aria-label={label}
      className={buttonClassName}
      type={type}
      onClick={onClick}
    >
      <ResourceSvgIcon className={iconClassName} icon={icon} />
      {tooltipClassName ? <span className={tooltipClassName} role="tooltip">{label}</span> : null}
    </Button>
  );
});
