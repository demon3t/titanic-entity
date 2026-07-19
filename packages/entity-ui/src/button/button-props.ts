import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";

export type ButtonVariant = "default" | "primary" | "secondary" | "danger" | "ghost";

export interface ButtonMenuAction {
  kind?: "item";
  key: string;
  label: ReactNode;
  className?: string;
  danger?: boolean;
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  title?: string;
}

export interface ButtonMenuSeparator {
  kind: "separator";
  key: string;
}

export type ButtonMenuItem = ButtonMenuAction | ButtonMenuSeparator;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  items?: readonly ButtonMenuItem[] | null;
  menuAriaLabel?: string;
  menuClassName?: string;
  menuItemClassName?: string;
  menuSeparatorClassName?: string;
  unstyled?: boolean;
  variant?: ButtonVariant;
}
