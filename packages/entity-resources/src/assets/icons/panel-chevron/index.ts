import type { ResourceSvgIconResource } from "../types";

/** Site panel chevron icon resource. */
export const panelChevronIcon = {
  viewBox: "0 0 24 24",
  shapes: [
    {
      kind: "path",
      d: "M15 6 9 12l6 6",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ]
} satisfies ResourceSvgIconResource;

export default panelChevronIcon;
