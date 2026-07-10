import type { ResourceSvgIconResource } from "../types";

/** Data grid columns icon resource. */
export const columnsIcon = {
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
    { kind: "circle", cx: 9, cy: 7, r: 2, fill: "currentColor" },
    { kind: "circle", cx: 15, cy: 12, r: 2, fill: "currentColor" },
    { kind: "circle", cx: 11, cy: 17, r: 2, fill: "currentColor" }
  ]
} satisfies ResourceSvgIconResource;

export default columnsIcon;
