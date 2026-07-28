import { defineComponentSchema } from "@titanic-entity/entity-base";
import type {
  EntityColumnDefinition,
  EntityValues
} from "@titanic-entity/entity-core";
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import type {
  AriaRole,
  CSSProperties,
  MouseEventHandler,
  ReactNode
} from "react";
import "./label";

export type LabelElement = "div" | "span" | "label" | "h1" | "h2" | "h3" | "p" | "strong";

export interface LabelProps {
  as?: LabelElement;
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

export const Label = Titanic.getReactModule<DefinedEntityReactComponent<LabelProps>>(
  "Titanic.UI.Label"
)!;

export const labelComponentSchema = defineComponentSchema<LabelProps>({
  kind: "component",
  name: "Label",
  component: Label
});
