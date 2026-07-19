import type {
  AriaRole,
  CSSProperties,
  MouseEventHandler,
  ReactNode
} from "react";

export interface EntityGridProps {
  ariaLabel?: string;
  ariaLabelledBy?: string;
  children?: ReactNode;
  className?: string;
  columns?: number;
  gap?: number;
  id?: string;
  role?: AriaRole;
  style?: CSSProperties;
  tabIndex?: number;
  title?: string;
  visible?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
}
