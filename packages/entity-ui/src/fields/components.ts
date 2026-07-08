import { defineComponentSchema } from "@titanic-entity/entity-base";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";
import {
  DateInput,
  EntityField,
  EntityJsonEditor,
  NumberInput,
  SelectEntity,
  type DateInputProps,
  type EntityFieldProps,
  type EntityJsonEditorProps,
  type NumberInputProps,
  type SelectEntityProps
} from "@titanic-entity/entity-react/fields";

export const entityFieldComponentSchema = defineComponentSchema<EntityFieldProps>({
  kind: "component",
  name: entityReactComponentNames.EntityField,
  component: EntityField
});

export const dateInputComponentSchema = defineComponentSchema<DateInputProps>({
  kind: "component",
  name: entityReactComponentNames.DateInput,
  component: DateInput
});

export const entityJsonEditorComponentSchema = defineComponentSchema<EntityJsonEditorProps>({
  kind: "component",
  name: entityReactComponentNames.EntityJsonEditor,
  component: EntityJsonEditor
});

export const numberInputComponentSchema = defineComponentSchema<NumberInputProps>({
  kind: "component",
  name: entityReactComponentNames.NumberInput,
  component: NumberInput
});

export const selectEntityComponentSchema = defineComponentSchema<SelectEntityProps>({
  kind: "component",
  name: entityReactComponentNames.SelectEntity,
  component: SelectEntity
});

export const entityUiFieldComponentSchemas = [
  entityFieldComponentSchema,
  dateInputComponentSchema,
  entityJsonEditorComponentSchema,
  numberInputComponentSchema,
  selectEntityComponentSchema
] as const;
