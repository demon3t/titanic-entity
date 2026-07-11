import { defineComponentSchema, defineFieldSchema } from "@titanic-entity/entity-base";
import {
  LookupInput,
  entityReactFieldNames,
  type LookupInputProps
} from "@titanic-entity/entity-react/fields";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";

export const lookupInputComponentSchema = defineComponentSchema<LookupInputProps>({
  kind: "component",
  name: entityReactComponentNames.LookupInput,
  component: LookupInput
});

export const lookupInputFieldSchema = defineFieldSchema<LookupInputProps>({
  kind: "field",
  name: entityReactFieldNames.LookupInput,
  component: LookupInput
});
