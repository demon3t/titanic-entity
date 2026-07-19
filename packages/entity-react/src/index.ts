import { definePackage } from "@titanic-entity/entity-base";
import {
  createEntityRecordQuery,
  titanicEntityCorePackage,
  toEntityDisplayValues,
  toEntityValues
} from "@titanic-entity/entity-core";
import {
  EntityOrderDirection,
  entityQuery,
  getEntityValue,
  titanicEntityApiPackage,
  toEntityQueryJson
} from "@titanic-entity/entity-api";
import { titanicEntityResourcesPackage } from "@titanic-entity/entity-resources";
import { titanicEntityIconsPackage } from "@titanic-entity/entity-icons";
import { useEntityEditPageController } from "./headless/entityEditPageState";
import { useOptionalEntityApiClient } from "./react/EntityApiProvider";
import { entityReactEntitySchemas, entityReactEnumSchemas, entityReactSchemas } from "./schemas";
import { Titanic } from "./templates/entityTemplateDsl";

export * from "@titanic-entity/entity-base";
export * from "@titanic-entity/entity-api";
export * from "@titanic-entity/entity-core";
export * from "@titanic-entity/entity-resources";
export * from "@titanic-entity/entity-icons";
export { Titanic };
export {
  entityReactEntitySchemas,
  entityReactEnumSchemas
};

Object.assign(Titanic, {
  EntityCore: {
    ...((Titanic as any).EntityCore ?? {}),
    createEntityRecordQuery,
    toEntityDisplayValues,
    toEntityValues
  },
  EntityApi: {
    ...((Titanic as any).EntityApi ?? {}),
    EntityOrderDirection,
    entityQuery,
    getEntityValue,
    toEntityQueryJson
  },
  EntityReact: {
    ...((Titanic as any).EntityReact ?? {}),
    useEntityEditPageController,
    useOptionalEntityApiClient
  }
});

// React API
export * from "./react/EntityApiProvider";
export * from "./react/hooks";
export * from "./react/models/AsyncState";
export * from "./react/models/EntityApiProviderProps";
export * from "./react/models/UseEntityQueryOptions";

// Headless
export * from "./headless";

// Templates
export * from "./templates";

// Schemas
export * from "./schemas";

// System
export * from "./system";

// Package
export * from "./model";

export const titanicEntityReactUiPackage = definePackage({
  name: "Titanic.EntityReact",
  version: "0.1.0",
  dependsOn: [
    titanicEntityCorePackage.name,
    titanicEntityApiPackage.name,
    titanicEntityResourcesPackage.name,
    titanicEntityIconsPackage.name
  ],
  schemas: entityReactSchemas
});

export default titanicEntityReactUiPackage;
