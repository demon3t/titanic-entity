import { definePackage } from "@titanic-entity/entity-base";
import { entityResourceSchemas } from "./schemas";

// Assets
export * from "./assets";
export * from "./icons";
export * from "./media";
export * from "./localization";

// Schemas
export * from "./schemas";

// Package
export * from "./model";
export * from "./resource-context";

export const titanicEntityResourcesPackage = definePackage({
  name: "Titanic.EntityResources",
  version: "0.1.0",
  schemas: entityResourceSchemas
});

export default titanicEntityResourcesPackage;
