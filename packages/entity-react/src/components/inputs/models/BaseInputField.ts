export type InputFieldValueType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "dateTime"
  | "json"
  | "lookup"
  | "color";

export interface InputFieldValueByType {
  string: string | null;
  number: number | null;
  boolean: boolean;
  date: string | null;
  dateTime: string | null;
  json: unknown;
  lookup: string | number | null;
  color: string | null;
}

export type InputFieldValue<TValueType extends InputFieldValueType = InputFieldValueType> = InputFieldValueByType[TValueType];

export interface BaseInputFieldProps<TValue = unknown, TValueType extends InputFieldValueType = InputFieldValueType> {
  title?: string;
  value?: TValue;
  valueType?: TValueType;
  validationError?: string | null;
  required?: boolean;
  visible?: boolean;
  editable?: boolean;
}

export class BaseInputField<TValue = unknown, TValueType extends InputFieldValueType = InputFieldValueType>
  implements BaseInputFieldProps<TValue, TValueType>
{
  title?: string;
  value?: TValue;
  valueType?: TValueType;
  validationError?: string | null;
  required: boolean;
  visible: boolean;
  editable: boolean;

  constructor(props: BaseInputFieldProps<TValue, TValueType> = {}) {
    this.title = props.title;
    this.value = props.value;
    this.valueType = props.valueType;
    this.validationError = props.validationError;
    this.required = props.required ?? false;
    this.visible = props.visible ?? true;
    this.editable = props.editable ?? true;
  }
}
