// Контракт свойств базового действия страницы 'EntityPageActionButtonProps'.
import type { ReactNode } from "react";

export type EntityPageActionKind = "save" | "back" | "delete" | "cancel" | "custom";
export type EntityPageActionVariant = "primary" | "secondary" | "danger" | "ghost";

export interface EntityPageActionButtonProps {
  actionName: string;
  label: ReactNode;
  loadingLabel?: ReactNode;
  kind?: EntityPageActionKind;
  variant?: EntityPageActionVariant;
  loading?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  title?: string;
  ariaLabel?: string;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void | Promise<void>;
}
