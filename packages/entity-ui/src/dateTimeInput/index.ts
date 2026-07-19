import { defineComponentSchema, defineFieldSchema } from "@titanic-entity/entity-base";
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import { entityReactComponentNames, entityReactFieldNames } from "@titanic-entity/entity-react/model";
import "../dateInput";
import "../inputFieldFrame";
import "../timeInput";
import "./date-time-input";
import type { DateTimeInputProps } from "./date-time-input-props";

export type { DateInputLabels } from "../dateInput";
export type { TimeInputLabels } from "../timeInput";
export type { DateTimeInputProps } from "./date-time-input-props";

export const DateTimeInput = Titanic.getReactModule<DefinedEntityReactComponent<DateTimeInputProps>>(
  "Titanic.UI.DateTimeInput"
)!;

export const dateTimeInputComponentSchema = defineComponentSchema<DateTimeInputProps>({
  kind: "component",
  name: entityReactComponentNames.DateTimeInput,
  component: DateTimeInput
});

export const dateTimeInputFieldSchema = defineFieldSchema<DateTimeInputProps>({
  kind: "field",
  name: entityReactFieldNames.DateTimeInput,
  component: DateTimeInput
});
