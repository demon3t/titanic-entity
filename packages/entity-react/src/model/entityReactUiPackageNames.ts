export const entityReactComponentNames = {
  ActionBar: "ActionBar",
  AlertModalPage: "AlertModalPage",
  ApprovalModalPage: "ApprovalModalPage",
  BasePage: "BasePage",
  BaseModalPage: "BaseModalPage",
  BaseSection: "BaseSection",
  BaseEntitySection: "BaseSection",
  Button: "Button",
  CollapsiblePanel: "CollapsiblePanel",
  EntityEditPage: "BasePage",
  EntityQueryFilterBuilder: "EntityQueryFilterBuilder",
  DataGrid: "DataGrid",
  EntityDataGridRowContextMenu: "EntityDataGridRowContextMenu",
  Container: "Container",
  EntityDragDropItem: "EntityDragDropItem",
  Expander: "Expander",
  EntityExpander: "Expander",
  EntityField: "EntityField",
  EntityForm: "EntityForm",
  Grid: "Grid",
  EntityJsonEditor: "EntityJsonEditor",
  Label: "Label",
  LookupInput: "LookupInput",
  NavigationTrail: "NavigationTrail",
  EntityRecordsSection: "BaseSection",
  DateInput: "DateInput",
  DateTimeInput: "DateTimeInput",
  NumberInput: "NumberInput",
  PackageSiteShell: "PackageSiteShell",
  RandomGifLoader: "RandomGifLoader",
  ResourceSvgIcon: "ResourceSvgIcon",
  SiteIconButton: "SiteIconButton",
  SiteIconDropdown: "SiteIconDropdown",
  SiteLayout: "SiteLayout",
  SitePanelToggleButton: "SitePanelToggleButton",
  TimeInput: "TimeInput"
} as const;

export const entityReactTemplateNames = {
  BasePage: entityReactComponentNames.BasePage,
  BaseEntitySection: entityReactComponentNames.BaseSection,
  BaseSection: entityReactComponentNames.BaseSection,
  EntityEditPage: entityReactComponentNames.BasePage,
  EntityRecordsSection: entityReactComponentNames.BaseSection
} as const;

export const entityReactFieldNames = {
  EntityField: entityReactComponentNames.EntityField,
  DateInput: entityReactComponentNames.DateInput,
  DateTimeInput: entityReactComponentNames.DateTimeInput,
  EntityJsonEditor: entityReactComponentNames.EntityJsonEditor,
  LookupInput: entityReactComponentNames.LookupInput,
  NumberInput: entityReactComponentNames.NumberInput,
  TimeInput: entityReactComponentNames.TimeInput
} as const;

export const entityReactGridNames = {
  DataGrid: entityReactComponentNames.DataGrid,
  Grid: entityReactComponentNames.Grid
} as const;

export const entityReactEnumNames = {
  ConditionOperator: "ConditionOperator",
  EntityAggregationType: "EntityAggregationType",
  EntityApiBatchExecutionMode: "EntityApiBatchExecutionMode",
  EntityApiOperationType: "EntityApiOperationType",
  EntityFieldKind: "EntityFieldKind",
  EntityLogicalOperation: "EntityLogicalOperation",
  EntityOrderDirection: "EntityOrderDirection"
} as const;
