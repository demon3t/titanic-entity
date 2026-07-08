import { defineComponentSchema } from "@titanic-entity/entity-base";
import { EntityRecordsPage, type EntityRecordsPageProps } from "@titanic-entity/entity-react/components";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";

export const entityRecordsPageComponentSchema = defineComponentSchema<EntityRecordsPageProps>({
  kind: "component",
  name: entityReactComponentNames.EntityRecordsPage,
  component: EntityRecordsPage
});

export const entityUiRecordComponentSchemas = [
  entityRecordsPageComponentSchema
] as const;
