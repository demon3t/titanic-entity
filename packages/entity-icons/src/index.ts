import { definePackage } from "@titanic-entity/entity-base";
import { entityIconPackageNames } from "./model/entityIconPackageNames";
import { entityIconSchemas } from "./schemas";

// Assets
export * from "./assets";
export * from "./icons";

// Schemas
export * from "./schemas";

// Package
export * from "./model";

export const titanicEntityIconsPackage = definePackage({
  name: entityIconPackageNames.Package,
  version: "0.1.0",
  dependsOn: ["Titanic.EntityResources"],
  schemas: entityIconSchemas
});

export default titanicEntityIconsPackage;
