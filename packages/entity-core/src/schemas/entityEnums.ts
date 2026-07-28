import { defineEnumSchema, Titanic } from "@titanic-entity/entity-base";
import { EntityColumnKind } from "../entity/enums/EntityColumnKind";
import { EntityFieldKind } from "../entity/enums/EntityFieldKind";
import { entityCoreEnumNames } from "../model/entityCorePackageNames";

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

export const entityCoreEntityEnumSchemas = [
  entityColumnKindEnumSchema,
  entityFieldKindEnumSchema
] as const;
