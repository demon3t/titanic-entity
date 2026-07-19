import { defineComponentSchema, defineFieldSchema } from "@titanic-entity/entity-base";
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import { entityReactComponentNames, entityReactFieldNames } from "@titanic-entity/entity-react/model";
import "../button";
import "../inputFieldFrame";
import "./date-input";
import type { DateInputProps } from "./date-input-props";

export type { DateInputProps } from "./date-input-props";

export const DateInput = Titanic.getReactModule<DefinedEntityReactComponent<DateInputProps>>(
  "Titanic.UI.DateInput"
)!;

export const dateInputComponentSchema = defineComponentSchema<DateInputProps>({
  kind: "component",
  name: entityReactComponentNames.DateInput,
  component: DateInput
});

export const dateInputFieldSchema = defineFieldSchema<DateInputProps>({
  kind: "field",
  name: entityReactFieldNames.DateInput,
  component: DateInput
});
export * from "./icons";
export * from "./lcz";
