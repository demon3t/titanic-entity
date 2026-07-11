import type { ResourceSvgIconResource } from "../types";

/** Left chevron icon resource. */
export const chevronLeftIcon = {
  viewBox: "0 0 24 24",
  shapes: [
    {
      kind: "path",
      d: "m15 6-6 6 6 6",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ]
} satisfies ResourceSvgIconResource;

export default chevronLeftIcon;
