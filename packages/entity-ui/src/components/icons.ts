import { defineComponentSchema } from "@titanic-entity/entity-base";
import { ResourceSvgIcon, entityReactComponentNames, type ResourceSvgIconProps } from "@titanic-entity/entity-react";

export const resourceSvgIconComponentSchema = defineComponentSchema<ResourceSvgIconProps>({
  kind: "component",
  name: entityReactComponentNames.ResourceSvgIcon,
  component: ResourceSvgIcon
});

export const entityUiIconComponentSchemas = [
  resourceSvgIconComponentSchema
] as const;
