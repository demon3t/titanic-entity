import { definePackage } from "@titanic-entity/entity-base";
import { entityCoreSchemas } from "./schemas";

// Entity
export * from "./entity/api";
export * from "./entity/Column";
export * from "./entity/EntityModel";
export * from "./entity/filters";
export * from "./entity/schema";
export * from "./entity/systemEntities";

// Entity columns
export * from "./entity/columns/BooleanColumn";
export * from "./entity/columns/ColumnSubscriber";
export * from "./entity/columns/EntityColumn";
export * from "./entity/columns/LookupColumn";
export * from "./entity/columns/NumberColumn";
export * from "./entity/columns/StringColumn";

// Entity enums
export * from "./entity/enums/EntityFieldKind";

// Entity models
export * from "./entity/models/EntityColumnSchema";
export * from "./entity/models/EntityDisplayValues";
export * from "./entity/models/EntityJsonEditorOptions";
export * from "./entity/models/EntityLookupOptionsSource";
export * from "./entity/models/EntitySchema";
export * from "./entity/models/EntityValues";
export * from "./entity/models/LookupOption";
export * from "./entity/models/ReferenceValue";

// Schemas
export * from "./schemas";

// Package
export * from "./model/entityCorePackageNames";

export const titanicEntityPackage = definePackage({
  name: "Titanic.Entity",
  version: "0.1.0",
  schemas: entityCoreSchemas
});

export const titanicEntityCorePackage = titanicEntityPackage;

export default titanicEntityPackage;
