import { defineComponentSchema, defineFieldSchema } from "@titanic-entity/entity-base";
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import { entityReactComponentNames, entityReactFieldNames } from "@titanic-entity/entity-react/model";
import type { BaseInputFieldProps } from "../inputFieldFrame/base-input-field";
import "../button";
import "../inputFieldFrame";
import "./time-input";
import type { TimeInputLabels } from "./time-input-lcz";

export interface TimeInputProps extends BaseInputFieldProps<string | null, "time"> {
  id?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  locale?: string;
  labels?: TimeInputLabels;
  placeholder?: string;
  renderFrame?: boolean;
  rootClassName?: string;
  minuteStep?: number;
  onChange: (value: string | null) => void;
}

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

export {
  defaultTimeInputCulture,
  getTimeInputLabels,
  getTimeInputLocale,
  timeInputLocalizationSchemaName
} from "./time-input-lcz";
export type { TimeInputCulture, TimeInputLabels, TimeInputResolvedLabels } from "./time-input-lcz";
