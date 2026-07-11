import { defineComponentSchema } from "@titanic-entity/entity-base";
import {
  EntityRecordDetails as RecordDetails,
  type EntityRecordDetailsProps as RecordDetailsProps
} from "@titanic-entity/entity-react/components";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";

export const recordDetailsComponentSchema = defineComponentSchema<RecordDetailsProps>({
  kind: "component",
  name: entityReactComponentNames.EntityRecordDetails,
  component: RecordDetails
});
