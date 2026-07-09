import { defineIconResources } from "@titanic-entity/entity-base";
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

/**
 * Describes all icon resources shipped by @titanic-entity/entity-resources.
 */
export const entityResourceIconModuleSchema = defineIconResources({
  name: entityResourceModuleNames.Icons,
  icons: entityResourceIcons,
  exports: {
    entityCommonIcons,
    entityCultureIcons,
    entityDataGridRowActionIcons,
    entityDataGridSettingsIcons,
    entityDateInputIcons,
    entityResourceIcons,
    entitySiteShellIcons
  }
});

/**
 * Lists resource schemas exported by the entity resources package.
 */
export const entityResourceIconSchemas = [
  entityResourceIconModuleSchema
] as const;
