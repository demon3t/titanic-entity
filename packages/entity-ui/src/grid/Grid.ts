import { defineComponentSchema, defineGridSchema } from "@titanic-entity/entity-base";
import { EntityGrid as Grid, type EntityGridProps as GridProps } from "@titanic-entity/entity-react/layout";
import { entityReactComponentNames, entityReactGridNames } from "@titanic-entity/entity-react/model";

export const gridComponentSchema = defineComponentSchema<GridProps>({
  kind: "component",
  name: entityReactComponentNames.EntityGrid,
  component: Grid
});

export const gridSchema = defineGridSchema<GridProps>({
  kind: "grid",
  name: entityReactGridNames.EntityGrid,
  component: Grid
});
