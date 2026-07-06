export const entityReactComponentNames = {
  EntityEditPage: "EntityEditPage",
  EntityDataGrid: "EntityDataGrid",
  EntityDataGridRowContextMenu: "EntityDataGridRowContextMenu",
  EntityField: "EntityField",
  EntityForm: "EntityForm",
  EntityGrid: "EntityGrid",
  EntityJsonEditor: "EntityJsonEditor",
  EntityOrmList: "EntityOrmList",
  EntityPageActionButton: "EntityPageActionButton",
  EntityPageActions: "EntityPageActions",
  EntityRecordsPage: "EntityRecordsPage",
  EntityRecordDetails: "EntityRecordDetails",
  EntityRegistry: "EntityRegistry",
  EntityTable: "EntityTable",
  DateInput: "DateInput",
  NumberInput: "NumberInput",
  PackageSiteShell: "PackageSiteShell",
  RandomGifLoader: "RandomGifLoader",
  ResourceSvgIcon: "ResourceSvgIcon",
  SelectEntity: "SelectEntity",
  SiteCollapsiblePanel: "SiteCollapsiblePanel",
  SiteIconButton: "SiteIconButton",
  SiteIconDropdown: "SiteIconDropdown",
  SiteLayout: "SiteLayout",
  SitePanelToggleButton: "SitePanelToggleButton"
} as const;

export const entityReactTemplateNames = {
  EntityEditPage: entityReactComponentNames.EntityEditPage
} as const;

export const entityReactFieldNames = {
  EntityField: entityReactComponentNames.EntityField,
  DateInput: entityReactComponentNames.DateInput,
  EntityJsonEditor: entityReactComponentNames.EntityJsonEditor,
  NumberInput: entityReactComponentNames.NumberInput,
  SelectEntity: entityReactComponentNames.SelectEntity
} as const;

export const entityReactGridNames = {
  EntityDataGrid: entityReactComponentNames.EntityDataGrid,
  EntityGrid: entityReactComponentNames.EntityGrid,
  EntityOrmList: entityReactComponentNames.EntityOrmList,
  EntityRegistry: entityReactComponentNames.EntityRegistry,
  EntityTable: entityReactComponentNames.EntityTable
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
