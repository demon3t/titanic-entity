import { defineComponentSchema } from "@titanic/entity-base";
import { ResourceSvgIcon, entityReactComponentNames, type ResourceSvgIconProps } from "@titanic/entity-react";

export const resourceSvgIconComponentSchema = defineComponentSchema<ResourceSvgIconProps>({
  kind: "component",
  name: entityReactComponentNames.ResourceSvgIcon,
  component: ResourceSvgIcon
});

export const entityUiIconComponentSchemas = [
  resourceSvgIconComponentSchema
] as const;
