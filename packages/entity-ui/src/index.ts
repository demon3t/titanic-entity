import { definePackage } from "@titanic-entity/entity-base";
import { titanicEntityApiPackage } from "@titanic-entity/entity-api";
import { titanicEntityCorePackage } from "@titanic-entity/entity-core";
import { titanicEntityReactUiPackage } from "@titanic-entity/entity-react";
import { titanicEntityResourcesPackage } from "@titanic-entity/entity-resources";
import { entityUiSchemas } from "./schemas";

export * from "./dataGrid";
export * from "./dataGridRowContextMenu";
export * from "./dateInput";
export * from "./editPage";
export * from "./field";
export * from "./form";
export * from "./grid";
export * from "./jsonEditor";
export * from "./numberInput";
export * from "./ormList";
export * from "./packageSiteShell";
export * from "./pageActionButton";
export * from "./pageActions";
export * from "./randomGifLoader";
export * from "./recordDetails";
export * from "./recordsPage";
export * from "./registry";
export * from "./resourceSvgIcon";
export * from "./lookupInput";
export * from "./siteCollapsiblePanel";
export * from "./siteIconButton";
export * from "./siteIconDropdown";
export * from "./siteLayout";
export * from "./sitePanelToggleButton";
export * from "./table";
export * from "./components";
export * from "./fields";
export * from "./grids";
export * from "./templates";
export { entityReactUiSchemas, entityUiSchemas } from "./schemas";

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
