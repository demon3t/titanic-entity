import { defineComponentSchema, defineFieldSchema } from "@titanic-entity/entity-base";
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import { entityReactComponentNames, entityReactFieldNames } from "@titanic-entity/entity-react/model";
import type { BaseInputFieldProps } from "../inputFieldFrame/base-input-field";
import "../button";
import "../inputFieldFrame";
import "./date-input";
import type { DateInputLabels } from "./date-input-lcz";

export interface DateInputProps extends BaseInputFieldProps<string | null, "date"> {
  id?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  locale?: string;
  labels?: DateInputLabels;
  placeholder?: string;
  renderFrame?: boolean;
  rootClassName?: string;
  onChange: (value: string | null) => void;
}

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
export {
  dateInputLocalizationSchemaName,
  defaultDateInputCulture,
  getDateInputLabels,
  getDateInputLocale
} from "./date-input-lcz";
export type { DateInputCulture, DateInputLabels, DateInputResolvedLabels } from "./date-input-lcz";
