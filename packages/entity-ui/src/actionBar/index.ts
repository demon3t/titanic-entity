import { defineComponentSchema } from "@titanic-entity/entity-base";
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";
import type { CSSProperties, ReactNode } from "react";
import "./action-bar";

export type ActionBarAlign = "start" | "center" | "end";
export type ActionBarVariant = "default" | "glass";

export interface ActionBarProps {
  align?: ActionBarAlign;
  ariaLabel?: string;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  sticky?: boolean;
  style?: CSSProperties;
  variant?: ActionBarVariant;
  visible?: boolean;
}

export const ActionBar = Titanic.getReactModule<DefinedEntityReactComponent<ActionBarProps>>(
  "Titanic.UI.ActionBar"
)!;

export const actionBarComponentSchema = defineComponentSchema<ActionBarProps>({
  kind: "component",
  name: entityReactComponentNames.ActionBar,
  component: ActionBar
});
