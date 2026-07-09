/** Numeric or string length value accepted by SVG attributes. */
export type ResourceSvgLength = number | string;

/** Theme variant key used by icon resources with explicit themed variants. */
export type ResourceSvgIconTheme = string;

/** Serializable SVG shape descriptor used by resource icons. */
export type ResourceSvgIconShape =
  | {
      kind: "rect";
      x?: ResourceSvgLength;
      y?: ResourceSvgLength;
      width: ResourceSvgLength;
      height: ResourceSvgLength;
      rx?: ResourceSvgLength;
      fill?: string;
      stroke?: string;
    }
  | {
      kind: "circle";
      cx: ResourceSvgLength;
      cy: ResourceSvgLength;
      r: ResourceSvgLength;
      fill?: string;
      stroke?: string;
    }
  | {
      kind: "path";
      d: string;
      fill?: string;
      stroke?: string;
      strokeWidth?: ResourceSvgLength;
      strokeLinecap?: "butt" | "inherit" | "round" | "square";
      strokeLinejoin?: "bevel" | "inherit" | "miter" | "round";
    };

/** Serializable SVG icon resource consumed by React icon renderers. */
export interface ResourceSvgIconResource {
  /** SVG viewBox used when the icon is rendered. */
  viewBox: string;
  /** Shape descriptors rendered in order. */
  shapes: readonly ResourceSvgIconShape[];
  /** Optional resource variants keyed by theme name. */
  themes?: Readonly<Record<ResourceSvgIconTheme, ResourceSvgIconResource>>;
}

/** Map of icon resources keyed by public icon name. */
export type ResourceSvgIconMap<TKey extends string = string> = Record<TKey, ResourceSvgIconResource>;

/** Options used when resolving a resource icon. */
export interface ResolveResourceSvgIconOptions {
  /** Optional theme variant key. Most icons inherit theme colors from CSS currentColor. */
  theme?: ResourceSvgIconTheme;
}

/** Resolves a theme-specific icon resource when one is defined. */
export function resolveResourceSvgIcon(
  icon: ResourceSvgIconResource,
  options: ResolveResourceSvgIconOptions = {}
): ResourceSvgIconResource {
  if (!options.theme) {
    return icon;
  }

  return icon.themes?.[options.theme] ?? icon;
}
