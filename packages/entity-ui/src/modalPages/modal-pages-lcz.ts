import { Titanic } from "@titanic-entity/entity-resources";
import "./lcz/en-US";
import "./lcz/ru-RU";

export interface ModalPageLabels {
  alertTitle?: string;
  approvalTitle?: string;
  approve?: string;
  cancel?: string;
  close?: string;
  ok?: string;
}

export type ModalPageCulture = "en-US" | "ru-RU";
export type ModalPageResolvedLabels = Required<ModalPageLabels>;

export const modalPagesLocalizationSchemaName = "Titanic.UI.ModalPages";
export const defaultModalPageCulture: ModalPageCulture = "en-US";

export function getModalPageLabels(culture: string | null | undefined): ModalPageResolvedLabels {
  return Titanic.Localization.forSchema<ModalPageResolvedLabels>(modalPagesLocalizationSchemaName, {
    locale: culture,
    defaultLocale: defaultModalPageCulture
  });
}
