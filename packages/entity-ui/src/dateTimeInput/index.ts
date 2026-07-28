import { defineComponentSchema, defineFieldSchema } from "@titanic-entity/entity-base";
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import { entityReactComponentNames, entityReactFieldNames } from "@titanic-entity/entity-react/model";
import type { DateInputLabels } from "../dateInput";
import type { BaseInputFieldProps } from "../inputFieldFrame/base-input-field";
import type { TimeInputLabels } from "../timeInput";
import "../dateInput";
import "../inputFieldFrame";
import "../timeInput";
import "./date-time-input";

export type { DateInputLabels } from "../dateInput";
export type { TimeInputLabels } from "../timeInput";

export interface DateTimeInputProps extends BaseInputFieldProps<string | null, "dateTime"> {
  id?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  locale?: string;
  dateLabels?: DateInputLabels;
  timeLabels?: TimeInputLabels;
  placeholder?: string;
  datePlaceholder?: string;
  timePlaceholder?: string;
  renderFrame?: boolean;
  rootClassName?: string;
  minuteStep?: number;
  onChange: (value: string | null) => void;
}

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
