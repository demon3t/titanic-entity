import { definePackage } from "@titanic-entity/entity-base";
import { titanicEntityCorePackage } from "@titanic-entity/entity-core";
import { entityApiSchemas } from "./schemas";

// Client
export * from "./client/EntityApiClient";
export * from "./client/auth";
export * from "./client/entityHelpers";
export * from "./client/http";

// Enums
export {
  ConditionOperator,
  EntityAggregationType,
  EntityLogicalOperation,
  EntityOrderDirection
} from "@titanic-entity/entity-core";
export * from "./enums/EntityApiBatchExecutionMode";
export * from "./enums/EntityApiOperationType";

// Errors
export * from "./errors/EntityApiError";

// Models
export * from "./models/ApiBatchRequest";
export * from "./models/ApiBatchResponse";
export * from "./models/ApiClientOptions";
export * from "./models/ApiColumnValueResponse";
export * from "./models/ApiDeleteResult";
export * from "./models/ApiEntity";
export * from "./models/ApiManagerStructureResponse";
export * from "./models/ApiOperationResult";
export * from "./models/ApiRequest";
export * from "./models/GridColumnSettings";
export * from "./models/Primitive";
export * from "./models/EntityQueryRequest";
export * from "./models/UserProfile";
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
export * from "./models/EntityUserProfile";
export * from "./models/EntityApiSchemaNames";
export type {
  EntityQuery,
  EntityQueryColumn,
  EntityQueryFilter,
  EntityQueryFilterCollection,
  EntityQueryOrder
} from "@titanic-entity/entity-core";

// Query
export * from "./query";

// Schemas
export * from "./schemas";

// Services
export * from "./services/EntityGridColumnSettingsClient";
export * from "./services/EntityUserProfileClient";

/** Package descriptor for the Entity API client package. */
export const titanicEntityApiPackage = definePackage({
  name: "Titanic.EntityApi",
  version: "0.1.0",
  dependsOn: [
    titanicEntityCorePackage.name
  ],
  schemas: entityApiSchemas
});

export default titanicEntityApiPackage;
