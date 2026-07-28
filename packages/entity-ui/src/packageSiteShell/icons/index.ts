import { defineIconModuleSchema } from "@titanic-entity/entity-base";
import { titanicCultureIcons, titanicSiteShellIcons } from "@titanic-entity/entity-icons";

export { titanicCultureIcons, titanicSiteShellIcons } from "@titanic-entity/entity-icons";

export const titanicPackageSiteShellIconGroups = {
  cultures: titanicCultureIcons,
  siteShell: titanicSiteShellIcons
} as const;

export const packageSiteShellIconModuleSchema = defineIconModuleSchema({
  name: "Titanic.UI.PackageSiteShell.Icons",
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
