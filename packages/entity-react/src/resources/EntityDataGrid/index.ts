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
export const defaultEntityDataGridCulture: EntityDataGridCulture = "en-US";

/** Resolves EntityDataGrid labels from the localization registry or built-in defaults. */
export function getEntityDataGridLabels(culture: string | null | undefined): EntityDataGridLabels {
  const registeredLabels = Titanic.Localization.group<EntityDataGridLabels>("dataGrid", {
    locale: culture,
    defaultLocale: defaultEntityDataGridCulture
  });

  if (registeredLabels) {
    return registeredLabels;
  }

  if (typeof culture === "string" && culture in entityDataGridLabelResources) {
    return entityDataGridLabelResources[culture as keyof typeof entityDataGridLabelResources];
  }

  return entityDataGridLabelResources[defaultEntityDataGridCulture];
}

export type { EntityDataGridCulture, EntityDataGridLabels } from "./types";
