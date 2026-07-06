import { defineEnumSchema, Titanic } from "@titanic/entity-base";
import { ConditionOperator } from "../enums/ConditionOperator";
import { EntityAggregationType } from "../enums/EntityAggregationType";
import { EntityApiBatchExecutionMode } from "../enums/EntityApiBatchExecutionMode";
import { EntityApiOperationType } from "../enums/EntityApiOperationType";
import { EntityLogicalOperation } from "../enums/EntityLogicalOperation";
import { EntityOrderDirection } from "../enums/EntityOrderDirection";
import { entityApiEnumNames } from "../models/entityApiPackageNames";

export const conditionOperatorEnumSchema = defineEnumSchema({
  kind: "enum",
  name: entityApiEnumNames.ConditionOperator,
  values: Titanic.Package.toEnumValues(ConditionOperator)
});

export const entityAggregationTypeEnumSchema = defineEnumSchema({
  kind: "enum",
  name: entityApiEnumNames.EntityAggregationType,
  values: Titanic.Package.toEnumValues(EntityAggregationType)
});

export const entityApiBatchExecutionModeEnumSchema = defineEnumSchema({
  kind: "enum",
  name: entityApiEnumNames.EntityApiBatchExecutionMode,
  values: Titanic.Package.toEnumValues(EntityApiBatchExecutionMode)
});

export const entityApiOperationTypeEnumSchema = defineEnumSchema({
  kind: "enum",
  name: entityApiEnumNames.EntityApiOperationType,
  values: Titanic.Package.toEnumValues(EntityApiOperationType)
});

export const entityLogicalOperationEnumSchema = defineEnumSchema({
  kind: "enum",
  name: entityApiEnumNames.EntityLogicalOperation,
  values: Titanic.Package.toEnumValues(EntityLogicalOperation)
});

export const entityOrderDirectionEnumSchema = defineEnumSchema({
  kind: "enum",
  name: entityApiEnumNames.EntityOrderDirection,
  values: Titanic.Package.toEnumValues(EntityOrderDirection)
});

export const entityApiEnumSchemas = [
  conditionOperatorEnumSchema,
  entityAggregationTypeEnumSchema,
  entityApiBatchExecutionModeEnumSchema,
  entityApiOperationTypeEnumSchema,
  entityLogicalOperationEnumSchema,
  entityOrderDirectionEnumSchema
] as const;

export const entityCoreApiEnumSchemas = entityApiEnumSchemas;
export const entityReactApiEnumSchemas = entityApiEnumSchemas;
