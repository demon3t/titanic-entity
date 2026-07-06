import { defineComponentSchema } from "@titanic/entity-base";
import { EntityRecordsPage, entityReactComponentNames, type EntityRecordsPageProps } from "@titanic/entity-react";

export const entityRecordsPageComponentSchema = defineComponentSchema<EntityRecordsPageProps>({
  kind: "component",
  name: entityReactComponentNames.EntityRecordsPage,
  component: EntityRecordsPage
});

export const entityUiRecordComponentSchemas = [
  entityRecordsPageComponentSchema
] as const;
