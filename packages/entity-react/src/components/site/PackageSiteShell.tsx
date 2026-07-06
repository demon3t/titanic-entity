// Общий shell пакетного UI: рабочие места, разделы, основное окно и правая панель действий.
import { useState, type ReactNode } from "react";
import type { UiPackageSectionSchema, UiPackageWorkspaceSchema } from "@titanic/entity-base";
import type { ResourceSvgIconResource } from "@titanic/entity-resources";
import { SiteCollapsiblePanel } from "./SiteCollapsiblePanel";
import { SiteLayout } from "./SiteLayout";

export interface PackageSiteShellWorkspaceNavigation {
  workspace: UiPackageWorkspaceSchema;
  sections: readonly UiPackageSectionSchema<any>[];
}

export interface PackageSiteShellNavigation {
  defaultSectionName?: string;
  sections: readonly UiPackageSectionSchema<any>[];
  workspaces: readonly PackageSiteShellWorkspaceNavigation[];
}

export type PackageSiteShellRightPanelPlacement = "top" | "middle" | "bottom";

export interface PackageSiteShellRightPanelItem {
  key: string;
  placement: PackageSiteShellRightPanelPlacement;
  element: ReactNode;
}

export interface PackageSiteShellBrand {
  mark: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
}

export interface PackageSiteShellLabels {
  sections: string;
  quickActions: string;
  workspace: string;
  collapseSections: string;
  expandSections: string;
  collapseActions: string;
  expandActions: string;
}

export interface PackageSiteShellClassNames {
  root?: string;
  sectionsCollapsed?: string;
  rightbarCollapsed?: string;
  sectionsPanel?: string;
  rightbarPanel?: string;
  panelHead?: string;
  brand?: string;
  brandMark?: string;
  brandCopy?: string;
  nav?: string;
  navWorkspaces?: string;
  workspaceGroup?: string;
  workspaceGroupActive?: string;
  workspaceNavItem?: string;
  workspaceCopy?: string;
  workspaceSectionList?: string;
  navItem?: string;
  navItemNested?: string;
  navItemActive?: string;
  navIcon?: string;
  navCopy?: string;
  workspacePanel?: string;
  mainWindow?: string;
  rightbarContent?: string;
  rightbarZone?: string;
  rightbarZonePlacement?: (placement: PackageSiteShellRightPanelPlacement) => string;
  panelToggle?: string;
  sectionsPanelToggle?: string;
  rightPanelToggle?: string;
  panelToggleIcon?: (direction: "left" | "right") => string;
}

export interface PackageSiteShellResolvers {
  getWorkspaceTitle?: (workspace: UiPackageWorkspaceSchema) => string;
  getWorkspaceCaption?: (workspace: UiPackageWorkspaceSchema) => string;
  getWorkspaceIcon?: (workspace: UiPackageWorkspaceSchema, title: string) => ReactNode;
  getSectionTitle?: (section: UiPackageSectionSchema<any>) => string;
  getSectionCaption?: (section: UiPackageSectionSchema<any>) => string;
  getSectionIcon?: (section: UiPackageSectionSchema<any>, title: string) => ReactNode;
}

export interface PackageSiteShellNavigationView {
  showSectionCaptions?: boolean;
  showSectionIcons?: boolean;
  showWorkspaceCaptions?: boolean;
  showWorkspaceIcons?: boolean;
}

export interface PackageSiteShellProps {
  activeSectionName: string;
  brand: PackageSiteShellBrand;
  children: ReactNode;
  classNames?: PackageSiteShellClassNames;
  labels: PackageSiteShellLabels;
  navigation: PackageSiteShellNavigation;
  navigationView?: PackageSiteShellNavigationView;
  panelChevronIcon: ResourceSvgIconResource;
  resolvers?: PackageSiteShellResolvers;
  rightPanelCollapsible?: boolean;
  rightPanelItems?: readonly PackageSiteShellRightPanelItem[];
  themeClassName?: string;
  onSectionChange: (sectionName: string) => void;
}

const defaultClassNames = {
  root: "site-shell",
  sectionsCollapsed: "site-shell--sections-collapsed",
  rightbarCollapsed: "site-shell--rightbar-collapsed",
  sectionsPanel: "site-shell__sections",
  rightbarPanel: "site-shell__rightbar",
  panelHead: "site-shell__panel-head",
  brand: "site-shell__brand",
  brandMark: "site-shell__brand-mark",
  brandCopy: "site-shell__brand-copy",
  nav: "site-shell__nav",
  navWorkspaces: "site-shell__nav--workspaces",
  workspaceGroup: "site-shell__workspace-group",
  workspaceGroupActive: "site-shell__workspace-group--active",
  workspaceNavItem: "site-shell__workspace-nav-item",
  workspaceCopy: "site-shell__workspace-copy",
  workspaceSectionList: "site-shell__workspace-section-list",
  navItem: "site-shell__nav-item",
  navItemNested: "site-shell__nav-item--nested",
  navItemActive: "site-shell__nav-item--active",
  navIcon: "site-shell__nav-icon",
  navCopy: "site-shell__nav-copy",
  workspacePanel: "site-shell__workspace",
  mainWindow: "site-shell__main-window",
  rightbarContent: "site-shell__rightbar-content",
  rightbarZone: "site-shell__rightbar-zone",
  panelToggle: "site-shell__panel-toggle",
  sectionsPanelToggle: "site-shell__panel-toggle--sections",
  rightPanelToggle: "site-shell__panel-toggle--right"
} satisfies Required<Omit<PackageSiteShellClassNames, "rightbarZonePlacement" | "panelToggleIcon">>;

export function PackageSiteShell({
  activeSectionName,
  brand,
  children,
  classNames,
  labels,
  navigation,
  navigationView,
  panelChevronIcon,
  resolvers,
  rightPanelCollapsible = true,
  rightPanelItems = [],
  themeClassName,
  onSectionChange
}: PackageSiteShellProps) {
  const [sectionsCollapsed, setSectionsCollapsed] = useState(false);
  const [rightbarCollapsed, setRightbarCollapsed] = useState(false);
  const classes = { ...defaultClassNames, ...classNames };
  const resolvedNavigationView = {
    showSectionCaptions: true,
    showSectionIcons: true,
    showWorkspaceCaptions: true,
    showWorkspaceIcons: true,
    ...navigationView
  } satisfies Required<PackageSiteShellNavigationView>;
  const { sections, workspaces } = navigation;
  const rootClassName = [
    classes.root,
    themeClassName,
    sectionsCollapsed ? classes.sectionsCollapsed : "",
    rightPanelCollapsible && rightbarCollapsed ? classes.rightbarCollapsed : ""
  ].filter(Boolean).join(" ");
  const hasWorkspaces = workspaces.length > 0;

  return (
    <SiteLayout
      className={rootClassName}
      leftPanel={
        <SiteCollapsiblePanel
          ariaLabel={labels.sections}
          className={classes.sectionsPanel}
          collapsed={sectionsCollapsed}
          collapsedIconDirection="right"
          collapseLabel={labels.collapseSections}
          expandedIconDirection="left"
          expandLabel={labels.expandSections}
          header={
            <div className={classes.panelHead}>
              <div className={classes.brand}>
                <span className={classes.brandMark}>{brand.mark}</span>
                <div className={classes.brandCopy}>
                  <strong>{brand.title}</strong>
                  {brand.subtitle ? <span>{brand.subtitle}</span> : null}
                </div>
              </div>
            </div>
          }
          icon={panelChevronIcon}
          togglePlacement="after-header"
          toggleClassName={[classes.panelToggle, classes.sectionsPanelToggle].filter(Boolean).join(" ")}
          toggleIconClassName={(direction) => getPanelToggleIconClassName(classes, direction)}
          onToggle={() => setSectionsCollapsed((value) => !value)}
        >
          <nav className={hasWorkspaces ? [classes.nav, classes.navWorkspaces].join(" ") : classes.nav}>
            {hasWorkspaces ? (
              workspaces.map((item) => renderWorkspaceNavigation({
                activeSectionName,
                classes,
                item,
                navigationView: resolvedNavigationView,
                onSectionChange,
                resolvers
              }))
            ) : (
              sections.map((section) => renderSectionButton({
                activeSectionName,
                classes,
                navigationView: resolvedNavigationView,
                onSectionChange,
                resolvers,
                section
              }))
            )}
          </nav>
        </SiteCollapsiblePanel>
      }
      mainAriaLabel={labels.workspace}
      mainClassName={classes.workspacePanel}
      mainWindowClassName={classes.mainWindow}
      rightPanel={rightPanelCollapsible ? (
        <SiteCollapsiblePanel
          ariaLabel={labels.quickActions}
          className={classes.rightbarPanel}
          collapsed={rightbarCollapsed}
          collapsedIconDirection="left"
          collapseLabel={labels.collapseActions}
          expandedIconDirection="right"
          expandLabel={labels.expandActions}
          header={renderRightbarZone(classes, rightPanelItems, "top")}
          icon={panelChevronIcon}
          togglePlacement="after-header"
          toggleClassName={[classes.panelToggle, classes.rightPanelToggle].filter(Boolean).join(" ")}
          toggleIconClassName={(direction) => getPanelToggleIconClassName(classes, direction)}
          onToggle={() => setRightbarCollapsed((value) => !value)}
        >
          <div className={classes.rightbarContent}>
            {(["middle", "bottom"] as const).map((placement) => renderRightbarZone(classes, rightPanelItems, placement))}
          </div>
        </SiteCollapsiblePanel>
      ) : renderStaticRightPanel(classes, labels, rightPanelItems)}
    >
      {children}
    </SiteLayout>
  );
}

function renderRightbarZone(
  classes: Required<Omit<PackageSiteShellClassNames, "rightbarZonePlacement" | "panelToggleIcon">> & PackageSiteShellClassNames,
  rightPanelItems: readonly PackageSiteShellRightPanelItem[],
  placement: PackageSiteShellRightPanelPlacement
) {
  return (
    <div className={getRightbarZoneClassName(classes, placement)} key={placement}>
      {rightPanelItems
        .filter((item) => item.placement === placement)
        .map((item) => <div key={item.key}>{item.element}</div>)}
    </div>
  );
}

function renderStaticRightPanel(
  classes: Required<Omit<PackageSiteShellClassNames, "rightbarZonePlacement" | "panelToggleIcon">> & PackageSiteShellClassNames,
  labels: PackageSiteShellLabels,
  rightPanelItems: readonly PackageSiteShellRightPanelItem[]
) {
  return (
    <aside className={classes.rightbarPanel} aria-label={labels.quickActions}>
      {renderRightbarZone(classes, rightPanelItems, "top")}
      <div className={classes.rightbarContent}>
        {(["middle", "bottom"] as const).map((placement) => renderRightbarZone(classes, rightPanelItems, placement))}
      </div>
    </aside>
  );
}

function renderWorkspaceNavigation({
  activeSectionName,
  classes,
  item,
  navigationView,
  onSectionChange,
  resolvers
}: {
  activeSectionName: string;
  classes: Required<Omit<PackageSiteShellClassNames, "rightbarZonePlacement" | "panelToggleIcon">> & PackageSiteShellClassNames;
  item: PackageSiteShellWorkspaceNavigation;
  navigationView: Required<PackageSiteShellNavigationView>;
  onSectionChange: (sectionName: string) => void;
  resolvers?: PackageSiteShellResolvers;
}) {
  const firstSection = item.sections[0];
  const workspaceActive = item.sections.some((section) => section.name === activeSectionName);
  const title = resolvers?.getWorkspaceTitle?.(item.workspace) ?? item.workspace.title;
  const caption = resolvers?.getWorkspaceCaption?.(item.workspace) ?? item.workspace.caption ?? "";
  const icon = resolvers?.getWorkspaceIcon?.(item.workspace, title) ?? item.workspace.icon ?? title.trim().slice(0, 1).toUpperCase();

  return (
    <div className={workspaceActive ? [classes.workspaceGroup, classes.workspaceGroupActive].join(" ") : classes.workspaceGroup} key={`${item.workspace.packageName}.${item.workspace.name}`}>
      <button
        className={classes.workspaceNavItem}
        title={title}
        type="button"
        onClick={() => firstSection ? onSectionChange(firstSection.name) : undefined}
      >
        {navigationView.showWorkspaceIcons ? <span className={classes.navIcon}>{icon}</span> : null}
        <span className={classes.workspaceCopy}>
          <span>{title}</span>
          {navigationView.showWorkspaceCaptions && caption ? <small>{caption}</small> : null}
        </span>
      </button>
      <div className={classes.workspaceSectionList}>
        {item.sections.map((section) => renderSectionButton({
          activeSectionName,
          classes,
          navigationView,
          nested: true,
          onSectionChange,
          resolvers,
          section
        }))}
      </div>
    </div>
  );
}

function renderSectionButton({
  activeSectionName,
  classes,
  navigationView,
  nested = false,
  onSectionChange,
  resolvers,
  section
}: {
  activeSectionName: string;
  classes: Required<Omit<PackageSiteShellClassNames, "rightbarZonePlacement" | "panelToggleIcon">> & PackageSiteShellClassNames;
  navigationView: Required<PackageSiteShellNavigationView>;
  nested?: boolean;
  onSectionChange: (sectionName: string) => void;
  resolvers?: PackageSiteShellResolvers;
  section: UiPackageSectionSchema<any>;
}) {
  const sectionTitle = resolvers?.getSectionTitle?.(section) ?? section.title;
  const sectionCaption = resolvers?.getSectionCaption?.(section) ?? section.caption ?? section.entityName ?? "";
  const sectionIcon = resolvers?.getSectionIcon?.(section, sectionTitle) ?? section.icon ?? sectionTitle.trim().slice(0, 1).toUpperCase();
  const className = [
    classes.navItem,
    nested ? classes.navItemNested : "",
    section.name === activeSectionName ? classes.navItemActive : ""
  ].filter(Boolean).join(" ");

  return (
    <button
      className={className}
      key={`${section.packageName}.${section.name}`}
      title={sectionTitle}
      type="button"
      onClick={() => onSectionChange(section.name)}
    >
      {navigationView.showSectionIcons ? <span className={classes.navIcon}>{sectionIcon}</span> : null}
      <span className={classes.navCopy}>
        <span>{sectionTitle}</span>
        {navigationView.showSectionCaptions && sectionCaption ? <small>{sectionCaption}</small> : null}
      </span>
    </button>
  );
}

function getPanelToggleIconClassName(
  classes: PackageSiteShellClassNames,
  direction: "left" | "right"
): string {
  return classes.panelToggleIcon
    ? classes.panelToggleIcon(direction)
    : `site-shell__panel-toggle-icon site-shell__panel-toggle-icon--${direction}`;
}

function getRightbarZoneClassName(
  classes: PackageSiteShellClassNames & typeof defaultClassNames,
  placement: PackageSiteShellRightPanelPlacement
): string {
  const placementClassName = classes.rightbarZonePlacement?.(placement) ?? `site-shell__rightbar-zone--${placement}`;

  return [classes.rightbarZone, placementClassName].filter(Boolean).join(" ");
}
