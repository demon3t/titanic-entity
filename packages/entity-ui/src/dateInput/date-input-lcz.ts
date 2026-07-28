import { Titanic } from "@titanic-entity/entity-resources";
import "./lcz/en-US";
import "./lcz/ru-RU";

export interface DateInputLabels {
  clear?: string;
  days?: string;
  month?: string;
  nextMonth?: string;
  placeholder?: string;
  previousMonth?: string;
  selectedDate?: string;
  today?: string;
  weekdays?: readonly string[];
  year?: string;
}

export type DateInputCulture = "en-US" | "ru-RU";

export type DateInputResolvedLabels = Required<Omit<DateInputLabels, "weekdays">> & {
  weekdays?: readonly string[];
};

export const dateInputLocalizationSchemaName = "Titanic.UI.DateInput";
export const defaultDateInputCulture: DateInputCulture = "en-US";

export function getDateInputLabels(culture: string | null | undefined): DateInputResolvedLabels {
  return Titanic.Localization.forSchema<DateInputResolvedLabels>(dateInputLocalizationSchemaName, {
    locale: culture,
    defaultLocale: defaultDateInputCulture
  });
}

export function getDateInputLocale(culture: string | null | undefined): string {
  return culture ?? Titanic.Localization.getCurrentLocale();
}
