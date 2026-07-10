import type { ResourceSvgIconResource } from "../types";

/** United States culture icon resource. */
export const enUsIcon = {
  viewBox: "0 0 24 16",
  shapes: [
    { kind: "rect", width: 24, height: 16, rx: 2, fill: "#ffffff" },
    { kind: "path", d: "M10.5 0H22A2 2 0 0 1 24 2H10.5Z", fill: "#b91c1c" },
    { kind: "rect", y: 4, width: 24, height: 2, fill: "#b91c1c" },
    { kind: "rect", y: 8, width: 24, height: 2, fill: "#b91c1c" },
    { kind: "rect", y: 12, width: 24, height: 2, fill: "#b91c1c" },
    { kind: "path", d: "M2 0H10.5V8.6H0V2A2 2 0 0 1 2 0Z", fill: "#1d4ed8" },
    { kind: "circle", cx: 2.2, cy: 2, r: 0.55, fill: "#ffffff" },
    { kind: "circle", cx: 5, cy: 2, r: 0.55, fill: "#ffffff" },
    { kind: "circle", cx: 7.8, cy: 2, r: 0.55, fill: "#ffffff" },
    { kind: "circle", cx: 3.6, cy: 4.3, r: 0.55, fill: "#ffffff" },
    { kind: "circle", cx: 6.4, cy: 4.3, r: 0.55, fill: "#ffffff" },
    { kind: "circle", cx: 2.2, cy: 6.6, r: 0.55, fill: "#ffffff" },
    { kind: "circle", cx: 5, cy: 6.6, r: 0.55, fill: "#ffffff" },
    { kind: "circle", cx: 7.8, cy: 6.6, r: 0.55, fill: "#ffffff" },
    { kind: "rect", width: 24, height: 16, rx: 2, fill: "none", stroke: "#cbd5e1" }
  ]
} satisfies ResourceSvgIconResource;

export default enUsIcon;
