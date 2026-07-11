import { defineIconResources } from "@titanic-entity/entity-base";
import { entityResourceIcons } from "../assets/icons";
import { entityResourceModuleNames } from "../model/entityResourcePackageNames";

/**
 * Describes all icon resources shipped by @titanic-entity/entity-resources.
 */
export const entityResourceIconModuleSchema = defineIconResources({
  name: entityResourceModuleNames.Icons,
  icons: entityResourceIcons,
  exports: {
    entityResourceIcons
  }
});

/**
 * Lists resource schemas exported by the entity resources package.
 */
export const entityResourceIconSchemas = [
  entityResourceIconModuleSchema
] as const;
