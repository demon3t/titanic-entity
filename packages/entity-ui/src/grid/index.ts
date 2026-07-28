import { defineComponentSchema, defineGridSchema } from "@titanic-entity/entity-base";
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import { entityReactComponentNames, entityReactGridNames } from "@titanic-entity/entity-react/model";
import type {
  AriaRole,
  CSSProperties,
  MouseEventHandler,
  ReactNode
} from "react";
import "./grid";

export interface GridProps {
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

export const Grid = Titanic.getReactModule<DefinedEntityReactComponent<GridProps>>(
  "Titanic.UI.Grid"
)!;

export const gridComponentSchema = defineComponentSchema<GridProps>({
  kind: "component",
  name: entityReactComponentNames.Grid,
  component: Grid
});

export const gridSchema = defineGridSchema<GridProps>({
  kind: "grid",
  name: entityReactGridNames.Grid,
  component: Grid
});
