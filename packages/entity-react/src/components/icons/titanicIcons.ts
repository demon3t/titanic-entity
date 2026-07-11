import type { ResourceSvgIconMap } from "@titanic-entity/entity-resources";

export const titanicCommonIcons = {
  titanicChevronLeft: {
    viewBox: "0 0 24 24",
    shapes: [
      { kind: "path", d: "m15 6-6 6 6 6", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }
    ]
  },
  titanicChevronRight: {
    viewBox: "0 0 24 24",
    shapes: [
      { kind: "path", d: "m9 6 6 6-6 6", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }
    ]
  },
  titanicClose: {
    viewBox: "0 0 24 24",
    shapes: [
      { kind: "path", d: "m7 7 10 10M17 7 7 17", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" }
    ]
  },
  titanicDragHandle: {
    viewBox: "0 0 24 24",
    shapes: [
      { kind: "path", d: "M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01", fill: "none", stroke: "currentColor", strokeWidth: 3, strokeLinecap: "round" }
    ]
  }
} satisfies ResourceSvgIconMap<"titanicChevronLeft" | "titanicChevronRight" | "titanicClose" | "titanicDragHandle">;

export const titanicDateInputIcons = {
  titanicCalendar: {
    viewBox: "0 0 24 24",
    shapes: [
      { kind: "path", d: "M7 3v3M17 3v3M4.5 9.5h15M6.5 5h11a2 2 0 0 1 2 2v10.5a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" }
    ]
  }
} satisfies ResourceSvgIconMap<"titanicCalendar">;

export const titanicDataGridSettingsIcons = {
  titanicColumns: {
    viewBox: "0 0 24 24",
    shapes: [
      { kind: "path", d: "M4 7h16M4 12h16M4 17h16", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" },
      { kind: "circle", cx: 9, cy: 7, r: 2, fill: "currentColor" },
      { kind: "circle", cx: 15, cy: 12, r: 2, fill: "currentColor" },
      { kind: "circle", cx: 11, cy: 17, r: 2, fill: "currentColor" }
    ]
  },
  titanicTotals: {
    viewBox: "0 0 24 24",
    shapes: [
      { kind: "path", d: "M5 5h14M5 19h14M7 8l5 4-5 4M13 16h5", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" }
    ]
  }
} satisfies ResourceSvgIconMap<"titanicColumns" | "titanicTotals">;

export const titanicDataGridRowActionIcons = {
  titanicOpen: {
    viewBox: "0 0 24 24",
    shapes: [
      { kind: "path", d: "M7 17 17 7M9 7h8v8", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" }
    ]
  },
  titanicDelete: {
    viewBox: "0 0 24 24",
    shapes: [
      { kind: "path", d: "M6 7h12M9 7V5h6v2m-7 3v7m4-7v7m4-7v7M8 20h8a1 1 0 0 0 1-1V7H7v12a1 1 0 0 0 1 1Z", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" }
    ]
  },
  titanicCopy: {
    viewBox: "0 0 24 24",
    shapes: [
      { kind: "path", d: "M9 9h9v11H9zM6 15H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v1", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" }
    ]
  }
} satisfies ResourceSvgIconMap<"titanicOpen" | "titanicDelete" | "titanicCopy">;

export const titanicSiteShellIcons = {
  titanicCurrentUser: {
    viewBox: "0 0 24 24",
    shapes: [
      { kind: "path", d: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
      { kind: "path", d: "M4 21a8 8 0 0 1 16 0", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }
    ]
  },
  titanicPanelChevron: {
    viewBox: "0 0 24 24",
    shapes: [
      { kind: "path", d: "M15 6 9 12l6 6", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }
    ]
  },
  titanicSystemDesigner: {
    viewBox: "0 0 24 24",
    shapes: [
      { kind: "path", d: "M5 7h14M8 12h11M5 17h8M8 5v4M16 10v4M11 15v4", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }
    ]
  },
  titanicThemeDark: {
    viewBox: "0 0 24 24",
    shapes: [
      { kind: "path", d: "M21 14.7A7.8 7.8 0 0 1 9.3 3a9 9 0 1 0 11.7 11.7Z", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }
    ]
  },
  titanicThemeGreen: {
    viewBox: "0 0 24 24",
    shapes: [
      { kind: "path", d: "M5 19c9 0 14-5 14-14-9 0-14 5-14 14Z", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
      { kind: "path", d: "M5 19c3.5-5 7-8.5 14-14", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }
    ]
  },
  titanicThemeLight: {
    viewBox: "0 0 24 24",
    shapes: [
      { kind: "path", d: "M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z", fill: "none", stroke: "currentColor", strokeWidth: 2 },
      { kind: "path", d: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }
    ]
  }
} satisfies ResourceSvgIconMap<"titanicCurrentUser" | "titanicPanelChevron" | "titanicSystemDesigner" | "titanicThemeDark" | "titanicThemeGreen" | "titanicThemeLight">;

export const titanicCultureIcons = {
  titanicEnUs: {
    viewBox: "0 0 24 16",
    shapes: [
      { kind: "rect", width: 24, height: 16, rx: 2, fill: "#ffffff" },
      { kind: "rect", y: 0, width: 24, height: 2, fill: "#b91c1c" },
      { kind: "rect", y: 4, width: 24, height: 2, fill: "#b91c1c" },
      { kind: "rect", y: 8, width: 24, height: 2, fill: "#b91c1c" },
      { kind: "rect", y: 12, width: 24, height: 2, fill: "#b91c1c" },
      { kind: "rect", width: 10.5, height: 8.6, rx: 1.2, fill: "#1d4ed8" },
      { kind: "circle", cx: 2.2, cy: 2, r: 0.55, fill: "#ffffff" },
      { kind: "circle", cx: 5, cy: 2, r: 0.55, fill: "#ffffff" },
      { kind: "circle", cx: 7.8, cy: 2, r: 0.55, fill: "#ffffff" },
      { kind: "circle", cx: 3.6, cy: 4.3, r: 0.55, fill: "#ffffff" },
      { kind: "circle", cx: 6.4, cy: 4.3, r: 0.55, fill: "#ffffff" },
      { kind: "circle", cx: 2.2, cy: 6.6, r: 0.55, fill: "#ffffff" },
      { kind: "circle", cx: 5, cy: 6.6, r: 0.55, fill: "#ffffff" },
      { kind: "circle", cx: 7.8, cy: 6.6, r: 0.55, fill: "#ffffff" },
      { kind: "rect", width: 24, height: 16, rx: 2, fill: "none", stroke: "#cbd5e1" }
    ]
  },
  titanicRuRu: {
    viewBox: "0 0 24 16",
    shapes: [
      { kind: "rect", width: 24, height: 16, rx: 2, fill: "#ffffff" },
      { kind: "rect", y: 5.33, width: 24, height: 5.34, fill: "#1f4fa3" },
      { kind: "rect", y: 10.67, width: 24, height: 5.33, rx: 2, fill: "#c7352f" },
      { kind: "rect", width: 24, height: 16, rx: 2, fill: "none", stroke: "#cbd5e1" }
    ]
  }
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
