import { defineIconResources } from "@titanic-entity/entity-base";
import {
  entityIconCollections,
  titanicCommonIcons,
  titanicCultureIcons,
  titanicDataGridRowActionIcons,
  titanicDataGridSettingsIcons,
  titanicDateInputIcons,
  titanicSiteShellIcons,
  titanicUiIcons
} from "../assets/icons";
import { entityIconModuleNames } from "../model/entityIconPackageNames";

export const entityIconModuleSchema = defineIconResources({
  name: entityIconModuleNames.Icons,
  icons: entityIconCollections,
  exports: {
    entityIconCollections,
    titanicCommonIcons,
    titanicCultureIcons,
    titanicDataGridRowActionIcons,
    titanicDataGridSettingsIcons,
    titanicDateInputIcons,
    titanicSiteShellIcons,
    titanicUiIcons
  }
});

export const entityIconSchemas = [
  entityIconModuleSchema
] as const;
