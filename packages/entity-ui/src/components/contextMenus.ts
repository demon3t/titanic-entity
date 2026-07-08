import { defineComponentSchema } from "@titanic-entity/entity-base";
import {
  EntityDataGridRowContextMenu,
  SiteIconDropdown,
  type EntityDataGridRowContextMenuProps,
  type SiteIconDropdownProps
} from "@titanic-entity/entity-react/components";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";

export const siteIconDropdownComponentSchema = defineComponentSchema<SiteIconDropdownProps>({
  kind: "component",
  name: entityReactComponentNames.SiteIconDropdown,
  component: SiteIconDropdown
});

export const entityDataGridRowContextMenuComponentSchema = defineComponentSchema<EntityDataGridRowContextMenuProps<any>>({
  kind: "component",
  name: entityReactComponentNames.EntityDataGridRowContextMenu,
  component: EntityDataGridRowContextMenu
});

export const entityUiContextMenuComponentSchemas = [
  siteIconDropdownComponentSchema,
  entityDataGridRowContextMenuComponentSchema
] as const;
