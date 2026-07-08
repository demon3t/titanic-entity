import { defineFieldSchema } from "@titanic-entity/entity-base";
import {
  DateInput,
  EntityField,
  EntityJsonEditor,
  NumberInput,
  SelectEntity,
  entityReactFieldNames,
  type DateInputProps,
  type EntityFieldProps,
  type EntityJsonEditorProps,
  type NumberInputProps,
  type SelectEntityProps
} from "@titanic-entity/entity-react/fields";

export const entityFieldSchema = defineFieldSchema<EntityFieldProps>({
  kind: "field",
  name: entityReactFieldNames.EntityField,
  component: EntityField
});

export const dateInputFieldSchema = defineFieldSchema<DateInputProps>({
  kind: "field",
  name: entityReactFieldNames.DateInput,
  component: DateInput
});

export const entityJsonEditorFieldSchema = defineFieldSchema<EntityJsonEditorProps>({
  kind: "field",
  name: entityReactFieldNames.EntityJsonEditor,
  component: EntityJsonEditor
});

export const numberInputFieldSchema = defineFieldSchema<NumberInputProps>({
  kind: "field",
  name: entityReactFieldNames.NumberInput,
  component: NumberInput
});

export const selectEntityFieldSchema = defineFieldSchema<SelectEntityProps>({
  kind: "field",
  name: entityReactFieldNames.SelectEntity,
  component: SelectEntity
});

export const entityUiFieldSchemas = [
  entityFieldSchema,
  dateInputFieldSchema,
  entityJsonEditorFieldSchema,
  numberInputFieldSchema,
  selectEntityFieldSchema
] as const;

export const entityReactFieldSchemas = entityUiFieldSchemas;
