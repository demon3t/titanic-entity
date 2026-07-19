import type {
  EntityColumnDefinition,
  EntityValues
} from "@titanic-entity/entity-core";
import type {
  AriaRole,
  CSSProperties,
  MouseEventHandler,
  ReactNode
} from "react";

export type EntityLabelElement = "div" | "span" | "label" | "h1" | "h2" | "h3" | "p" | "strong";

export interface EntityLabelProps {
  as?: EntityLabelElement;
  children?: ReactNode;
  className?: string;
  column?: EntityColumnDefinition;
  htmlFor?: string;
  id?: string;
  role?: AriaRole;
  style?: CSSProperties;
  title?: string;
  value?: ReactNode;
  values?: EntityValues;
  visible?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
}
