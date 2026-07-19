import { defineComponentSchema } from "@titanic-entity/entity-base";
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import "./label";
import type { EntityLabelProps } from "./label-props";

export type {
  EntityLabelElement,
  EntityLabelProps
} from "./label-props";

export const EntityLabel = Titanic.getReactModule<DefinedEntityReactComponent<EntityLabelProps>>(
  "Titanic.UI.EntityLabel"
)!;

export const labelComponentSchema = defineComponentSchema<EntityLabelProps>({
  kind: "component",
  name: "EntityLabel",
  component: EntityLabel
});
