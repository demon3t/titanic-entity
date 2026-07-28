import { defineComponentSchema, defineFieldSchema } from "@titanic-entity/entity-base";
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import { entityReactComponentNames, entityReactFieldNames } from "@titanic-entity/entity-react/model";
import type { BaseInputFieldProps } from "../inputFieldFrame/base-input-field";
import "../inputFieldFrame";
import "./number-input";

export interface NumberInputProps extends BaseInputFieldProps<number | null, "number"> {
  id?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  onChange: (value: number | null) => void;
}

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
