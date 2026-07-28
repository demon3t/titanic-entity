import { Titanic } from "@titanic-entity/entity-resources";
import "./lcz/en-US";
import "./lcz/ru-RU";

export interface EditPageLabels {
  back?: string;
  cancel?: string;
  delete?: string;
  submit?: string;
}

export type EditPageCulture = "en-US" | "ru-RU";
export type EditPageResolvedLabels = Required<EditPageLabels>;

export const editPageLocalizationSchemaName = "Titanic.UI.BasePage";
export const defaultEditPageCulture: EditPageCulture = "en-US";

export function getEditPageLabels(culture: string | null | undefined): EditPageResolvedLabels {
  return Titanic.Localization.forSchema<EditPageResolvedLabels>(editPageLocalizationSchemaName, {
    locale: culture,
    defaultLocale: defaultEditPageCulture
  });
}

export function getEditPageLocale(culture: string | null | undefined): string {
  return culture ?? Titanic.Localization.getCurrentLocale();
}
