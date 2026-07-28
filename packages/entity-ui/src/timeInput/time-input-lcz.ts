import { Titanic } from "@titanic-entity/entity-resources";
import "./lcz/en-US";
import "./lcz/ru-RU";

export interface TimeInputLabels {
  clear?: string;
  hour?: string;
  minute?: string;
  now?: string;
  placeholder?: string;
  selectedTime?: string;
  title?: string;
}

export type TimeInputCulture = "en-US" | "ru-RU";
export type TimeInputResolvedLabels = Required<TimeInputLabels>;

export const timeInputLocalizationSchemaName = "Titanic.UI.TimeInput";
export const defaultTimeInputCulture: TimeInputCulture = "en-US";

export function getTimeInputLabels(culture: string | null | undefined): TimeInputResolvedLabels {
  return Titanic.Localization.forSchema<TimeInputResolvedLabels>(timeInputLocalizationSchemaName, {
    locale: culture,
    defaultLocale: defaultTimeInputCulture
  });
}

export function getTimeInputLocale(culture: string | null | undefined): string {
  return culture ?? Titanic.Localization.getCurrentLocale();
}
