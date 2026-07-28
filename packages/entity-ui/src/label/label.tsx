import { Titanic } from "@titanic-entity/entity-react";
import { isValidElement, type ElementType, type ReactNode } from "react";
import type { LabelProps } from "./index";

export const Label = Titanic.define<LabelProps>("Titanic.UI.Label", function Label({
  as = "div",
  children,
  className,
  column,
  htmlFor,
  id,
  role,
  style,
  title,
  value,
  values,
  visible = true,
  onClick
}: LabelProps) {
  if (!visible) {
    return null;
  }

  const Component = as as ElementType;
  const columnKey = column?.alias || column?.path || "";
  let content: ReactNode = null;

  if (value !== undefined && value !== null) {
    content = value;
  } else if (column && values && Object.prototype.hasOwnProperty.call(values, columnKey)) {
    content = toReactNode(values[columnKey]);
  } else if (children !== undefined && children !== null) {
    content = children;
  } else if (column) {
    content = column.label || columnKey;
  }

  return (
    <Component
      className={[
        "titanic-label",
        onClick ? "titanic-label_clickable" : undefined,
        className
      ].filter(Boolean).join(" ")}
      htmlFor={as === "label" ? htmlFor : undefined}
      id={id}
      role={role}
      style={style}
      title={title}
      onClick={onClick}
    >
      {content}
    </Component>
  );
});

function toReactNode(value: unknown): ReactNode {
  if (value === null || value === undefined) {
    return null;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    isValidElement(value)
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(toReactNode);
  }

  return String(value);
}
