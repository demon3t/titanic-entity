import { defineEnumSchema, Titanic } from "@titanic-entity/entity-base";
import { ConditionOperator } from "../enums/ConditionOperator";
import { EntityAggregationType } from "../enums/EntityAggregationType";
import { EntityApiBatchExecutionMode } from "../enums/EntityApiBatchExecutionMode";
import { EntityApiOperationType } from "../enums/EntityApiOperationType";
import { EntityLogicalOperation } from "../enums/EntityLogicalOperation";
import { EntityOrderDirection } from "../enums/EntityOrderDirection";
import { entityApiEnumNames } from "../models/EntityApiSchemaNames";
import { GridColumnSettingsMode } from "../models/GridColumnSettings";

/** UI package schema for the `ConditionOperator` enum. */
export const conditionOperatorEnumSchema = defineEnumSchema({
  kind: "enum",
  name: entityApiEnumNames.ConditionOperator,
  values: Titanic.Package.toEnumValues(ConditionOperator)
});

/** UI package schema for the `EntityAggregationType` enum. */
export const entityAggregationTypeEnumSchema = defineEnumSchema({
  kind: "enum",
  name: entityApiEnumNames.EntityAggregationType,
  values: Titanic.Package.toEnumValues(EntityAggregationType)
});

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

/** UI package schema for the `EntityLogicalOperation` enum. */
export const entityLogicalOperationEnumSchema = defineEnumSchema({
  kind: "enum",
  name: entityApiEnumNames.EntityLogicalOperation,
  values: Titanic.Package.toEnumValues(EntityLogicalOperation)
});

/** UI package schema for the `EntityOrderDirection` enum. */
export const entityOrderDirectionEnumSchema = defineEnumSchema({
  kind: "enum",
  name: entityApiEnumNames.EntityOrderDirection,
  values: Titanic.Package.toEnumValues(EntityOrderDirection)
});

/** UI package schema for the `GridColumnSettingsMode` enum. */
export const gridColumnSettingsModeEnumSchema = defineEnumSchema({
  kind: "enum",
  name: entityApiEnumNames.GridColumnSettingsMode,
  values: Titanic.Package.toEnumValues(GridColumnSettingsMode)
});

/** Complete list of enum schemas exposed by the `entity-api` package. */
export const entityApiEnumSchemas = [
  conditionOperatorEnumSchema,
  entityAggregationTypeEnumSchema,
  entityApiBatchExecutionModeEnumSchema,
  entityApiOperationTypeEnumSchema,
  entityLogicalOperationEnumSchema,
  entityOrderDirectionEnumSchema,
  gridColumnSettingsModeEnumSchema
] as const;

/** Backward-compatible alias for `entityApiEnumSchemas`. */
export const entityCoreApiEnumSchemas = entityApiEnumSchemas;

/** Backward-compatible alias for `entityApiEnumSchemas`. */
export const entityReactApiEnumSchemas = entityApiEnumSchemas;
