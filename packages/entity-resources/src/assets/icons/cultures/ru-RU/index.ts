import type { ResourceSvgIconResource } from "../../types";

/** Russian culture icon resource. */
export const ruRuIcon = {
  viewBox: "0 0 24 16",
  shapes: [
    { kind: "rect", width: 24, height: 16, rx: 2, fill: "#ffffff" },
    { kind: "rect", y: 5.33, width: 24, height: 5.34, fill: "#1f4fa3" },
    { kind: "rect", y: 10.67, width: 24, height: 5.33, rx: 2, fill: "#c7352f" },
    { kind: "rect", width: 24, height: 16, rx: 2, fill: "none", stroke: "#cbd5e1" }
  ]
} satisfies ResourceSvgIconResource;

export default ruRuIcon;
