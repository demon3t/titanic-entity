import { dateInputFieldSchema } from "./dateInput";
import { fieldSchema } from "./field";
import { jsonEditorFieldSchema } from "./jsonEditor";
import { numberInputFieldSchema } from "./numberInput";
import { lookupInputFieldSchema } from "./lookupInput";

export const entityUiFieldSchemas = [
  fieldSchema,
  dateInputFieldSchema,
  jsonEditorFieldSchema,
  numberInputFieldSchema,
  lookupInputFieldSchema
] as const;

export const entityReactFieldSchemas = entityUiFieldSchemas;
