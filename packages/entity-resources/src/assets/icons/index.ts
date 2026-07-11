import type { ResourceSvgIconMap } from "./types";
import { calendarIcon } from "./calendar";
import { closeIcon } from "./close";
import { currentUserIcon } from "./current-user";
import { dragHandleIcon } from "./drag-handle";
import { enUsIcon } from "./en-US";
import { panelChevronIcon } from "./panel-chevron";
import { ruRuIcon } from "./ru-RU";
import { systemDesignerIcon } from "./system-designer";
import { themeDarkIcon } from "./theme-dark";
import { themeGreenIcon } from "./theme-green";
import { themeLightIcon } from "./theme-light";
import { unknownIcon } from "./unknown";
import { chevronLeftIcon } from "./chevron-left";
import { chevronRightIcon } from "./chevron-right";

export * from "./types";
export { calendarIcon } from "./calendar";
export { chevronLeftIcon } from "./chevron-left";
export { chevronRightIcon } from "./chevron-right";
export { closeIcon } from "./close";
export { currentUserIcon } from "./current-user";
export { dragHandleIcon } from "./drag-handle";
export { enUsIcon } from "./en-US";
export { panelChevronIcon } from "./panel-chevron";
export { ruRuIcon } from "./ru-RU";
export { systemDesignerIcon } from "./system-designer";
export { themeDarkIcon } from "./theme-dark";
export { themeGreenIcon } from "./theme-green";
export { themeLightIcon } from "./theme-light";
export { unknownIcon } from "./unknown";

/** Public icon names exported by @titanic-entity/entity-resources. */
export type EntityResourceIconName =
  | "calendar"
  | "chevronLeft"
  | "chevronRight"
  | "close"
  | "currentUser"
  | "dragHandle"
  | "en-US"
  | "panelChevron"
  | "ru-RU"
  | "systemDesigner"
  | "themeDark"
  | "themeGreen"
  | "themeLight"
  | "unknown";

/** Complete flat icon set exported by the resources package. */
export const entityResourceIcons = {
  calendar: calendarIcon,
  chevronLeft: chevronLeftIcon,
  chevronRight: chevronRightIcon,
  close: closeIcon,
  currentUser: currentUserIcon,
  dragHandle: dragHandleIcon,
  "en-US": enUsIcon,
  panelChevron: panelChevronIcon,
  "ru-RU": ruRuIcon,
  systemDesigner: systemDesignerIcon,
  themeDark: themeDarkIcon,
  themeGreen: themeGreenIcon,
  themeLight: themeLightIcon,
  unknown: unknownIcon
} satisfies ResourceSvgIconMap<EntityResourceIconName>;

/** Short alias for flat resource icons. */
export const icons = entityResourceIcons;

/** Type of the complete flat resource icon set. */
export type EntityResourceIcons = typeof entityResourceIcons;
