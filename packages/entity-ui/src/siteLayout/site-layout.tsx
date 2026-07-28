import { defineComponentSchema } from "@titanic-entity/entity-base";
import { Titanic } from "@titanic-entity/entity-react";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";// Базовый layout сайта: левая панель, рабочая область и правая панель.
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

export const SiteLayout = Titanic.define<SiteLayoutProps>("Titanic.UI.SiteLayout", function SiteLayout({
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
});

export const siteLayoutComponentSchema = defineComponentSchema<SiteLayoutProps>({
  kind: "component",
  name: entityReactComponentNames.SiteLayout,
  component: SiteLayout
});
