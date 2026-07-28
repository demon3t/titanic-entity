import {
  buttonComponentSchema,
  siteIconButtonComponentSchema,
  siteIconDropdownComponentSchema,
  sitePanelToggleButtonComponentSchema
} from "./button";
import { actionBarComponentSchema } from "./actionBar";
import { baseModalPageComponentSchema } from "./baseModalPage";
import { baseSectionComponentSchema } from "./baseSection";
import { collapsiblePanelComponentSchema } from "./collapsiblePanel";
import { containerComponentSchema } from "./container";
import { dataGridComponentSchema } from "./dataGrid";
import { dataGridSettingsModalPageComponentSchemas } from "./dataGridSettingsModalPage/component-schema";
import { dataGridRowContextMenuComponentSchema } from "./dataGridRowContextMenu";
import { dateInputComponentSchema } from "./dateInput";
import { dateTimeInputComponentSchema } from "./dateTimeInput";
import { dragDropItemComponentSchema } from "./dragDrop";
import { basePageComponentSchema } from "./editPage";
import { expanderComponentSchema } from "./expander";
import { fieldComponentSchema } from "./field";
import { formComponentSchema } from "./form";
import { gridComponentSchema } from "./grid";
import { jsonEditorComponentSchema } from "./jsonEditor";
import { labelComponentSchema } from "./label";
import { lookupInputComponentSchema } from "./lookupInput";
import { modalPageComponentSchemas } from "./modalPages";
import { navigationTrailComponentSchema } from "./navigationTrail";
import { numberInputComponentSchema } from "./numberInput";
import { packageSiteShellComponentSchema } from "./packageSiteShell";
import { randomGifLoaderComponentSchema } from "./randomGifLoader";
import { recordsPageComponentSchema } from "./recordsPage";
import { resourceSvgIconComponentSchema } from "./resourceSvgIcon";
import { siteLayoutComponentSchema } from "./siteLayout";
import { timeInputComponentSchema } from "./timeInput";

export const entityUiComponentSchemas = [
  actionBarComponentSchema,
  buttonComponentSchema,
  collapsiblePanelComponentSchema,
  containerComponentSchema,
  dragDropItemComponentSchema,
  expanderComponentSchema,
  labelComponentSchema,
  baseModalPageComponentSchema,
  basePageComponentSchema,
  dataGridComponentSchema,
  ...dataGridSettingsModalPageComponentSchemas,
  gridComponentSchema,
  fieldComponentSchema,
  dateInputComponentSchema,
  dateTimeInputComponentSchema,
  timeInputComponentSchema,
  jsonEditorComponentSchema,
  lookupInputComponentSchema,
  ...modalPageComponentSchemas,
  navigationTrailComponentSchema,
  numberInputComponentSchema,
  formComponentSchema,
  siteIconDropdownComponentSchema,
  dataGridRowContextMenuComponentSchema,
  recordsPageComponentSchema,
  baseSectionComponentSchema,
  packageSiteShellComponentSchema,
  siteIconButtonComponentSchema,
  siteLayoutComponentSchema,
  sitePanelToggleButtonComponentSchema,
  randomGifLoaderComponentSchema,
  resourceSvgIconComponentSchema
] as const;

export const entityReactComponentSchemas = entityUiComponentSchemas;
