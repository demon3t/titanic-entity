import { defineEnumSchema, Titanic } from "@titanic-entity/entity-base";
import { ConditionOperator } from "../entity/enums/ConditionOperator";
import { EntityColumnKind } from "../entity/enums/EntityColumnKind";
import { EntityFieldKind } from "../entity/enums/EntityFieldKind";
import { EntityAggregationType } from "../entity/enums/EntityAggregationType";
import { EntityLogicalOperation } from "../entity/enums/EntityLogicalOperation";
import { EntityOrderDirection } from "../entity/enums/EntityOrderDirection";
import { entityCoreEnumNames } from "../model/entityCorePackageNames";

export const conditionOperatorEnumSchema = defineEnumSchema({
  kind: "enum",
  name: entityCoreEnumNames.ConditionOperator,
  values: Titanic.Package.toEnumValues(ConditionOperator)
});

export const entityColumnKindEnumSchema = defineEnumSchema({
  kind: "enum",
  name: entityCoreEnumNames.EntityColumnKind,
  values: Titanic.Package.toEnumValues(EntityColumnKind)
});

export const entityFieldKindEnumSchema = defineEnumSchema({
  kind: "enum",
  name: entityCoreEnumNames.EntityFieldKind,
  values: Titanic.Package.toEnumValues(EntityFieldKind)
});

export const entityAggregationTypeEnumSchema = defineEnumSchema({
  kind: "enum",
  name: entityCoreEnumNames.EntityAggregationType,
  values: Titanic.Package.toEnumValues(EntityAggregationType)
});

export const entityLogicalOperationEnumSchema = defineEnumSchema({
  kind: "enum",
  name: entityCoreEnumNames.EntityLogicalOperation,
  values: Titanic.Package.toEnumValues(EntityLogicalOperation)
});

export const entityOrderDirectionEnumSchema = defineEnumSchema({
  kind: "enum",
  name: entityCoreEnumNames.EntityOrderDirection,
  values: Titanic.Package.toEnumValues(EntityOrderDirection)
});

export const entityCoreEntityEnumSchemas = [
  conditionOperatorEnumSchema,
  entityColumnKindEnumSchema,
  entityFieldKindEnumSchema,
  entityAggregationTypeEnumSchema,
  entityLogicalOperationEnumSchema,
  entityOrderDirectionEnumSchema
] as const;
