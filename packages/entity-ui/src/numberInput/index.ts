import { defineComponentSchema, defineFieldSchema } from "@titanic-entity/entity-base";
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import { entityReactComponentNames, entityReactFieldNames } from "@titanic-entity/entity-react/model";
import "../inputFieldFrame";
import "./number-input";
import type { NumberInputProps } from "./number-input-props";

export type { NumberInputProps } from "./number-input-props";

export const NumberInput = Titanic.getReactModule<DefinedEntityReactComponent<NumberInputProps>>(
  "Titanic.UI.NumberInput"
)!;

export const numberInputComponentSchema = defineComponentSchema<NumberInputProps>({
  kind: "component",
  name: entityReactComponentNames.NumberInput,
  component: NumberInput
});

export const numberInputFieldSchema = defineFieldSchema<NumberInputProps>({
  kind: "field",
  name: entityReactFieldNames.NumberInput,
  component: NumberInput
});

export * from "./icons";
export * from "./lcz";
