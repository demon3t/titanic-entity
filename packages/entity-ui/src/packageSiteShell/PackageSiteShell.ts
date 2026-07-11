import { defineComponentSchema } from "@titanic-entity/entity-base";
import { PackageSiteShell, type PackageSiteShellProps } from "@titanic-entity/entity-react/layout";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";

export const packageSiteShellComponentSchema = defineComponentSchema<PackageSiteShellProps>({
  kind: "component",
  name: entityReactComponentNames.PackageSiteShell,
  component: PackageSiteShell
});
