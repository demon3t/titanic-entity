import { dateInputFieldSchema } from "./dateInput";
import { dateTimeInputFieldSchema } from "./dateTimeInput";
import { fieldSchema } from "./field";
import { jsonEditorFieldSchema } from "./jsonEditor";
import { lookupInputFieldSchema } from "./lookupInput";
import { numberInputFieldSchema } from "./numberInput";
import { timeInputFieldSchema } from "./timeInput";

export const entityUiFieldSchemas = [
  fieldSchema,
  dateInputFieldSchema,
  dateTimeInputFieldSchema,
  timeInputFieldSchema,
  jsonEditorFieldSchema,
  lookupInputFieldSchema,
  numberInputFieldSchema
] as const;

export const entityReactFieldSchemas = entityUiFieldSchemas;
