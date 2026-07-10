import type { ResourceSvgIconMap } from "./types";
import { calendarIcon } from "./calendar";
import { closeIcon } from "./close";
import { columnsIcon } from "./columns";
import { copyIcon } from "./copy";
import { currentUserIcon } from "./current-user";
import { dataGridRowActionDeleteIcon } from "./delete";
import { dataGridRowActionOpenIcon } from "./open";
import { dragHandleIcon } from "./drag-handle";
import { enUsIcon } from "./en-US";
import { panelChevronIcon } from "./panel-chevron";
import { ruRuIcon } from "./ru-RU";
import { systemDesignerIcon } from "./system-designer";
import { themeDarkIcon } from "./theme-dark";
import { themeGreenIcon } from "./theme-green";
import { themeLightIcon } from "./theme-light";
import { totalsIcon } from "./totals";
import { chevronLeftIcon } from "./chevron-left";
import { chevronRightIcon } from "./chevron-right";

export * from "./types";
export { calendarIcon } from "./calendar";
export { chevronLeftIcon } from "./chevron-left";
export { chevronRightIcon } from "./chevron-right";
export { closeIcon } from "./close";
export { columnsIcon } from "./columns";
export { copyIcon } from "./copy";
export { currentUserIcon } from "./current-user";
export { dataGridRowActionDeleteIcon } from "./delete";
export { dataGridRowActionOpenIcon } from "./open";
export { dragHandleIcon } from "./drag-handle";
export { enUsIcon } from "./en-US";
export { panelChevronIcon } from "./panel-chevron";
export { ruRuIcon } from "./ru-RU";
export { systemDesignerIcon } from "./system-designer";
export { themeDarkIcon } from "./theme-dark";
export { themeGreenIcon } from "./theme-green";
export { themeLightIcon } from "./theme-light";
export { totalsIcon } from "./totals";

/** Public icon names exported by @titanic-entity/entity-resources. */
export type EntityResourceIconName =
  | "calendar"
  | "chevronLeft"
  | "chevronRight"
  | "close"
  | "columns"
  | "copy"
  | "currentUser"
  | "delete"
  | "dragHandle"
  | "en-US"
  | "open"
  | "panelChevron"
  | "ru-RU"
  | "systemDesigner"
  | "themeDark"
  | "themeGreen"
  | "themeLight"
  | "totals";

/** Complete flat icon set exported by the resources package. */
export const entityResourceIcons = {
  calendar: calendarIcon,
  chevronLeft: chevronLeftIcon,
  chevronRight: chevronRightIcon,
  close: closeIcon,
  columns: columnsIcon,
  copy: copyIcon,
  currentUser: currentUserIcon,
  delete: dataGridRowActionDeleteIcon,
  dragHandle: dragHandleIcon,
  "en-US": enUsIcon,
  open: dataGridRowActionOpenIcon,
  panelChevron: panelChevronIcon,
  "ru-RU": ruRuIcon,
  systemDesigner: systemDesignerIcon,
  themeDark: themeDarkIcon,
  themeGreen: themeGreenIcon,
  themeLight: themeLightIcon,
  totals: totalsIcon
} satisfies ResourceSvgIconMap<EntityResourceIconName>;

/** Short alias for flat resource icons. */
export const icons = entityResourceIcons;

/** Type of the complete flat resource icon set. */
export type EntityResourceIcons = typeof entityResourceIcons;
