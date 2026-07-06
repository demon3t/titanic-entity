// Базовый layout сайта: левая панель, рабочая область и правая панель.
import type { ReactNode } from "react";

export interface SiteLayoutProps {
  children: ReactNode;
  className: string;
  leftPanel: ReactNode;
  mainAriaLabel: string;
  mainClassName: string;
  mainWindowClassName: string;
  rightPanel: ReactNode;
}

export function SiteLayout({
  children,
  className,
  leftPanel,
  mainAriaLabel,
  mainClassName,
  mainWindowClassName,
  rightPanel
}: SiteLayoutProps) {
  return (
    <div className={className}>
      {leftPanel}
      <section className={mainClassName} aria-label={mainAriaLabel}>
        <div className={mainWindowClassName}>{children}</div>
      </section>
      {rightPanel}
    </div>
  );
}
