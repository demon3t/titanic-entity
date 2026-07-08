import { defineComponentSchema } from "@titanic-entity/entity-base";
import { ResourceSvgIcon, type ResourceSvgIconProps } from "@titanic-entity/entity-react/components";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";

export const resourceSvgIconComponentSchema = defineComponentSchema<ResourceSvgIconProps>({
  kind: "component",
  name: entityReactComponentNames.ResourceSvgIcon,
  component: ResourceSvgIcon
});

export const entityUiIconComponentSchemas = [
  resourceSvgIconComponentSchema
] as const;
