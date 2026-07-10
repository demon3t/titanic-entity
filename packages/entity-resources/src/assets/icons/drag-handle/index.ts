import type { ResourceSvgIconResource } from "../types";

/** Drag handle icon resource. */
export const dragHandleIcon = {
  viewBox: "0 0 24 24",
  shapes: [
    {
      kind: "path",
      d: "M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 3,
      strokeLinecap: "round"
    }
  ]
} satisfies ResourceSvgIconResource;

export default dragHandleIcon;
