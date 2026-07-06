import { defineComponentSchema } from "@titanic-entity/entity-base";
import { EntityRecordsPage, entityReactComponentNames, type EntityRecordsPageProps } from "@titanic-entity/entity-react";

export const entityRecordsPageComponentSchema = defineComponentSchema<EntityRecordsPageProps>({
  kind: "component",
  name: entityReactComponentNames.EntityRecordsPage,
  component: EntityRecordsPage
});

export const entityUiRecordComponentSchemas = [
  entityRecordsPageComponentSchema
] as const;
