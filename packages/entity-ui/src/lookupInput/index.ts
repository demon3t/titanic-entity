import { defineComponentSchema, defineFieldSchema } from "@titanic-entity/entity-base";
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import { entityReactComponentNames, entityReactFieldNames } from "@titanic-entity/entity-react/model";
import type { ReactNode } from "react";
import "../button";
import "../inputFieldFrame";
import "./lookup-input";
import type { LookupInputItem, LookupInputProps } from "./lookup-input-props";

export type { LookupInputItem, LookupInputMode, LookupInputProps, LookupInputValue } from "./lookup-input-props";

export const LookupInput = Titanic.getReactModule<DefinedEntityReactComponent<LookupInputProps>>(
  "Titanic.UI.LookupInput"
)! as <TItem extends LookupInputItem = LookupInputItem>(props: LookupInputProps<TItem>) => ReactNode;

export const lookupInputComponentSchema = defineComponentSchema<LookupInputProps>({
  kind: "component",
  name: entityReactComponentNames.LookupInput,
  component: LookupInput
});

export const lookupInputFieldSchema = defineFieldSchema<LookupInputProps>({
  kind: "field",
  name: entityReactFieldNames.LookupInput,
  component: LookupInput
});

export * from "./icons";
export * from "./lcz";
