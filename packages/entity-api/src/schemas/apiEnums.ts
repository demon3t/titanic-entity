import { defineEnumSchema, Titanic } from "@titanic-entity/entity-base";
import { EntityApiBatchExecutionMode } from "../enums/EntityApiBatchExecutionMode";
import { EntityApiOperationType } from "../enums/EntityApiOperationType";
import { entityApiEnumNames } from "../models/EntityApiSchemaNames";

export {
  conditionOperatorEnumSchema,
  entityAggregationTypeEnumSchema,
  entityLogicalOperationEnumSchema,
  entityOrderDirectionEnumSchema
} from "@titanic-entity/entity-core";

/** UI package schema for the `EntityApiBatchExecutionMode` enum. */
export const entityApiBatchExecutionModeEnumSchema = defineEnumSchema({
  kind: "enum",
  name: entityApiEnumNames.EntityApiBatchExecutionMode,
  values: Titanic.Package.toEnumValues(EntityApiBatchExecutionMode)
});

/** UI package schema for the `EntityApiOperationType` enum. */
export const entityApiOperationTypeEnumSchema = defineEnumSchema({
  kind: "enum",
  name: entityApiEnumNames.EntityApiOperationType,
  values: Titanic.Package.toEnumValues(EntityApiOperationType)
});

/** Complete list of enum schemas exposed by the `entity-api` package. */
export const entityApiEnumSchemas = [
  entityApiBatchExecutionModeEnumSchema,
  entityApiOperationTypeEnumSchema
] as const;

/** Backward-compatible alias for `entityApiEnumSchemas`. */
export const entityCoreApiEnumSchemas = entityApiEnumSchemas;

/** Backward-compatible alias for `entityApiEnumSchemas`. */
export const entityReactApiEnumSchemas = entityApiEnumSchemas;
