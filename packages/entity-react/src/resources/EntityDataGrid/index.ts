import type { EntityDataGridCulture, EntityDataGridLabels } from "./types";
import { entityDataGridEnUsLabels } from "./en-US";
import { entityDataGridRuRuLabels } from "./ru-RU";

export const entityDataGridLabelResources = {
  "en-US": entityDataGridEnUsLabels,
  "ru-RU": entityDataGridRuRuLabels
} as const satisfies Record<string, EntityDataGridLabels>;

export const defaultEntityDataGridCulture: EntityDataGridCulture = "en-US";

export function getEntityDataGridLabels(culture: string | null | undefined): EntityDataGridLabels {
  if (!culture) {
    return entityDataGridEnUsLabels;
  }

  const directMatch = entityDataGridLabelResources[culture as keyof typeof entityDataGridLabelResources];
  if (directMatch) {
    return directMatch;
  }

  const normalizedCulture = culture.trim().toLowerCase();
  const fallbackCulture = (Object.keys(entityDataGridLabelResources) as EntityDataGridCulture[]).find((value) =>
    value.toLowerCase().startsWith(normalizedCulture)
  );

  return fallbackCulture ? entityDataGridLabelResources[fallbackCulture] : entityDataGridEnUsLabels;
}

export type { EntityDataGridCulture, EntityDataGridLabels } from "./types";
export { entityDataGridEnUsLabels, entityDataGridRuRuLabels };
