import { definePackage } from "@titanic-entity/entity-base";
import {
  entityReactEntitySchemas,
  entityReactEnumSchemas,
  titanicEntityCorePackage
} from "@titanic-entity/entity-core";
import { titanicEntityApiPackage } from "@titanic-entity/entity-api";
import { titanicEntityResourcesPackage } from "@titanic-entity/entity-resources";
import { entityReactSchemas } from "./schemas";

export * from "@titanic-entity/entity-base";
export * from "@titanic-entity/entity-api";
export * from "@titanic-entity/entity-core";
export * from "@titanic-entity/entity-resources";
export {
  entityReactEntitySchemas,
  entityReactEnumSchemas
};

export * from "./headless";
export * from "./components";
export * from "./fields";
export * from "./grids";
export * from "./layout";
export * from "./templates";
export * from "./resources";
export * from "./schemas";
export * from "./system";
export { entityReactEnumNames } from "./model";

export const titanicEntityReactUiPackage = definePackage({
  name: "Titanic.EntityReact",
  version: "0.1.0",
  dependsOn: [
    titanicEntityCorePackage.name,
    titanicEntityApiPackage.name,
    titanicEntityResourcesPackage.name
  ],
  schemas: entityReactSchemas
});

export default titanicEntityReactUiPackage;
