import { defineComponentSchema } from "@titanic-entity/entity-base";
import {
  EntityRecordsPage as RecordsPage,
  type EntityRecordsPageProps as RecordsPageProps
} from "@titanic-entity/entity-react/components";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";

export const recordsPageComponentSchema = defineComponentSchema<RecordsPageProps>({
  kind: "component",
  name: entityReactComponentNames.EntityRecordsPage,
  component: RecordsPage
});
