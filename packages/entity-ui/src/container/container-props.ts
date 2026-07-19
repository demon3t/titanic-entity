import type {
  AriaRole,
  CSSProperties,
  MouseEventHandler,
  ReactNode
} from "react";

export type EntityContainerRef =
  | ((instance: HTMLDivElement | null) => void)
  | { current: HTMLDivElement | null }
  | null;

export interface EntityContainerProps {
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaModal?: boolean | "false" | "true";
  children?: ReactNode;
  className?: string;
  containerRef?: EntityContainerRef;
  id?: string;
  role?: AriaRole;
  style?: CSSProperties;
  tabIndex?: number;
  title?: string;
  visible?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
}
