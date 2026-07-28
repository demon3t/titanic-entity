import { definePackage } from "@titanic-entity/entity-base";
import { titanicEntityApiPackage } from "@titanic-entity/entity-api";
import { titanicEntityCorePackage } from "@titanic-entity/entity-core";
import { titanicEntityReactUiPackage } from "@titanic-entity/entity-react";
import { titanicEntityResourcesPackage } from "@titanic-entity/entity-resources";
import { titanicEntityIconsPackage } from "@titanic-entity/entity-icons";
import { entityUiSchemas } from "./schemas";

export * from "./dataGrid";
export * from "./actionBar";
export * from "./baseModalPage";
export * from "./container";
export * from "./dataGridSettingsModalPage";
export * from "./dataGridRowContextMenu";
export * from "./dateInput";
export * from "./dateTimeInput";
export * from "./dragDrop";
export * from "./baseSection";
export * from "./button";
export * from "./collapsiblePanel";
export * from "./editPage";
export * from "./expander";
export * from "./field";
export * from "./form";
export * from "./grid";
export * from "./inputFieldFrame";
export * from "./jsonEditor";
export * from "./label";
export * from "./lookupInput";
export * from "./modalPages";
export * from "./navigationTrail";
export * from "./numberInput";
export * from "./packageSiteShell";
export * from "./randomGifLoader";
export * from "./recordsPage";
export * from "./resourceSvgIcon";
export * from "./siteLayout";
export * from "./timeInput";
export { entityReactUiSchemas, entityUiSchemas } from "./schemas";

export const titanicUIPackage = definePackage({
  name: "Titanic.UI",
  version: "0.1.0",
  dependsOn: [
    titanicEntityCorePackage.name,
    titanicEntityApiPackage.name,
    titanicEntityResourcesPackage.name,
    titanicEntityIconsPackage.name,
    titanicEntityReactUiPackage.name
  ],
  schemas: entityUiSchemas
});

export default titanicUIPackage;
