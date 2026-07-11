import { defineComponentSchema, defineFieldSchema } from "@titanic-entity/entity-base";
import {
  DateInput,
  entityReactFieldNames,
  type DateInputProps
} from "@titanic-entity/entity-react/fields";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";

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
