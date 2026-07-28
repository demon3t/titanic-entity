import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import type { EntityDataGridPackage } from "../dataGrid/data-grid-package";
import type { EntityDataGridSettingsModalPageContext } from "./model/EntityDataGridSettingsModalPageContext";
import { columnSettingsDefinedComponentNames } from "./schemas/component-names";
import "./components/EntityDataGridSettingsModalPage";

function getEntityDataGridSettingsModalPage() {
  return Titanic.getReactModule<DefinedEntityReactComponent<EntityDataGridSettingsModalPageContext<unknown>>>(
    columnSettingsDefinedComponentNames.EntityDataGridSettingsModalPage
  );
}

export function renderEntityDataGridSettingsModalPage<TRow = unknown>(
  context: EntityDataGridSettingsModalPageContext<TRow>
) {
  const SettingsModalPage = getEntityDataGridSettingsModalPage();

  return SettingsModalPage ? (
    <SettingsModalPage {...(context as EntityDataGridSettingsModalPageContext<unknown>)} />
  ) : null;
}

export function createEntityDataGridSettingsModalPagePackage<TRow = unknown>(): EntityDataGridPackage<TRow> {
  return {
    name: "settings-modal-page",
    order: 100,
    extension: {
      renderColumnSettingsDialog: renderEntityDataGridSettingsModalPage
    }
  };
}
