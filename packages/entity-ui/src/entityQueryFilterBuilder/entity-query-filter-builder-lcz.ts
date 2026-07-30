import { Titanic } from "@titanic-entity/entity-resources";
import type { EntityQueryFilterBuilderLabels } from "./model";
import "./lcz/en-US";
import "./lcz/ru-RU";

export type EntityQueryFilterBuilderCulture = "en-US" | "ru-RU";

const supportedCultures = ["en-US", "ru-RU"] as const satisfies readonly EntityQueryFilterBuilderCulture[];

export const entityQueryFilterBuilderLocalizationSchemaName = "Titanic.UI.EntityQueryFilterBuilder";
export const defaultEntityQueryFilterBuilderCulture: EntityQueryFilterBuilderCulture = "ru-RU";

export function resolveEntityQueryFilterBuilderCulture(
  culture: string | null | undefined
): EntityQueryFilterBuilderCulture {
  const normalizedCulture =
    normalizeEntityQueryFilterBuilderCulture(culture) ||
    normalizeEntityQueryFilterBuilderCulture(Titanic.Localization.getCurrentLocale());

  if (!normalizedCulture) {
    return defaultEntityQueryFilterBuilderCulture;
  }

  const exactCulture = supportedCultures.find(
    (key) => normalizeEntityQueryFilterBuilderCulture(key) === normalizedCulture
  );

  if (exactCulture) {
    return exactCulture;
  }

  const language = normalizedCulture.split("-")[0];
  return supportedCultures.find(
    (key) => normalizeEntityQueryFilterBuilderCulture(key).split("-")[0] === language
  ) ?? defaultEntityQueryFilterBuilderCulture;
}

export function getEntityQueryFilterBuilderLabels(
  culture: string | null | undefined
): EntityQueryFilterBuilderLabels {
  const resolvedCulture = resolveEntityQueryFilterBuilderCulture(culture);

  return Titanic.Localization.forSchema<EntityQueryFilterBuilderLabels>(
    entityQueryFilterBuilderLocalizationSchemaName,
    {
      locale: resolvedCulture,
      defaultLocale: defaultEntityQueryFilterBuilderCulture
    }
  );
}

function normalizeEntityQueryFilterBuilderCulture(culture: string | null | undefined): string {
  return typeof culture === "string" ? culture.trim().replace(/_/g, "-").toLowerCase() : "";
}
