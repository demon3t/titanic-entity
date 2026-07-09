import type { ResourceSvgIconResource } from "../../types";

/** System designer icon resource. */
export const systemDesignerIcon = {
  viewBox: "0 0 24 24",
  shapes: [
    {
      kind: "path",
      d: "M5 7h14M8 12h11M5 17h8M8 5v4M16 10v4M11 15v4",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ]
} satisfies ResourceSvgIconResource;

export default systemDesignerIcon;
