import { definePackage } from "@titanic/entity-base";
import {
  entityReactEntitySchemas,
  entityReactEnumSchemas,
  titanicEntityCorePackage
} from "@titanic/entity-core";
import { titanicEntityApiPackage } from "@titanic/entity-api";
import { titanicEntityResourcesPackage } from "@titanic/entity-resources";
import { entityReactSchemas } from "./schemas";

export * from "@titanic/entity-base";
export * from "@titanic/entity-api";
export * from "@titanic/entity-core";
export * from "@titanic/entity-resources";
export {
  entityReactEntitySchemas,
  entityReactEnumSchemas
};

// Components
export * from "./components/EntityForm";
export * from "./components/EntityRegistry";
export * from "./components/EntityOrmList";
export * from "./components/EntityRecordDetails";
export * from "./components/EntityTable";
export * from "./components/actions/EntityPageActionButton";
export * from "./components/actions/EntityPageActions";
export * from "./components/context-menus/EntityDataGridRowContextMenu";
export * from "./components/feedback/RandomGifLoader";
export * from "./components/fields/EntityField";
export * from "./components/grid/EntityDataGrid";
export * from "./components/inputs/DateInput";
export * from "./components/inputs/NumberInput";
export * from "./components/inputs/SelectEntity";
export * from "./components/icons/ResourceSvgIcon";
export * from "./components/json/EntityJsonEditor";
export * from "./components/layout/EntityGrid";
export * from "./components/records/EntityRecordsPage";
export * from "./components/site/PackageSiteShell";
export * from "./components/site/SiteCollapsiblePanel";
export * from "./components/site/SiteIconButton";
export * from "./components/site/SiteIconDropdown";
export * from "./components/site/SiteLayout";
export * from "./components/site/SitePanelToggleButton";

// Templates
export * from "./templates/entity-edit";

// Resources
export * from "./resources/EntityDataGrid";

// Grids
export * from "./grids";

// Schemas
export * from "./schemas";

// System
export * from "./system/referenceObjects";
export * from "./system/systemStyles";

// Package
export * from "./model/entityReactUiPackageNames";

export const titanicEntityReactUiPackage = definePackage({
  name: "Titanic.EntityReact",
  version: "0.1.0",
  dependsOn: [
    titanicEntityCorePackage.name,
    titanicEntityApiPackage.name,
    titanicEntityResourcesPackage.name
  ],
  schemas: entityReactSchemas
});

export default titanicEntityReactUiPackage;
