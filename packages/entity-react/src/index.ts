import { definePackage } from "@titanic-entity/entity-base";
import { titanicEntityCorePackage } from "@titanic-entity/entity-core";
import { titanicEntityApiPackage } from "@titanic-entity/entity-api";
import { titanicEntityResourcesPackage } from "@titanic-entity/entity-resources";
import { entityReactEntitySchemas, entityReactEnumSchemas, entityReactSchemas } from "./schemas";

export * from "@titanic-entity/entity-base";
export * from "@titanic-entity/entity-api";
export * from "@titanic-entity/entity-core";
export * from "@titanic-entity/entity-resources";
export { Titanic } from "@titanic-entity/entity-core";
export {
  entityReactEntitySchemas,
  entityReactEnumSchemas
};

// React API
export * from "./react/EntityApiProvider";
export * from "./react/hooks";
export * from "./react/models/AsyncState";
export * from "./react/models/EntityApiProviderProps";
export * from "./react/models/UseEntityQueryOptions";

// Headless
export * from "./headless";

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
export * from "./components/inputs/InputFieldFrame";
export * from "./components/inputs/models/BaseInputField";
export * from "./components/inputs/LookupInput";
export * from "./components/inputs/NumberInput";
export * from "./components/icons/ResourceSvgIcon";
export * from "./components/icons/titanicIcons";
export * from "./components/json/EntityJsonEditor";
export * from "./components/layout/EntityGrid";
export * from "./components/records/EntityRecordsPage";
export * from "./components/site/PackageSiteShell";
export * from "./components/site/SiteCollapsiblePanel";
export * from "./components/site/SiteIconButton";
export * from "./components/site/SiteIconDropdown";
export * from "./components/site/SiteLayout";
export * from "./components/site/SitePanelToggleButton";

// Fields
export * from "./fields";

// Grids
export * from "./grids";

// Layout
export * from "./layout";

// Templates
export * from "./templates";

// Resources
export * from "./resources";

// Schemas
export * from "./schemas";

// System
export * from "./system";

// Package
export * from "./model";

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
