import type { ResourceSvgIconResource } from "../../types";

/** Close action icon resource. */
export const closeIcon = {
  viewBox: "0 0 24 24",
  shapes: [
    {
      kind: "path",
      d: "m7 7 10 10M17 7 7 17",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round"
    }
  ]
} satisfies ResourceSvgIconResource;

export default closeIcon;
