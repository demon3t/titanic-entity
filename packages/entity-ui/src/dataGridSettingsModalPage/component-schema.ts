import { defineComponentSchema } from "@titanic-entity/entity-base";
import { EntityDataGridSettingsModalPage } from "./components/EntityDataGridSettingsModalPage";
import type { EntityDataGridSettingsModalPageContext } from "./model/EntityDataGridSettingsModalPageContext";
import { columnSettingsComponentNames } from "./schemas/component-names";
import { columnSettingsComponentSchemas } from "./schemas";

export const entityDataGridSettingsModalPageComponentSchema =
  defineComponentSchema<EntityDataGridSettingsModalPageContext<unknown>>({
    kind: "component",
    name: columnSettingsComponentNames.EntityDataGridSettingsModalPage,
    component: EntityDataGridSettingsModalPage
  });

export const dataGridSettingsModalPageComponentSchemas = [
  entityDataGridSettingsModalPageComponentSchema,
  ...columnSettingsComponentSchemas
] as const;
