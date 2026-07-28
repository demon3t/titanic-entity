import { Titanic } from "@titanic-entity/entity-resources";
import "./lcz/en-US";
import "./lcz/ru-RU";

export interface LookupInputLabels {
  close?: string;
  emptyText?: string;
  errorText?: string;
  loadingMoreText?: string;
  loadingText?: string;
  noResultsText?: string;
  openList?: string;
  openSearch?: string;
}

export type LookupInputCulture = "en-US" | "ru-RU";
export type LookupInputResolvedLabels = Required<LookupInputLabels>;

export const lookupInputLocalizationSchemaName = "Titanic.UI.LookupInput";
export const defaultLookupInputCulture: LookupInputCulture = "en-US";

export function getLookupInputLabels(culture: string | null | undefined): LookupInputResolvedLabels {
  return Titanic.Localization.forSchema<LookupInputResolvedLabels>(lookupInputLocalizationSchemaName, {
    locale: culture,
    defaultLocale: defaultLookupInputCulture
  });
}

export function getLookupInputLocale(culture: string | null | undefined): string {
  return culture ?? Titanic.Localization.getCurrentLocale();
}
