import { defineComponentSchema, defineFieldSchema } from "@titanic-entity/entity-base";
import {
  NumberInput,
  entityReactFieldNames,
  type NumberInputProps
} from "@titanic-entity/entity-react/fields";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";

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
