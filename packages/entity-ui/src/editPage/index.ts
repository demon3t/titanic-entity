import { defineComponentSchema, defineTemplateSchema } from "@titanic-entity/entity-base";
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import { entityReactComponentNames, entityReactTemplateNames } from "@titanic-entity/entity-react/model";
import "../button";
import "../container";
import "../field";
import "../grid";
import "../label";
import "./edit-page";
import type { BaseEntityPageProps } from "./edit-page-props";

export * from "./edit-page-props";
export * from "./icons";
export * from "./lcz";

export const BaseEntityPage =
  Titanic.getReactModule<DefinedEntityReactComponent<BaseEntityPageProps>>("Titanic.UI.BaseEntityPage")!;

export const EntityEditPage = BaseEntityPage;

export const baseEntityPageComponentSchema = defineComponentSchema<BaseEntityPageProps>({
  kind: "component",
  name: entityReactComponentNames.BaseEntityPage,
  component: BaseEntityPage
});

export const editPageComponentSchema = baseEntityPageComponentSchema;

export const baseEntityPageTemplateSchema = defineTemplateSchema<BaseEntityPageProps>({
  kind: "template",
  name: entityReactTemplateNames.BaseEntityPage,
  component: BaseEntityPage
});

export const editPageTemplateSchema = baseEntityPageTemplateSchema;
