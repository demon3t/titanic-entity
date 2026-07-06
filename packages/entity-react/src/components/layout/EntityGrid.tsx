import type { CSSProperties } from "react";
import type { EntityGridProps } from "./models/EntityGridProps";

export type { EntityGridProps } from "./models/EntityGridProps";

/**
 * Grid-layout для Entity UI-компонентов.
 */
export function EntityGrid({ columns = 24, gap = 12, children, className = "" }: EntityGridProps) {
  return (
    <div
      className={`titanic-grid ${className}`}
      style={getGridStyle(columns, gap)}
    >
      {children}
    </div>
  );
}

function getGridStyle(columns: number, gap: number): CSSProperties {
  return {
    "--titanic-grid-columns": columns,
    "--titanic-grid-gap": `${gap}px`
  } as CSSProperties;
}
