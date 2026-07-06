// Базовый UI-компонент действия страницы 'EntityPageActionButton'.
import type { MouseEvent } from "react";
import type { EntityPageActionButtonProps } from "./models/EntityPageActionButtonProps";

export type {
  EntityPageActionButtonProps,
  EntityPageActionKind,
  EntityPageActionVariant
} from "./models/EntityPageActionButtonProps";

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
    <button
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
    </button>
  );
}
