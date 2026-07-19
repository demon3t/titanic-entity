import { defineComponentSchema } from "@titanic-entity/entity-base";
import { Titanic } from "@titanic-entity/entity-react";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";
import "../button";
import "../container";
import "../dataGrid";
import "./base-section";
import type { BaseSectionComponent, BaseSectionProps } from "./base-section-props";

export * from "./base-section-props";

export const BaseSection = Titanic.getReactModule(
  "Titanic.UI.BaseSection"
) as unknown as BaseSectionComponent;

export const BaseEntitySection = BaseSection;
export const EntityRecordsSection = BaseSection;

export const baseSectionComponentSchema = defineComponentSchema<BaseSectionProps>({
  component: BaseSection as never,
  kind: "component",
  name: entityReactComponentNames.BaseSection
});

export const baseEntitySectionComponentSchema = baseSectionComponentSchema;
export const recordsSectionComponentSchema = baseSectionComponentSchema;
