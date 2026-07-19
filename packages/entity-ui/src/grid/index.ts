import { defineComponentSchema, defineGridSchema } from "@titanic-entity/entity-base";
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import { entityReactComponentNames, entityReactGridNames } from "@titanic-entity/entity-react/model";
import "./grid";
import type { EntityGridProps } from "./grid-props";

export type { EntityGridProps } from "./grid-props";

export const EntityGrid = Titanic.getReactModule<DefinedEntityReactComponent<EntityGridProps>>(
  "Titanic.UI.EntityGrid"
)!;

export const gridComponentSchema = defineComponentSchema<EntityGridProps>({
  kind: "component",
  name: entityReactComponentNames.EntityGrid,
  component: EntityGrid
});

export const gridSchema = defineGridSchema<EntityGridProps>({
  kind: "grid",
  name: entityReactGridNames.EntityGrid,
  component: EntityGrid
});

export * from "./icons";
export * from "./lcz";
