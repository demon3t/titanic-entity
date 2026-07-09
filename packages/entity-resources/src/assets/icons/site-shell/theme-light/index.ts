import type { ResourceSvgIconResource } from "../../types";

/** Light theme icon resource. */
export const themeLightIcon = {
  viewBox: "0 0 24 24",
  shapes: [
    {
      kind: "path",
      d: "M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2
    },
    {
      kind: "path",
      d: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ]
} satisfies ResourceSvgIconResource;

export default themeLightIcon;
