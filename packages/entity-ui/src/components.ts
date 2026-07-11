import { dataGridComponentSchema } from "./dataGrid";
import { dataGridRowContextMenuComponentSchema } from "./dataGridRowContextMenu";
import { dateInputComponentSchema } from "./dateInput";
import { editPageComponentSchema } from "./editPage";
import { fieldComponentSchema } from "./field";
import { formComponentSchema } from "./form";
import { gridComponentSchema } from "./grid";
import { jsonEditorComponentSchema } from "./jsonEditor";
import { numberInputComponentSchema } from "./numberInput";
import { ormListComponentSchema } from "./ormList";
import { packageSiteShellComponentSchema } from "./packageSiteShell";
import { pageActionButtonComponentSchema } from "./pageActionButton";
import { pageActionsComponentSchema } from "./pageActions";
import { randomGifLoaderComponentSchema } from "./randomGifLoader";
import { recordDetailsComponentSchema } from "./recordDetails";
import { recordsPageComponentSchema } from "./recordsPage";
import { registryComponentSchema } from "./registry";
import { resourceSvgIconComponentSchema } from "./resourceSvgIcon";
import { lookupInputComponentSchema } from "./lookupInput";
import { siteCollapsiblePanelComponentSchema } from "./siteCollapsiblePanel";
import { siteIconButtonComponentSchema } from "./siteIconButton";
import { siteIconDropdownComponentSchema } from "./siteIconDropdown";
import { siteLayoutComponentSchema } from "./siteLayout";
import { sitePanelToggleButtonComponentSchema } from "./sitePanelToggleButton";
import { tableComponentSchema } from "./table";

export const entityUiComponentSchemas = [
  editPageComponentSchema,
  dataGridComponentSchema,
  gridComponentSchema,
  fieldComponentSchema,
  dateInputComponentSchema,
  jsonEditorComponentSchema,
  numberInputComponentSchema,
  lookupInputComponentSchema,
  formComponentSchema,
  ormListComponentSchema,
  recordDetailsComponentSchema,
  registryComponentSchema,
  tableComponentSchema,
  pageActionButtonComponentSchema,
  pageActionsComponentSchema,
  siteIconDropdownComponentSchema,
  dataGridRowContextMenuComponentSchema,
  recordsPageComponentSchema,
  packageSiteShellComponentSchema,
  siteCollapsiblePanelComponentSchema,
  siteIconButtonComponentSchema,
  siteLayoutComponentSchema,
  sitePanelToggleButtonComponentSchema,
  randomGifLoaderComponentSchema,
  resourceSvgIconComponentSchema
] as const;

export const entityReactComponentSchemas = entityUiComponentSchemas;
