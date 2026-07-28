import { entityUiComponentSchemas } from "./components";
import { dataGridIconSchemas } from "./dataGrid/icons";
import { dataGridRowContextMenuIconSchemas } from "./dataGridRowContextMenu/icons";
import { dateInputIconSchemas } from "./dateInput/icons";
import { entityUiFieldSchemas } from "./fields";
import { entityUiGridSchemas } from "./grids";
import { packageSiteShellIconSchemas } from "./packageSiteShell/icons";
import { entityUiTemplateSchemas } from "./templates";

export const entityUiIconSchemas = [
  ...dateInputIconSchemas,
  ...dataGridIconSchemas,
  ...dataGridRowContextMenuIconSchemas,
  ...packageSiteShellIconSchemas
] as const;

export const entityUiSchemas = [
  ...entityUiTemplateSchemas,
  ...entityUiIconSchemas,
  ...entityUiFieldSchemas,
  ...entityUiGridSchemas,
  ...entityUiComponentSchemas
] as const;

export const entityReactUiSchemas = entityUiSchemas;
