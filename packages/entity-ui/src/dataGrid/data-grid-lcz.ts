import { Titanic } from "@titanic-entity/entity-resources";
import "./lcz/en-US";
import "./lcz/ru-RU";
import type { EntityDataGridCulture, EntityDataGridLabels } from "./data-grid-settings";

const entityDataGridSupportedCultures = ["en-US", "ru-RU"] as const satisfies readonly EntityDataGridCulture[];

export const entityDataGridLocalizationSchemaName = "Titanic.UI.DataGrid";
/** Default culture used when no matching DataGrid labels are registered. */
export const defaultEntityDataGridCulture: EntityDataGridCulture = "ru-RU";

/** Resolves culture aliases like ru, ru_RU and ru-RU to a built-in DataGrid culture. */
export function resolveEntityDataGridCulture(culture: string | null | undefined): EntityDataGridCulture {
  const normalizedCulture =
    normalizeEntityDataGridCulture(culture) ||
    normalizeEntityDataGridCulture(Titanic.Localization.getCurrentLocale());

  if (!normalizedCulture) {
    return defaultEntityDataGridCulture;
  }

  const exactCulture = entityDataGridSupportedCultures.find(
    (key) => normalizeEntityDataGridCulture(key) === normalizedCulture
  );

  if (exactCulture) {
    return exactCulture;
  }

  const language = normalizedCulture.split("-")[0];
  const languageCulture = entityDataGridSupportedCultures.find(
    (key) => normalizeEntityDataGridCulture(key).split("-")[0] === language
  );

  return languageCulture ?? defaultEntityDataGridCulture;
}

/** Resolves DataGrid labels from the localization registry and current user locale. */
export function getEntityDataGridLabels(culture: string | null | undefined): EntityDataGridLabels {
  const resolvedCulture = resolveEntityDataGridCulture(culture);

  return Titanic.Localization.forSchema<EntityDataGridLabels>(entityDataGridLocalizationSchemaName, {
    locale: resolvedCulture,
    defaultLocale: defaultEntityDataGridCulture
  });
}

function normalizeEntityDataGridCulture(culture: string | null | undefined): string {
  return typeof culture === "string" ? culture.trim().replace(/_/g, "-").toLowerCase() : "";
}

export type { EntityDataGridCulture, EntityDataGridLabels } from "./data-grid-settings";
