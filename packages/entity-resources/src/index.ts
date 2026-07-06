import { definePackage } from "@titanic/entity-base";
import { entityResourceSchemas } from "./schemas";

// Assets
export * from "./assets/icons";
export * from "./assets/media";

// Schemas
export * from "./schemas";

// Package
export * from "./model/entityResourcePackageNames";

export const titanicEntityResourcesPackage = definePackage({
  name: "Titanic.EntityResources",
  version: "0.1.0",
  schemas: entityResourceSchemas
});

export default titanicEntityResourcesPackage;
