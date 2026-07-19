import { Titanic } from "@titanic-entity/entity-base";

export type EntityResourceLocalization = string | null | undefined;
export type EntityResourceTheme = string | null | undefined;

export type EntityResourceLocalizationProvider =
  () => EntityResourceLocalization | Promise<EntityResourceLocalization>;

export type EntityResourceThemeProvider =
  () => EntityResourceTheme | Promise<EntityResourceTheme>;

export interface EntityResourceUserContext {
  getLocalization?: EntityResourceLocalizationProvider;
  getTheme?: EntityResourceThemeProvider;
}

/**
 * Static user-context hooks used by resource consumers to resolve localization and theme.
 */
export abstract class EntityResourceContext {
  static getLocalization?: EntityResourceLocalizationProvider;
  static getTheme?: EntityResourceThemeProvider;

  static configure(context: EntityResourceUserContext): void {
    this.getLocalization = context.getLocalization;
    this.getTheme = context.getTheme;
  }

  static async resolveLocalization(): Promise<EntityResourceLocalization> {
    const localization = await this.getLocalization?.();
    return localization ?? Titanic.Localization.getCurrentLocale();
  }

  static async resolveTheme(): Promise<EntityResourceTheme> {
    return this.getTheme?.();
  }
}
