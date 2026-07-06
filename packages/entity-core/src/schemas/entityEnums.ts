import { defineEnumSchema, Titanic } from "@titanic-entity/entity-base";
import { EntityFieldKind } from "../entity/enums/EntityFieldKind";
import { entityCoreEnumNames } from "../model/entityCorePackageNames";

export const entityFieldKindEnumSchema = defineEnumSchema({
  kind: "enum",
  name: entityCoreEnumNames.EntityFieldKind,
  values: Titanic.Package.toEnumValues(EntityFieldKind)
});

export const entityCoreEntityEnumSchemas = [
  entityFieldKindEnumSchema
] as const;
