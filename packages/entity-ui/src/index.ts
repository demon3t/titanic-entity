import { definePackage } from "@titanic/entity-base";
import { titanicEntityApiPackage } from "@titanic/entity-api";
import { titanicEntityCorePackage } from "@titanic/entity-core";
import { titanicEntityReactUiPackage } from "@titanic/entity-react";
import { titanicEntityResourcesPackage } from "@titanic/entity-resources";
import { entityUiComponentSchemas } from "./components";
import { entityUiFieldSchemas } from "./fields";
import { entityUiGridSchemas } from "./grids";
import { entityUiTemplateSchemas } from "./templates";

export { entityReactComponentSchemas, entityUiComponentSchemas } from "./components";
export { entityReactFieldSchemas, entityUiFieldSchemas } from "./fields";
export {
  createEntityDataGridColumnSettingsPackage,
  defaultEntityDataGridSettings,
  entityReactGridSchemas,
  entityUiGridSchemas
} from "./grids";
export type {
  EntityDataGridColumn,
  EntityDataGridColumnPickerLabels,
  EntityDataGridColumnSetting,
  EntityDataGridColumnSettingsDialogContext,
  EntityDataGridColumnSettingsDialogRenderer,
  EntityDataGridColumnSettingsMode,
  EntityDataGridCulture,
  EntityDataGridEntityDescriptor,
  EntityDataGridLabels,
  EntityDataGridModeColumnSettings,
  EntityDataGridModeSettingsMap,
  EntityDataGridPackage,
  EntityDataGridPackageExtension,
  EntityDataGridProps,
  EntityDataGridQueryContext,
  EntityDataGridQueryFactory,
  EntityDataGridQueryInput,
  EntityDataGridRowAction,
  EntityDataGridRowActionContext,
  EntityDataGridSettings,
  EntityDataGridUserSettings
} from "./grids";
export { entityReactTemplateSchemas, entityUiTemplateSchemas } from "./templates";

export const entityUiSchemas = [
  ...entityUiTemplateSchemas,
  ...entityUiFieldSchemas,
  ...entityUiGridSchemas,
  ...entityUiComponentSchemas
] as const;

export const entityReactUiSchemas = entityUiSchemas;

export const titanicEntityUiPackage = definePackage({
  name: "Titanic.EntityUi",
  version: "0.1.0",
  dependsOn: [
    titanicEntityCorePackage.name,
    titanicEntityApiPackage.name,
    titanicEntityResourcesPackage.name,
    titanicEntityReactUiPackage.name
  ],
  schemas: entityUiSchemas
});

export default titanicEntityUiPackage;
