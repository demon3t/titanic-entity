import { defineComponentSchema } from "@titanic-entity/entity-base";
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import "./container";
import type { EntityContainerProps } from "./container-props";

export type {
  EntityContainerProps,
  EntityContainerRef
} from "./container-props";

export const EntityContainer = Titanic.getReactModule<DefinedEntityReactComponent<EntityContainerProps>>(
  "Titanic.UI.EntityContainer"
)!;

export const containerComponentSchema = defineComponentSchema<EntityContainerProps>({
  kind: "component",
  name: "EntityContainer",
  component: EntityContainer
});
