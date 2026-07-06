import type { ReactNode } from "react";

/**
 * Props grid-layout компонента Entity UI.
 */
export interface EntityGridProps {
  /** Количество колонок grid. */
  columns?: number;

  /** Расстояние между элементами grid. */
  gap?: number;

  /** Дочерние элементы grid. */
  children: ReactNode;

  /** Дополнительный CSS class. */
  className?: string;
}