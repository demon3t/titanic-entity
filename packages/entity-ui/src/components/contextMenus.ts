import { defineComponentSchema } from "@titanic/entity-base";
import {
  EntityDataGridRowContextMenu,
  SiteIconDropdown,
  entityReactComponentNames,
  type EntityDataGridRowContextMenuProps,
  type SiteIconDropdownProps
} from "@titanic/entity-react";

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
