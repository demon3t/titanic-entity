import { entityUiActionComponentSchemas } from "./actions";
import { entityUiContextMenuComponentSchemas } from "./contextMenus";
import { entityUiDataComponentSchemas } from "./data";
import { entityUiFeedbackComponentSchemas } from "./feedback";
import { entityUiIconComponentSchemas } from "./icons";
import { entityUiRecordComponentSchemas } from "./records";
import { entityUiSiteComponentSchemas } from "./site";
import { entityUiFieldComponentSchemas } from "../fields/components";
import { entityUiGridComponentSchemas } from "../grids/components";
import { entityUiTemplateComponentSchemas } from "../templates/components";

export const entityUiComponentSchemas = [
  ...entityUiTemplateComponentSchemas,
  ...entityUiGridComponentSchemas,
  ...entityUiFieldComponentSchemas,
  ...entityUiDataComponentSchemas,
  ...entityUiActionComponentSchemas,
  ...entityUiContextMenuComponentSchemas,
  ...entityUiRecordComponentSchemas,
  ...entityUiSiteComponentSchemas,
  ...entityUiFeedbackComponentSchemas,
  ...entityUiIconComponentSchemas
] as const;

export const entityReactComponentSchemas = entityUiComponentSchemas;
