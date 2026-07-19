export const entityReactComponentNames = {
  BaseEntityPage: "BaseEntityPage",
  BaseModalPage: "BaseModalPage",
  BaseSection: "BaseSection",
  BaseEntitySection: "BaseSection",
  Button: "Button",
  EntityEditPage: "BaseEntityPage",
  EntityDataGrid: "EntityDataGrid",
  EntityDataGridRowContextMenu: "EntityDataGridRowContextMenu",
  EntityContainer: "EntityContainer",
  EntityDragDropItem: "EntityDragDropItem",
  EntityExpander: "EntityExpander",
  EntityField: "EntityField",
  EntityForm: "EntityForm",
  EntityGrid: "EntityGrid",
  EntityJsonEditor: "EntityJsonEditor",
  EntityLabel: "EntityLabel",
  LookupInput: "LookupInput",
  EntityPageActionButton: "EntityPageActionButton",
  EntityPageActions: "EntityPageActions",
  EntityRecordsPage: "EntityRecordsPage",
  EntityRecordsSection: "BaseSection",
  DateInput: "DateInput",
  DateTimeInput: "DateTimeInput",
  NumberInput: "NumberInput",
  PackageSiteShell: "PackageSiteShell",
  RandomGifLoader: "RandomGifLoader",
  ResourceSvgIcon: "ResourceSvgIcon",
  SiteCollapsiblePanel: "SiteCollapsiblePanel",
  SiteIconButton: "SiteIconButton",
  SiteIconDropdown: "SiteIconDropdown",
  SiteLayout: "SiteLayout",
  SitePanelToggleButton: "SitePanelToggleButton",
  TimeInput: "TimeInput"
} as const;

export const entityReactTemplateNames = {
  BaseEntityPage: entityReactComponentNames.BaseEntityPage,
  BaseEntitySection: entityReactComponentNames.BaseSection,
  BaseSection: entityReactComponentNames.BaseSection,
  EntityEditPage: entityReactComponentNames.BaseEntityPage,
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
  EntityDataGrid: entityReactComponentNames.EntityDataGrid,
  EntityGrid: entityReactComponentNames.EntityGrid
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
