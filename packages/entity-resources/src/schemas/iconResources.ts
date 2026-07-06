import { defineIconModuleSchema } from "@titanic/entity-base";
import {
  entityCommonIcons,
  entityCultureIcons,
  entityDataGridRowActionIcons,
  entityDataGridSettingsIcons,
  entityDateInputIcons,
  entityResourceIcons,
  entitySiteShellIcons
} from "../assets/icons";
import { entityResourceModuleNames } from "../model/entityResourcePackageNames";

export const entityResourceIconModuleSchema = defineIconModuleSchema({
  kind: "module",
  name: entityResourceModuleNames.Icons,
  exports: {
    entityCommonIcons,
    entityCultureIcons,
    entityDataGridRowActionIcons,
    entityDataGridSettingsIcons,
    entityDateInputIcons,
    icons: entityResourceIcons,
    entityResourceIcons,
    entitySiteShellIcons
  }
});

export const entityResourceIconSchemas = [
  entityResourceIconModuleSchema
] as const;
