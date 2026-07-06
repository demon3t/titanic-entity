// Компонент иконки 'ResourceSvgIcon', читающий графику из ресурсов пакета.
import type { ResourceSvgIconResource, ResourceSvgIconShape } from "@titanic-entity/entity-resources";

export interface ResourceSvgIconProps {
  className?: string;
  icon?: ResourceSvgIconResource;
}

export function ResourceSvgIcon({ className, icon }: ResourceSvgIconProps) {
  if (!icon) {
    return null;
  }

  return (
    <svg className={className} aria-hidden="true" viewBox={icon.viewBox} focusable="false">
      {icon.shapes.map(renderIconShape)}
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
