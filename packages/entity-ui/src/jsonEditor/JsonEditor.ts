import { defineComponentSchema, defineFieldSchema } from "@titanic-entity/entity-base";
import {
  EntityJsonEditor as JsonEditor,
  entityReactFieldNames,
  type EntityJsonEditorProps as JsonEditorProps
} from "@titanic-entity/entity-react/fields";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";

export const jsonEditorComponentSchema = defineComponentSchema<JsonEditorProps>({
  kind: "component",
  name: entityReactComponentNames.EntityJsonEditor,
  component: JsonEditor
});

export const jsonEditorFieldSchema = defineFieldSchema<JsonEditorProps>({
  kind: "field",
  name: entityReactFieldNames.EntityJsonEditor,
  component: JsonEditor
});
