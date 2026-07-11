import {
  resolveResourceSvgIcon,
  type ResourceSvgIconResource,
  type ResourceSvgIconShape,
  type ResourceSvgIconTheme
} from "@titanic-entity/entity-resources";
import { Titanic } from "@titanic-entity/entity-base";

/** Props for rendering a serializable resource SVG icon. */
export interface ResourceSvgIconProps {
  /** Optional CSS class applied to the rendered SVG element. */
  className?: string;
  /** Icon resource descriptor or registered icon path. */
  icon?: ResourceSvgIconResource | string | null;
  /** Optional explicit theme variant. Most icons inherit theme colors from CSS currentColor. */
  theme?: ResourceSvgIconTheme;
}

/** Renders an SVG icon from Titanic resource descriptors. */
export function ResourceSvgIcon({ className, icon, theme }: ResourceSvgIconProps) {
  const iconResource = typeof icon === "string"
    ? Titanic.Icons.get(icon, { theme })
    : icon ?? Titanic.Icons.getDefault({ theme });
  const resolvedIcon = resolveResourceSvgIcon(iconResource as ResourceSvgIconResource | null | undefined, { theme });

  return (
    <svg className={className} aria-hidden="true" viewBox={resolvedIcon.viewBox} focusable="false">
      {resolvedIcon.shapes.map(renderIconShape)}
    </svg>
  );
}

function renderIconShape(shape: ResourceSvgIconShape, index: number) {
  switch (shape.kind) {
    case "circle": {
      const { kind: _kind, ...shapeProps } = shape;
      return <circle key={index} {...shapeProps} />;
    }
    case "path": {
      const { kind: _kind, ...shapeProps } = shape;
      return <path key={index} {...shapeProps} />;
    }
    default: {
      const { kind: _kind, ...shapeProps } = shape;
      return <rect key={index} {...shapeProps} />;
    }
  }
}
