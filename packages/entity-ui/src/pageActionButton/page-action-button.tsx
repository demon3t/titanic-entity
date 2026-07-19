import { defineComponentSchema } from "@titanic-entity/entity-base";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";// Базовый UI-компонент действия страницы 'EntityPageActionButton'.
import type { MouseEvent } from "react";
import { Button } from "../button";
import type { EntityPageActionButtonProps } from "../pageActionButton/page-action-button-props";

export type {
  EntityPageActionButtonProps,
  EntityPageActionKind,
  EntityPageActionVariant
} from "../pageActionButton/page-action-button-props";

export function EntityPageActionButton({
  actionName,
  ariaLabel,
  className = "",
  disabled,
  hidden,
  kind = "custom",
  label,
  loading,
  loadingLabel,
  onClick,
  title,
  type = "button",
  variant = "secondary"
}: EntityPageActionButtonProps) {
  if (hidden) {
    return null;
  }

  const rootClassName = [
    "titanic-action-button",
    `titanic-action-button_${variant}`,
    `titanic-action-button_kind-${kind}`,
    className
  ].filter(Boolean).join(" ");

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }

    void onClick?.();
  };

  return (
    <Button unstyled
      aria-label={ariaLabel}
      className={rootClassName}
      data-action={actionName}
      data-action-kind={kind}
      disabled={disabled || loading}
      title={title}
      type={type}
      onClick={handleClick}
    >
      {loading ? loadingLabel ?? label : label}
    </Button>
  );
}

export const pageActionButtonComponentSchema = defineComponentSchema<EntityPageActionButtonProps>({
  kind: "component",
  name: entityReactComponentNames.EntityPageActionButton,
  component: EntityPageActionButton
});
