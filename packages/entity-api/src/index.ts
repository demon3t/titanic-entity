import { definePackage } from "@titanic/entity-base";
import { entityApiSchemas } from "./schemas";

// Client
export * from "./client/EntityApiClient";
export * from "./client/auth";
export * from "./client/entityHelpers";
export * from "./client/http";

// Enums
export * from "./enums/ConditionOperator";
export * from "./enums/EntityAggregationType";
export * from "./enums/EntityApiBatchExecutionMode";
export * from "./enums/EntityApiOperationType";
export * from "./enums/EntityLogicalOperation";
export * from "./enums/EntityOrderDirection";

// Errors
export * from "./errors/EntityApiError";

// Models
export * from "./models/EntityApiBatchRequest";
export * from "./models/EntityApiBatchResponse";
export * from "./models/EntityApiClientOptions";
export * from "./models/EntityApiColumnValueResponse";
export * from "./models/EntityApiDeleteResult";
export * from "./models/EntityApiEntity";
export * from "./models/EntityApiManagerStructureResponse";
export * from "./models/EntityApiOperationResult";
export * from "./models/EntityApiRequest";
export * from "./models/EntityGridColumnSettings";
export * from "./models/EntityPrimitive";
export * from "./models/EntitySelectRequest";
export * from "./models/EntityUserProfile";
export * from "./models/ESQColumnJsonModel";
export * from "./models/ESQFilterCollectionJsonModel";
export * from "./models/ESQFilterJsonModel";
export * from "./models/ESQJsonModel";
export * from "./models/ESQOrderJsonModel";

// Query
export * from "./query";

// Schemas
export * from "./schemas";

// Services
export * from "./services/EntityGridColumnSettingsClient";
export * from "./services/EntityUserProfileClient";

// Package
export * from "./models/entityApiPackageNames";

export const titanicEntityApiPackage = definePackage({
  name: "Titanic.EntityApi",
  version: "0.1.0",
  schemas: entityApiSchemas
});

export default titanicEntityApiPackage;
