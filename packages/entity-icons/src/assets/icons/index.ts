import type { ResourceSvgIconMap } from "@titanic-entity/entity-resources/icons";
import {
  calendarIcon,
  closeIcon,
  currentUserIcon,
  systemDesignerIcon,
  unknownIcon
} from "@titanic-entity/entity-resources/icons";

export {
  calendarIcon,
  closeIcon,
  currentUserIcon,
  systemDesignerIcon,
  unknownIcon
} from "@titanic-entity/entity-resources/icons";

/** Public icon names exported by @titanic-entity/entity-icons. */
export type EntityIconName =
  | "calendar"
  | "close"
  | "currentUser"
  | "systemDesigner"
  | "unknown";

/** Extensible flat icon set for application-level Entity icon collections. */
export const entityIcons = {
  calendar: calendarIcon,
  close: closeIcon,
  currentUser: currentUserIcon,
  systemDesigner: systemDesignerIcon,
  unknown: unknownIcon
} satisfies ResourceSvgIconMap<EntityIconName>;

/** Short alias used by Titanic icon resource registration. */
export const icons = entityIcons;

/** Type of the complete flat entity icon set. */
export type EntityIcons = typeof entityIcons;
