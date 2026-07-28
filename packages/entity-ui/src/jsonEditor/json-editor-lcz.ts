import type { EntityJsonEditorLabels } from "@titanic-entity/entity-core";
import { Titanic } from "@titanic-entity/entity-resources";
import "./lcz/en-US";
import "./lcz/ru-RU";

export type EntityJsonEditorCulture = "en-US" | "ru-RU";
export type EntityJsonEditorResolvedLabels = Required<EntityJsonEditorLabels>;

export const entityJsonEditorLocalizationSchemaName = "Titanic.UI.EntityJsonEditor";
export const defaultEntityJsonEditorCulture: EntityJsonEditorCulture = "en-US";

export function getEntityJsonEditorLabels(culture: string | null | undefined): EntityJsonEditorResolvedLabels {
  return Titanic.Localization.forSchema<EntityJsonEditorResolvedLabels>(entityJsonEditorLocalizationSchemaName, {
    locale: culture,
    defaultLocale: defaultEntityJsonEditorCulture
  });
}

export function getEntityJsonEditorLocale(culture: string | null | undefined): string {
  return culture ?? Titanic.Localization.getCurrentLocale();
}

export type {
  EntityJsonEditorLabels
};
