import { Titanic } from "@titanic-entity/entity-react";
import type { CSSProperties } from "react";
import type { GridProps } from "./index";

export const Grid = Titanic.define<GridProps>("Titanic.UI.Grid", function Grid({
  ariaLabel,
  ariaLabelledBy,
  children,
  className,
  columns = 24,
  gap = 12,
  id,
  role,
  style,
  tabIndex,
  title,
  visible = true,
  onClick
}: GridProps) {
  if (!visible) {
    return null;
  }

  const gridStyle = {
    "--titanic-grid-columns": columns,
    "--titanic-grid-gap": `${gap}px`,
    ...style
  } as CSSProperties;

  return (
    <div
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={["titanic-grid", className].filter(Boolean).join(" ")}
      id={id}
      role={role}
      style={gridStyle}
      tabIndex={tabIndex}
      title={title}
      onClick={onClick}
    >
      {children}
    </div>
  );
});
