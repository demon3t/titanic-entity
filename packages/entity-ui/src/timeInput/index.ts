import { defineComponentSchema, defineFieldSchema } from "@titanic-entity/entity-base";
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import { entityReactComponentNames, entityReactFieldNames } from "@titanic-entity/entity-react/model";
import "../button";
import "../inputFieldFrame";
import "./time-input";
import type { TimeInputProps } from "./time-input-props";

export type { TimeInputProps } from "./time-input-props";

export const TimeInput = Titanic.getReactModule<DefinedEntityReactComponent<TimeInputProps>>(
  "Titanic.UI.TimeInput"
)!;

export const timeInputComponentSchema = defineComponentSchema<TimeInputProps>({
  kind: "component",
  name: entityReactComponentNames.TimeInput,
  component: TimeInput
});

export const timeInputFieldSchema = defineFieldSchema<TimeInputProps>({
  kind: "field",
  name: entityReactFieldNames.TimeInput,
  component: TimeInput
});

export * from "./lcz";
