import type { ResourceSvgIconResource } from "../../types";

/** Green theme icon resource. */
export const themeGreenIcon = {
  viewBox: "0 0 24 24",
  shapes: [
    {
      kind: "path",
      d: "M5 19c9 0 14-5 14-14-9 0-14 5-14 14Z",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    },
    {
      kind: "path",
      d: "M5 19c3.5-5 7-8.5 14-14",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ]
} satisfies ResourceSvgIconResource;

export default themeGreenIcon;
