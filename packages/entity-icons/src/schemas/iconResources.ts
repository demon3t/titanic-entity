import { defineIconResources } from "@titanic-entity/entity-base";
import { entityIcons } from "../assets/icons";
import { entityIconModuleNames } from "../model/entityIconPackageNames";

/** Describes the icon collection shipped by @titanic-entity/entity-icons. */
export const entityIconModuleSchema = defineIconResources({
  name: entityIconModuleNames.Icons,
  icons: entityIcons,
  exports: {
    entityIcons
  }
});

/** Lists icon schemas exported by the entity icons package. */
export const entityIconSchemas = [
  entityIconModuleSchema
] as const;
