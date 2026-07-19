import {
  buttonComponentSchema,
  siteIconButtonComponentSchema,
  siteIconDropdownComponentSchema,
  sitePanelToggleButtonComponentSchema
} from "./button";
import { baseModalPageComponentSchema } from "./baseModalPage";
import { baseSectionComponentSchema } from "./baseSection";
import { containerComponentSchema } from "./container";
import { dataGridComponentSchema } from "./dataGrid";
import { dataGridSettingsModalPageComponentSchemas } from "./dataGridSettingsModalPage/component-schema";
import { dataGridRowContextMenuComponentSchema } from "./dataGridRowContextMenu";
import { dateInputComponentSchema } from "./dateInput";
import { dateTimeInputComponentSchema } from "./dateTimeInput";
import { dragDropItemComponentSchema } from "./dragDrop";
import { baseEntityPageComponentSchema } from "./editPage";
import { expanderComponentSchema } from "./expander";
import { fieldComponentSchema } from "./field";
import { formComponentSchema } from "./form";
import { gridComponentSchema } from "./grid";
import { jsonEditorComponentSchema } from "./jsonEditor";
import { labelComponentSchema } from "./label";
import { lookupInputComponentSchema } from "./lookupInput";
import { numberInputComponentSchema } from "./numberInput";
import { packageSiteShellComponentSchema } from "./packageSiteShell";
import { pageActionButtonComponentSchema } from "./pageActionButton";
import { pageActionsComponentSchema } from "./pageActions";
import { randomGifLoaderComponentSchema } from "./randomGifLoader";
import { recordsPageComponentSchema } from "./recordsPage";
import { resourceSvgIconComponentSchema } from "./resourceSvgIcon";
import { siteCollapsiblePanelComponentSchema } from "./siteCollapsiblePanel";
import { siteLayoutComponentSchema } from "./siteLayout";
import { timeInputComponentSchema } from "./timeInput";

export const entityUiComponentSchemas = [
  buttonComponentSchema,
  containerComponentSchema,
  dragDropItemComponentSchema,
  expanderComponentSchema,
  labelComponentSchema,
  baseModalPageComponentSchema,
  baseEntityPageComponentSchema,
  dataGridComponentSchema,
  ...dataGridSettingsModalPageComponentSchemas,
  gridComponentSchema,
  fieldComponentSchema,
  dateInputComponentSchema,
  dateTimeInputComponentSchema,
  timeInputComponentSchema,
  jsonEditorComponentSchema,
  lookupInputComponentSchema,
  numberInputComponentSchema,
  formComponentSchema,
  pageActionButtonComponentSchema,
  pageActionsComponentSchema,
  siteIconDropdownComponentSchema,
  dataGridRowContextMenuComponentSchema,
  recordsPageComponentSchema,
  baseSectionComponentSchema,
  packageSiteShellComponentSchema,
  siteCollapsiblePanelComponentSchema,
  siteIconButtonComponentSchema,
  siteLayoutComponentSchema,
  sitePanelToggleButtonComponentSchema,
  randomGifLoaderComponentSchema,
  resourceSvgIconComponentSchema
] as const;

export const entityReactComponentSchemas = entityUiComponentSchemas;
