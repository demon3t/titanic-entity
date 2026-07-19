import { Titanic } from "@titanic-entity/entity-base";
import { timeInputEnUsLabels } from "./en-US";
import { timeInputRuRuLabels } from "./ru-RU";
import type { TimeInputCulture, TimeInputResolvedLabels } from "./types";

export { timeInputEnUsLabels } from "./en-US";
export { timeInputRuRuLabels } from "./ru-RU";

export const timeInputLabelResources = {
  "en-US": timeInputEnUsLabels,
  "ru-RU": timeInputRuRuLabels
} as const satisfies Record<string, TimeInputResolvedLabels>;

export const defaultTimeInputCulture: TimeInputCulture = "en-US";

export function getTimeInputLabels(culture: string | null | undefined): TimeInputResolvedLabels {
  const registeredLabels = Titanic.Localization.group<TimeInputResolvedLabels>("timeInput", {
    locale: culture,
    defaultLocale: defaultTimeInputCulture
  });

  if (registeredLabels) {
    return registeredLabels;
  }

  if (typeof culture === "string" && culture in timeInputLabelResources) {
    return timeInputLabelResources[culture as keyof typeof timeInputLabelResources];
  }

  return timeInputLabelResources[defaultTimeInputCulture];
}

export type { TimeInputCulture, TimeInputLabels, TimeInputResolvedLabels } from "./types";
