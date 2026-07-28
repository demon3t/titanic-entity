import { defineComponentSchema, defineTemplateSchema } from "@titanic-entity/entity-base";
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import { entityReactComponentNames, entityReactTemplateNames } from "@titanic-entity/entity-react/model";
import type { EntityEditPageProps as ReactEntityEditPageProps } from "@titanic-entity/entity-react/templates";
import "../button";
import "../container";
import "../field";
import "../grid";
import "../label";
import "./edit-page";
import type { ActionBarVariant } from "../actionBar";
import type { EditPageLabels } from "./edit-page-lcz";

export {
  defaultEditPageCulture,
  editPageLocalizationSchemaName,
  getEditPageLabels,
  getEditPageLocale
} from "./edit-page-lcz";
export type { EditPageCulture, EditPageLabels, EditPageResolvedLabels } from "./edit-page-lcz";

export type EntityEditPageProps = ReactEntityEditPageProps & {
  actionBarVariant?: ActionBarVariant;
  labels?: EditPageLabels;
  locale?: string;
};

export type BasePageProps = EntityEditPageProps;

export const BasePage =
  Titanic.getReactModule<DefinedEntityReactComponent<BasePageProps>>("Titanic.UI.BasePage")!;

export const EntityEditPage = BasePage;

export const basePageComponentSchema = defineComponentSchema<BasePageProps>({
  kind: "component",
  name: entityReactComponentNames.BasePage,
  component: BasePage
});

export const editPageComponentSchema = basePageComponentSchema;

export const basePageTemplateSchema = defineTemplateSchema<BasePageProps>({
  kind: "template",
  name: entityReactTemplateNames.BasePage,
  component: BasePage
});

export const editPageTemplateSchema = basePageTemplateSchema;
