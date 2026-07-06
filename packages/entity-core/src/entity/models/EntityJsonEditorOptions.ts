export type EntityJsonPrimitive = string | number | boolean | null;
export type EntityJsonValue = EntityJsonPrimitive | EntityJsonObject | EntityJsonArray;
export type EntityJsonObject = { [key: string]: EntityJsonValue };
export type EntityJsonArray = EntityJsonValue[];
export type EntityJsonEditorMode = "text" | "fields";
export type EntityJsonValueKind = "string" | "number" | "boolean" | "null" | "object" | "array";

export interface EntityJsonRequiredField {
  path: string;
  defaultValue?: EntityJsonValue;
  label?: string;
}

export interface EntityJsonEditorLabels {
  textMode: string;
  fieldsMode: string;
  addField: string;
  addItem: string;
  removeField: string;
  requiredField: string;
  fieldName: string;
  fieldType: string;
  value: string;
  invalidJson: string;
  emptyObject: string;
  stringType: string;
  numberType: string;
  booleanType: string;
  nullType: string;
  objectType: string;
  arrayType: string;
}

export interface EntityJsonEditorOptions {
  defaultMode?: EntityJsonEditorMode;
  minRows?: number;
  requiredFields?: readonly EntityJsonRequiredField[];
  labels?: Partial<EntityJsonEditorLabels>;
}
