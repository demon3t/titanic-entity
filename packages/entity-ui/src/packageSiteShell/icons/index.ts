import { defineIconModuleSchema } from "@titanic-entity/entity-base";
import { titanicCultureIcons, titanicSiteShellIcons } from "@titanic-entity/entity-react/components";

export { titanicCultureIcons, titanicSiteShellIcons } from "@titanic-entity/entity-react/components";

export const titanicPackageSiteShellIconGroups = {
  cultures: titanicCultureIcons,
  siteShell: titanicSiteShellIcons
} as const;

export const packageSiteShellIconModuleSchema = defineIconModuleSchema({
  name: "Titanic.EntityUi.PackageSiteShell.Icons",
  exports: {
    icons: titanicPackageSiteShellIconGroups,
    titanicCultureIcons,
    titanicPackageSiteShellIconGroups,
    titanicSiteShellIcons
  }
});

export const packageSiteShellIconSchemas = [
  packageSiteShellIconModuleSchema
] as const;
