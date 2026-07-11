import type { ResourceSvgIconResource } from "../types";

/** Default icon resource used when a requested icon is not registered. */
export const unknownIcon = {
  viewBox: "0 0 24 24",
  shapes: [
    {
      kind: "rect",
      x: 3,
      y: 3,
      width: 18,
      height: 18,
      rx: 4,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.8
    },
    {
      kind: "path",
      d: "M9.7 9.2a2.7 2.7 0 0 1 4.6-1.9c1.1 1 1.1 2.8-.1 3.7-.9.7-1.7 1.2-1.7 2.4",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.8,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    },
    {
      kind: "circle",
      cx: 12,
      cy: 17,
      r: 1,
      fill: "currentColor"
    }
  ]
} satisfies ResourceSvgIconResource;

export default unknownIcon;
