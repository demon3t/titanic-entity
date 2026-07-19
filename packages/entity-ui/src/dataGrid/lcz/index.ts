import { Titanic } from "@titanic-entity/entity-base";
import { entityDataGridEnUsLabels } from "./en-US";
import { entityDataGridRuRuLabels } from "./ru-RU";
import type { EntityDataGridCulture, EntityDataGridLabels } from "./types";

export { entityDataGridEnUsLabels } from "./en-US";
export { entityDataGridRuRuLabels } from "./ru-RU";

/** Built-in EntityDataGrid label resources keyed by culture. */
export const entityDataGridLabelResources = {
  "en-US": entityDataGridEnUsLabels,
  "ru-RU": entityDataGridRuRuLabels
} as const satisfies Record<string, EntityDataGridLabels>;

/** Default culture used when no matching EntityDataGrid labels are registered. */
export const defaultEntityDataGridCulture: EntityDataGridCulture = "ru-RU";

/** Resolves culture aliases like ru, ru_RU and ru-RU to a built-in EntityDataGrid culture. */
export function resolveEntityDataGridCulture(culture: string | null | undefined): EntityDataGridCulture {
  const normalizedCulture = normalizeEntityDataGridCulture(culture);

  if (!normalizedCulture) {
    return defaultEntityDataGridCulture;
  }

  const supportedCultures = Object.keys(entityDataGridLabelResources) as EntityDataGridCulture[];
  const exactCulture = supportedCultures.find((key) => normalizeEntityDataGridCulture(key) === normalizedCulture);

  if (exactCulture) {
    return exactCulture;
  }

  const language = normalizedCulture.split("-")[0];
  const languageCulture = supportedCultures.find((key) => normalizeEntityDataGridCulture(key).split("-")[0] === language);

  return languageCulture ?? defaultEntityDataGridCulture;
}

/** Resolves EntityDataGrid labels from the localization registry or built-in defaults. */
export function getEntityDataGridLabels(culture: string | null | undefined): EntityDataGridLabels {
  const resolvedCulture = resolveEntityDataGridCulture(culture);
  const builtInLabels = entityDataGridLabelResources[resolvedCulture];
  const registeredLabels = Titanic.Localization.group<Partial<EntityDataGridLabels>>("dataGrid", {
    locale: resolvedCulture,
    defaultLocale: resolvedCulture
  });

  if (registeredLabels) {
    return { ...registeredLabels, ...builtInLabels };
  }

  return builtInLabels;
}

function normalizeEntityDataGridCulture(culture: string | null | undefined): string {
  return typeof culture === "string" ? culture.trim().replace(/_/g, "-").toLowerCase() : "";
}

export type { EntityDataGridCulture, EntityDataGridLabels } from "./types";
