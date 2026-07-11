import { defineEnumSchema, Titanic } from "@titanic-entity/entity-base";
import { EntityFieldKind } from "../entity/enums/EntityFieldKind";
import { EntityJsonEditorMode, EntityJsonValueKind } from "../entity/models/EntityJsonEditorOptions";
import { entityCoreEnumNames } from "../model/entityCorePackageNames";

export const entityFieldKindEnumSchema = defineEnumSchema({
  kind: "enum",
  name: entityCoreEnumNames.EntityFieldKind,
  values: Titanic.Package.toEnumValues(EntityFieldKind)
});

export const entityJsonEditorModeEnumSchema = defineEnumSchema({
  kind: "enum",
  name: entityCoreEnumNames.EntityJsonEditorMode,
  values: Titanic.Package.toEnumValues(EntityJsonEditorMode)
});

export const entityJsonValueKindEnumSchema = defineEnumSchema({
  kind: "enum",
  name: entityCoreEnumNames.EntityJsonValueKind,
  values: Titanic.Package.toEnumValues(EntityJsonValueKind)
});

export const entityCoreEntityEnumSchemas = [
  entityFieldKindEnumSchema,
  entityJsonEditorModeEnumSchema,
  entityJsonValueKindEnumSchema
] as const;
