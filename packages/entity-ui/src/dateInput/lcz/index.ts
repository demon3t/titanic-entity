import { Titanic } from "@titanic-entity/entity-base";
import { dateInputEnUsLabels } from "./en-US";
import { dateInputRuRuLabels } from "./ru-RU";
import type { DateInputCulture, DateInputResolvedLabels } from "./types";

export { dateInputEnUsLabels } from "./en-US";
export { dateInputRuRuLabels } from "./ru-RU";

export const dateInputLabelResources = {
  "en-US": dateInputEnUsLabels,
  "ru-RU": dateInputRuRuLabels
} as const satisfies Record<string, DateInputResolvedLabels>;

export const defaultDateInputCulture: DateInputCulture = "en-US";

export function getDateInputLabels(culture: string | null | undefined): DateInputResolvedLabels {
  const registeredLabels = Titanic.Localization.group<DateInputResolvedLabels>("dateInput", {
    locale: culture,
    defaultLocale: defaultDateInputCulture
  });

  if (registeredLabels) {
    return registeredLabels;
  }

  if (typeof culture === "string" && culture in dateInputLabelResources) {
    return dateInputLabelResources[culture as keyof typeof dateInputLabelResources];
  }

  return dateInputLabelResources[defaultDateInputCulture];
}

export type { DateInputCulture, DateInputLabels, DateInputResolvedLabels } from "./types";
