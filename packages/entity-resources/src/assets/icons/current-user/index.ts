import type { ResourceSvgIconResource } from "../types";

/** Current user icon resource. */
export const currentUserIcon = {
  viewBox: "0 0 24 24",
  shapes: [
    {
      kind: "path",
      d: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    },
    {
      kind: "path",
      d: "M4 21a8 8 0 0 1 16 0",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ]
} satisfies ResourceSvgIconResource;

export default currentUserIcon;
