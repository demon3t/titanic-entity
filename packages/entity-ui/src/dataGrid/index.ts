import { defineComponentSchema, defineGridSchema } from "@titanic-entity/entity-base";
import type { EntityApiEntity } from "@titanic-entity/entity-api";
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import { entityReactComponentNames, entityReactGridNames } from "@titanic-entity/entity-react/model";
import type { ReactNode, Ref } from "react";

import "../button";
import "../container";
import "./data-grid";
import { getEntityDataGridLabels } from "./lcz";
import type { EntityDataGridHandle, EntityDataGridProps } from "./data-grid-props";
import type { EntityDataGridColumn } from "./data-grid-settings";

Object.assign(Titanic, {
  UI: {
    ...((Titanic as any).UI ?? {}),
    getEntityDataGridLabels
  }
});

export type EntityDataGridComponent = <TRow = EntityApiEntity>(
  props: EntityDataGridProps<TRow> & { ref?: Ref<EntityDataGridHandle<TRow>> }
) => ReactNode;

export const EntityDataGrid = Titanic.getReactModule<DefinedEntityReactComponent<EntityDataGridProps<any>>>(
  "Titanic.UI.EntityDataGrid"
)! as unknown as EntityDataGridComponent;

export const dataGridComponentSchema = defineComponentSchema<EntityDataGridProps<any>>({
  kind: "component",
  name: entityReactComponentNames.EntityDataGrid,
  component: EntityDataGrid as never
});

export const dataGridSchema = defineGridSchema<EntityDataGridProps<any>>({
  kind: "grid",
  name: entityReactGridNames.EntityDataGrid,
  component: EntityDataGrid as never
});

export type EntityDataGridResolvedColumn<TRow = unknown> = EntityDataGridColumn<TRow> & {
  settingId: string;
  span?: number;
};

export * from "./data-grid-package";
export * from "./data-grid-props";
export * from "./data-grid-settings";
export * from "../dataGridSettingsModalPage/EntityDataGridSettingsModalPagePackage";
export * from "../dataGridSettingsModalPage/model/EntityDataGridSettingsModalPageContext";
export * from "./icons";
export * from "./lcz";
