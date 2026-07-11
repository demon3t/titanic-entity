import {
  calendarIcon,
  chevronLeftIcon,
  chevronRightIcon,
  closeIcon,
  currentUserIcon,
  dragHandleIcon,
  enUsIcon,
  panelChevronIcon,
  ruRuIcon,
  systemDesignerIcon,
  themeDarkIcon,
  themeGreenIcon,
  themeLightIcon,
  type ResourceSvgIconMap,
  type ResourceSvgIconResource
} from "@titanic-entity/entity-resources";

export type EntityIconCollectionName =
  | "common"
  | "cultures"
  | "dataGrid"
  | "dateInput"
  | "siteShell";

export type EntityCommonIconName =
  | "chevronLeft"
  | "chevronRight"
  | "close"
  | "dragHandle";

export type EntityCultureIconName = "en-US" | "ru-RU";

export type EntityDataGridIconName =
  | "columns"
  | "totals"
  | "open"
  | "delete"
  | "copy";

export type EntityDateInputIconName = "calendar";

export type EntitySiteShellIconName =
  | "currentUser"
  | "panelChevron"
  | "systemDesigner"
  | "themeDark"
  | "themeGreen"
  | "themeLight";

export const dataGridColumnsIcon = {
  viewBox: "0 0 24 24",
  shapes: [
    {
      kind: "path",
      d: "M4 7h16M4 12h16M4 17h16",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.8,
      strokeLinecap: "round"
    },
    {
      kind: "circle",
      cx: 9,
      cy: 7,
      r: 2,
      fill: "currentColor"
    },
    {
      kind: "circle",
      cx: 15,
      cy: 12,
      r: 2,
      fill: "currentColor"
    },
    {
      kind: "circle",
      cx: 11,
      cy: 17,
      r: 2,
      fill: "currentColor"
    }
  ]
} satisfies ResourceSvgIconResource;

export const dataGridTotalsIcon = {
  viewBox: "0 0 24 24",
  shapes: [
    {
      kind: "path",
      d: "M5 5h14M5 19h14M7 8l5 4-5 4M13 16h5",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.8,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ]
} satisfies ResourceSvgIconResource;

export const dataGridOpenIcon = {
  viewBox: "0 0 24 24",
  shapes: [
    {
      kind: "path",
      d: "M7 17 17 7M9 7h8v8",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.8,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ]
} satisfies ResourceSvgIconResource;

export const dataGridDeleteIcon = {
  viewBox: "0 0 24 24",
  shapes: [
    {
      kind: "path",
      d: "M6 7h12M9 7V5h6v2m-7 3v7m4-7v7m4-7v7M8 20h8a1 1 0 0 0 1-1V7H7v12a1 1 0 0 0 1 1Z",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.8,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ]
} satisfies ResourceSvgIconResource;

export const dataGridCopyIcon = {
  viewBox: "0 0 24 24",
  shapes: [
    {
      kind: "path",
      d: "M9 9h9v11H9zM6 15H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v1",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.8,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ]
} satisfies ResourceSvgIconResource;

export const commonIcons = {
  chevronLeft: chevronLeftIcon,
  chevronRight: chevronRightIcon,
  close: closeIcon,
  dragHandle: dragHandleIcon
} satisfies ResourceSvgIconMap<EntityCommonIconName>;

export const cultureIcons = {
  "en-US": enUsIcon,
  "ru-RU": ruRuIcon
} satisfies ResourceSvgIconMap<EntityCultureIconName>;

export const dataGridIcons = {
  columns: dataGridColumnsIcon,
  totals: dataGridTotalsIcon,
  open: dataGridOpenIcon,
  delete: dataGridDeleteIcon,
  copy: dataGridCopyIcon
} satisfies ResourceSvgIconMap<EntityDataGridIconName>;

export const dateInputIcons = {
  calendar: calendarIcon
} satisfies ResourceSvgIconMap<EntityDateInputIconName>;

export const siteShellIcons = {
  currentUser: currentUserIcon,
  panelChevron: panelChevronIcon,
  systemDesigner: systemDesignerIcon,
  themeDark: themeDarkIcon,
  themeGreen: themeGreenIcon,
  themeLight: themeLightIcon
} satisfies ResourceSvgIconMap<EntitySiteShellIconName>;

export const entityIconCollections = {
  common: commonIcons,
  cultures: cultureIcons,
  dataGrid: dataGridIcons,
  dateInput: dateInputIcons,
  siteShell: siteShellIcons
} as const;

export type EntityIconCollections = typeof entityIconCollections;

export const titanicCommonIcons = {
  titanicChevronLeft: chevronLeftIcon,
  titanicChevronRight: chevronRightIcon,
  titanicClose: closeIcon,
  titanicDragHandle: dragHandleIcon
} satisfies ResourceSvgIconMap<
  | "titanicChevronLeft"
  | "titanicChevronRight"
  | "titanicClose"
  | "titanicDragHandle"
>;

export const titanicDateInputIcons = {
  titanicCalendar: calendarIcon
} satisfies ResourceSvgIconMap<"titanicCalendar">;

export const titanicDataGridSettingsIcons = {
  titanicColumns: dataGridColumnsIcon,
  titanicTotals: dataGridTotalsIcon
} satisfies ResourceSvgIconMap<"titanicColumns" | "titanicTotals">;

export const titanicDataGridRowActionIcons = {
  titanicOpen: dataGridOpenIcon,
  titanicDelete: dataGridDeleteIcon,
  titanicCopy: dataGridCopyIcon
} satisfies ResourceSvgIconMap<"titanicOpen" | "titanicDelete" | "titanicCopy">;

export const titanicSiteShellIcons = {
  titanicCurrentUser: currentUserIcon,
  titanicPanelChevron: panelChevronIcon,
  titanicSystemDesigner: systemDesignerIcon,
  titanicThemeDark: themeDarkIcon,
  titanicThemeGreen: themeGreenIcon,
  titanicThemeLight: themeLightIcon
} satisfies ResourceSvgIconMap<
  | "titanicCurrentUser"
  | "titanicPanelChevron"
  | "titanicSystemDesigner"
  | "titanicThemeDark"
  | "titanicThemeGreen"
  | "titanicThemeLight"
>;

export const titanicCultureIcons = {
  titanicEnUs: enUsIcon,
  titanicRuRu: ruRuIcon
} satisfies ResourceSvgIconMap<"titanicEnUs" | "titanicRuRu">;

export const titanicUiIcons = {
  common: titanicCommonIcons,
  cultures: titanicCultureIcons,
  dataGridRowActions: titanicDataGridRowActionIcons,
  dataGridSettings: titanicDataGridSettingsIcons,
  dateInput: titanicDateInputIcons,
  siteShell: titanicSiteShellIcons
} as const;

export type TitanicUiIcons = typeof titanicUiIcons;
