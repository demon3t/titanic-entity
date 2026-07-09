import type { ResourceSvgIconMap } from "./types";
import { calendarIcon } from "./date-input/calendar";
import { closeIcon } from "./common/close";
import { columnsIcon } from "./data-grid-settings/columns";
import { copyIcon } from "./data-grid-row-actions/copy";
import { currentUserIcon } from "./site-shell/current-user";
import { dataGridRowActionDeleteIcon } from "./data-grid-row-actions/delete";
import { dataGridRowActionOpenIcon } from "./data-grid-row-actions/open";
import { dragHandleIcon } from "./common/drag-handle";
import { enUsIcon } from "./cultures/en-US";
import { panelChevronIcon } from "./site-shell/panel-chevron";
import { ruRuIcon } from "./cultures/ru-RU";
import { systemDesignerIcon } from "./site-shell/system-designer";
import { themeDarkIcon } from "./site-shell/theme-dark";
import { themeGreenIcon } from "./site-shell/theme-green";
import { themeLightIcon } from "./site-shell/theme-light";
import { totalsIcon } from "./data-grid-settings/totals";
import { chevronLeftIcon } from "./common/chevron-left";
import { chevronRightIcon } from "./common/chevron-right";

export * from "./types";
export { calendarIcon } from "./date-input/calendar";
export { chevronLeftIcon } from "./common/chevron-left";
export { chevronRightIcon } from "./common/chevron-right";
export { closeIcon } from "./common/close";
export { columnsIcon } from "./data-grid-settings/columns";
export { copyIcon } from "./data-grid-row-actions/copy";
export { currentUserIcon } from "./site-shell/current-user";
export { dataGridRowActionDeleteIcon } from "./data-grid-row-actions/delete";
export { dataGridRowActionOpenIcon } from "./data-grid-row-actions/open";
export { dragHandleIcon } from "./common/drag-handle";
export { enUsIcon } from "./cultures/en-US";
export { panelChevronIcon } from "./site-shell/panel-chevron";
export { ruRuIcon } from "./cultures/ru-RU";
export { systemDesignerIcon } from "./site-shell/system-designer";
export { themeDarkIcon } from "./site-shell/theme-dark";
export { themeGreenIcon } from "./site-shell/theme-green";
export { themeLightIcon } from "./site-shell/theme-light";
export { totalsIcon } from "./data-grid-settings/totals";

/** Shared icons used by common controls. */
export const entityCommonIcons = {
  chevronLeft: chevronLeftIcon,
  chevronRight: chevronRightIcon,
  close: closeIcon,
  dragHandle: dragHandleIcon
} satisfies ResourceSvgIconMap<"chevronLeft" | "chevronRight" | "close" | "dragHandle">;

/** Icons used by date input controls. */
export const entityDateInputIcons = {
  calendar: calendarIcon
} satisfies ResourceSvgIconMap<"calendar">;

/** Icons used by data grid settings controls. */
export const entityDataGridSettingsIcons = {
  columns: columnsIcon,
  totals: totalsIcon
} satisfies ResourceSvgIconMap<"columns" | "totals">;

/** Icons used by data grid row actions. */
export const entityDataGridRowActionIcons = {
  open: dataGridRowActionOpenIcon,
  delete: dataGridRowActionDeleteIcon,
  copy: copyIcon
} satisfies ResourceSvgIconMap<"open" | "delete" | "copy">;

/** Icons used by site shell controls. */
export const entitySiteShellIcons = {
  currentUser: currentUserIcon,
  panelChevron: panelChevronIcon,
  systemDesigner: systemDesignerIcon,
  themeDark: themeDarkIcon,
  themeGreen: themeGreenIcon,
  themeLight: themeLightIcon
} satisfies ResourceSvgIconMap<
  "currentUser" | "panelChevron" | "systemDesigner" | "themeDark" | "themeGreen" | "themeLight"
>;

/** Culture icons keyed by locale name. */
export const entityCultureIcons = {
  "en-US": enUsIcon,
  "ru-RU": ruRuIcon
} satisfies ResourceSvgIconMap<"en-US" | "ru-RU">;

/** Complete grouped icon tree exported by the resources package. */
export const entityResourceIcons = {
  common: entityCommonIcons,
  cultures: entityCultureIcons,
  dataGridRowActions: entityDataGridRowActionIcons,
  dataGridSettings: entityDataGridSettingsIcons,
  dateInput: entityDateInputIcons,
  siteShell: entitySiteShellIcons
} as const;

/** Short alias for grouped resource icons. */
export const icons = entityResourceIcons;

/** Type of the complete grouped resource icon tree. */
export type EntityResourceIcons = typeof entityResourceIcons;
