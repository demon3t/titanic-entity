import type { ResourceSvgIconResource } from "../types";

/** Calendar icon resource. */
export const calendarIcon = {
  viewBox: "0 0 24 24",
  shapes: [
    {
      kind: "path",
      d: "M7 3v3M17 3v3M4.5 9.5h15M6.5 5h11a2 2 0 0 1 2 2v10.5a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.8,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ]
} satisfies ResourceSvgIconResource;

export default calendarIcon;
