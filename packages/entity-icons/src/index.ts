import { definePackage } from "@titanic-entity/entity-base";
import { titanicEntityResourcesPackage } from "@titanic-entity/entity-resources";
import { entityIconSchemas } from "./schemas";

export * from "./assets";
export * from "./icons";
export * from "./model";
export * from "./schemas";

export const titanicEntityIconsPackage = definePackage({
  name: "Titanic.EntityIcons",
  version: "0.1.0",
  dependsOn: [
    titanicEntityResourcesPackage.name
  ],
  schemas: entityIconSchemas
});

export default titanicEntityIconsPackage;
