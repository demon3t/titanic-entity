import { defineComponentSchema } from "@titanic-entity/entity-base";
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import type {
  AriaRole,
  CSSProperties,
  MouseEventHandler,
  ReactNode
} from "react";
import "./container";

export type ContainerRef =
  | ((instance: HTMLDivElement | null) => void)
  | { current: HTMLDivElement | null }
  | null;

export interface ContainerProps {
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaModal?: boolean | "false" | "true";
  children?: ReactNode;
  className?: string;
  containerRef?: ContainerRef;
  id?: string;
  role?: AriaRole;
  style?: CSSProperties;
  tabIndex?: number;
  title?: string;
  visible?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export const Container = Titanic.getReactModule<DefinedEntityReactComponent<ContainerProps>>(
  "Titanic.UI.Container"
)!;

export const containerComponentSchema = defineComponentSchema<ContainerProps>({
  kind: "component",
  name: "Container",
  component: Container
});
