import {
  coerceEntityColumnKind,
  ConditionOperator,
  EntityAggregationType,
  EntityColumnKind,
  EntityLogicalOperation,
  getColumnKey,
  normalizeEntityColumn,
  type EntityColumnDefinition,
  type EntityLookupOptionsSource,
  type EntityQueryFilter,
  type EntityQueryFilterCollection,
  type EntitySchema,
  type ResolvedEntityColumnSchema
} from "@titanic-entity/entity-core";
import type {
  EntityApiManagerStructureResponse,
  EntityApiStructureColumnResponse,
  EntityApiStructureEntityResponse
} from "@titanic-entity/entity-api";
import type { EntityDataGridColumnPickerLabels } from "../dataGrid";
import type {
  ColumnSettingsFieldPickerItem,
  ColumnSettingsFieldPickerPathOption,
  ColumnSettingsFieldPickerState,
  ColumnSettingsFieldPickerTrailItem
} from "../dataGridSettingsModalPage/model/columnSettingsFieldPickerModel";

export type EntityQueryFilterBuilderItemKind = "condition" | "group";
export type EntityQueryFilterBuilderValueMode = "none" | "single" | "multiple";

export interface EntityQueryFilterBuilderColumnOption {
  key: string;
  path: string;
  label: string;
  kind?: EntityColumnKind;
  column: ResolvedEntityColumnSchema;
  aggregationType?: EntityAggregationType;
  filterPath?: string;
  joinDirection?: EntityQueryFilterBuilderJoinDirection;
  relationLabel?: string;
  relationPath?: string;
  rootTableName?: string;
  tableName?: string;
  virtual?: boolean;
}

export type EntityQueryFilterBuilderJoinDirection = "root" | "left" | "right";

export interface EntityQueryFilterBuilderRelationTrailItem extends ColumnSettingsFieldPickerTrailItem {
  dbCode: string;
  isReference: boolean;
  propertyName: string;
  referenceEntityLabel?: string;
  referenceTableName?: string;
  joinDirection?: EntityQueryFilterBuilderJoinDirection;
  relationColumnName?: string;
  relationPropertyName?: string;
  sourceTableName?: string;
}

export interface EntityQueryFilterOperatorOption {
  label: string;
  value: ConditionOperator;
  valueMode: EntityQueryFilterBuilderValueMode;
}

export interface EntityQueryFilterBuilderCondition {
  id: string;
  kind: "condition";
  path: string;
  filterPath?: string;
  joinDirection?: EntityQueryFilterBuilderJoinDirection;
  relationLabel?: string;
  relationPath?: string;
  rootTableName?: string;
  tableName?: string;
  virtual?: boolean;
  comparisonType: ConditionOperator;
  value?: unknown;
  secondValue?: unknown;
  isEnabled?: boolean;
  isNot?: boolean;
}

export interface EntityQueryFilterBuilderGroup {
  id: string;
  kind: "group";
  logicalOperation: EntityLogicalOperation;
  items: EntityQueryFilterBuilderItem[];
  isEnabled?: boolean;
  isNot?: boolean;
}

export type EntityQueryFilterBuilderItem =
  | EntityQueryFilterBuilderCondition
  | EntityQueryFilterBuilderGroup;

export interface EntityQueryFilterBuilderState {
  logicalOperation: EntityLogicalOperation;
  items: EntityQueryFilterBuilderItem[];
  isEnabled?: boolean;
}

export interface EntityQueryFilterBuilderLabels {
  addCondition: string;
  addGroup: string;
  and: string;
  booleanFalse: string;
  booleanTrue: string;
  clear: string;
  disabled: string;
  enabled: string;
  empty: string;
  field: string;
  group: string;
  noFields: string;
  not: string;
  operator: string;
  or: string;
  openFieldPicker: string;
  remove: string;
  rightJoin: string;
  rootObject: string;
  selectedObject: string;
  toggleLogicalOperation: string;
  value: string;
  valueListPlaceholder: string;
  valuePlaceholder: string;
  virtualCount: string;
  operators: Record<ConditionOperator, string>;
}

export type EntityQueryFilterBuilderValue =
  | EntityQueryFilterBuilderState
  | EntityQueryFilterCollection
  | readonly EntityQueryFilter[]
  | null
  | undefined;

let entityQueryFilterBuilderId = 0;

export function createEntityQueryFilterBuilderId(prefix = "filter"): string {
  entityQueryFilterBuilderId += 1;
  return `${prefix}-${entityQueryFilterBuilderId}`;
}

export function createEntityQueryFilterBuilderState(
  value?: EntityQueryFilterBuilderValue
): EntityQueryFilterBuilderState {
  if (isEntityQueryFilterBuilderState(value)) {
    return cloneEntityQueryFilterBuilderState(value);
  }

  const collection = normalizeEntityQueryFilterBuilderValue(value);

  return {
    isEnabled: collection?.isEnabled ?? true,
    logicalOperation: collection?.logicalOperation ?? EntityLogicalOperation.And,
    items: (collection.items ?? []).map(createBuilderItemFromQueryFilter).filter(isBuilderItem)
  };
}

export function createEntityQueryFilterCollection(
  state: EntityQueryFilterBuilderState
): EntityQueryFilterCollection {
  return {
    isEnabled: state.isEnabled ?? true,
    logicalOperation: state.logicalOperation,
    items: createEntityQueryFilters(state)
  };
}

export function createEntityQueryFilters(
  state: EntityQueryFilterBuilderState | EntityQueryFilterBuilderGroup
): EntityQueryFilter[] {
  return state.items
    .map(createEntityQueryFilter)
    .filter((filter): filter is EntityQueryFilter => Boolean(filter));
}

export function createEntityQueryUnsupportedFilters(
  state: EntityQueryFilterBuilderState | EntityQueryFilterBuilderGroup
): EntityQueryFilterBuilderItem[] {
  return state.items.flatMap((item): EntityQueryFilterBuilderItem[] => {
    if (item.kind === "group") {
      const unsupportedItems = createEntityQueryUnsupportedFilters(item);

      return unsupportedItems.length > 0
        ? [{ ...item, items: unsupportedItems }]
        : [];
    }

    const filterPath = item.filterPath ?? item.path;
    return !filterPath || item.virtual ? [item] : [];
  });
}

export function createEntityQueryFilterBuilderColumnOptions(
  input?: EntitySchema | readonly EntityColumnDefinition[] | null
): EntityQueryFilterBuilderColumnOption[] {
  const schema = input as EntitySchema | null | undefined;
  const columns: readonly EntityColumnDefinition[] = Array.isArray(input) ? input : schema?.columns ?? [];

  return columns
    .map((column: EntityColumnDefinition) => normalizeEntityColumn(column))
    .filter((column) => !column.hidden)
    .map((column) => {
      const key = getColumnKey(column);

      return {
        key,
        path: column.path,
        label: column.label ?? key,
        kind: resolveColumnKind(column),
        column,
        filterPath: column.path,
        joinDirection: "root"
      };
    });
}

export function createEntityQueryFilterBuilderStructureColumnOptions(
  structure: EntityApiManagerStructureResponse | null | undefined,
  rootTableName: string | null | undefined,
  labels?: EntityDataGridColumnPickerLabels,
  maxDepth = 5
): EntityQueryFilterBuilderColumnOption[] {
  if (!structure || !rootTableName) {
    return [];
  }

  const options: EntityQueryFilterBuilderColumnOption[] = [];
  const visited = new Set<string>();

  visitStructureContext(structure, rootTableName, [], labels, maxDepth, visited, options);
  return options;
}

export function createEntityQueryFilterCondition(
  columns: readonly EntityQueryFilterBuilderColumnOption[] = []
): EntityQueryFilterBuilderCondition {
  const column = columns[0];
  const operators = getEntityQueryFilterOperatorsForColumn(column?.column);

  return {
    id: createEntityQueryFilterBuilderId("condition"),
    kind: "condition",
    path: column?.path ?? "",
    filterPath: column?.filterPath,
    joinDirection: column?.joinDirection,
    relationLabel: column?.relationLabel,
    relationPath: column?.relationPath,
    rootTableName: column?.rootTableName,
    tableName: column?.tableName,
    virtual: column?.virtual,
    comparisonType: operators[0]?.value ?? ConditionOperator.Equal,
    isEnabled: true
  };
}

export function applyEntityQueryFilterBuilderColumnToCondition(
  condition: EntityQueryFilterBuilderCondition,
  column: EntityQueryFilterBuilderColumnOption | null | undefined,
  labels?: Pick<EntityQueryFilterBuilderLabels, "operators">
): EntityQueryFilterBuilderCondition {
  const operators = getEntityQueryFilterOperatorsForColumn(column?.column, labels);
  const comparisonType = operators.some((operator) => operator.value === condition.comparisonType)
    ? condition.comparisonType
    : operators[0]?.value ?? ConditionOperator.Equal;

  return {
    ...condition,
    path: column?.path ?? "",
    filterPath: column?.filterPath,
    joinDirection: column?.joinDirection,
    relationLabel: column?.relationLabel,
    relationPath: column?.relationPath,
    rootTableName: column?.rootTableName,
    tableName: column?.tableName,
    virtual: column?.virtual,
    comparisonType,
    value: undefined,
    secondValue: undefined
  };
}

export function createEntityQueryFilterFieldPickerPathOptions(
  structure: EntityApiManagerStructureResponse | null | undefined,
  rootTableName: string | null | undefined,
  labels?: EntityDataGridColumnPickerLabels,
  maxDepth = 5
): ColumnSettingsFieldPickerPathOption[] {
  const rootEntity = getStructureEntity(structure, rootTableName);

  if (!structure || !rootTableName || !rootEntity) {
    return [];
  }

  const rootLabel = getStructureEntityLabel(rootEntity, rootTableName, labels);
  const options: ColumnSettingsFieldPickerPathOption[] = [{
    label: rootLabel,
    path: "",
    tableName: rootTableName,
    trail: []
  }];
  const visited = new Set([""]);

  const visit = (tableName: string, trail: readonly EntityQueryFilterBuilderRelationTrailItem[], depth: number) => {
    if (depth >= maxDepth) {
      return;
    }

    for (const relation of createRelationItems(structure, tableName, trail, labels)) {
      if (visited.has(relation.path)) {
        continue;
      }

      const nextTrail = [...trail, relation];
      visited.add(relation.path);
      options.push({
        label: [rootLabel, ...nextTrail.map((item) => item.label)].join(" / "),
        path: relation.path,
        tableName: relation.tableName,
        trail: nextTrail
      });
      visit(relation.tableName, nextTrail, depth + 1);
    }
  };

  visit(rootTableName, [], 0);
  return options;
}

export function createEntityQueryFilterFieldPickerState(
  structure: EntityApiManagerStructureResponse | null | undefined,
  rootTableName: string | null | undefined,
  trail: readonly ColumnSettingsFieldPickerTrailItem[],
  searchQuery: string,
  labels?: EntityDataGridColumnPickerLabels
): ColumnSettingsFieldPickerState | null {
  const currentTrail = trail as readonly EntityQueryFilterBuilderRelationTrailItem[];
  const currentTableName = currentTrail.length > 0 ? currentTrail[currentTrail.length - 1].tableName : rootTableName;
  const currentEntity = getStructureEntity(structure, currentTableName);
  const rootEntity = getStructureEntity(structure, rootTableName);

  if (!structure || !rootTableName || !currentTableName || !currentEntity || !rootEntity) {
    return null;
  }

  const normalizedSearch = normalizeSearchText(searchQuery);
  const prefixPath = currentTrail.length > 0 ? currentTrail[currentTrail.length - 1].path : "";
  const items: ColumnSettingsFieldPickerItem[] = [
    ...createVirtualCountPickerItems(currentTrail, labels),
    ...currentEntity.columns.map((column) => {
      const path = prefixPath ? `${prefixPath}.${column.propertyName}` : column.propertyName;
      const referenceEntity = column.referenceTableName ? getStructureEntity(structure, column.referenceTableName) : undefined;
      const referenceDisplayColumn = column.isReference
        ? getStructureDisplayColumn(referenceEntity)
        : undefined;
      const sortPath = referenceDisplayColumn ? `${path}.${referenceDisplayColumn.propertyName}` : undefined;

      return {
        dbCode: column.columnName || column.propertyName,
        isReference: Boolean(column.isReference && column.referenceTableName),
        label: getStructureColumnLabel(column, currentEntity.tableName, labels),
        path,
        propertyName: column.propertyName,
        ...(referenceEntity || column.referenceTableName
          ? { referenceEntityLabel: getStructureEntityLabel(referenceEntity, column.referenceTableName, labels) }
          : {}),
        ...(column.referenceTableName ? { referenceTableName: column.referenceTableName } : {}),
        ...(sortPath ? { sortPath } : {})
      } satisfies ColumnSettingsFieldPickerItem;
    }),
    ...createRelationItems(structure, currentTableName, currentTrail, labels)
  ].filter((item) => matchesFieldPickerSearch(item, normalizedSearch));

  return {
    items,
    rootLabel: getStructureEntityLabel(rootEntity, rootTableName, labels)
  };
}

export function createEntityQueryFilterBuilderColumnFromPickerItem(
  structure: EntityApiManagerStructureResponse | null | undefined,
  rootTableName: string | null | undefined,
  trail: readonly ColumnSettingsFieldPickerTrailItem[],
  item: ColumnSettingsFieldPickerItem,
  labels?: EntityDataGridColumnPickerLabels
): EntityQueryFilterBuilderColumnOption {
  const relationTrail = trail as readonly EntityQueryFilterBuilderRelationTrailItem[];
  const currentTableName = relationTrail.length > 0 ? relationTrail[relationTrail.length - 1].tableName : rootTableName ?? "";
  const relationLabel = relationTrail.map((trailItem) => trailItem.label).join(" / ");
  const joinDirection = relationTrail.some((trailItem) => trailItem.joinDirection === "right")
    ? "right"
    : relationTrail.length > 0 ? "left" : "root";
  const isVirtualCount = item.propertyName === "__count";
  const label = relationLabel ? `${relationLabel} / ${item.label}` : item.label;
  const referenceEntity = item.referenceTableName ? getStructureEntity(structure, item.referenceTableName) : undefined;
  const lookup = item.isReference
    ? createStructureLookupSource(referenceEntity, item.referenceTableName)
    : undefined;
  const kind = isVirtualCount
    ? EntityColumnKind.Number
    : item.isReference ? EntityColumnKind.Lookup : coerceEntityColumnKind(getStructureColumnKind(item, structure, currentTableName));

  return {
    key: item.path,
    path: item.path,
    label,
    kind,
    column: {
      path: item.path,
      label,
      kind,
      ...(lookup ? { lookup, lookupMode: lookup.mode } : {})
    },
    ...(isVirtualCount ? { aggregationType: EntityAggregationType.Count, virtual: true } : {}),
    filterPath: isVirtualCount ? undefined : item.path,
    joinDirection,
    relationLabel,
    relationPath: relationTrail.length > 0 ? relationTrail[relationTrail.length - 1].path : "",
    rootTableName: rootTableName ?? undefined,
    tableName: currentTableName
  };
}

export function createEntityQueryFilterGroup(
  _columns: readonly EntityQueryFilterBuilderColumnOption[] = []
): EntityQueryFilterBuilderGroup {
  return {
    id: createEntityQueryFilterBuilderId("group"),
    kind: "group",
    logicalOperation: EntityLogicalOperation.And,
    isEnabled: true,
    items: []
  };
}

export function getEntityQueryFilterOperatorsForColumn(
  column?: EntityColumnDefinition | ResolvedEntityColumnSchema | null,
  labels?: Pick<EntityQueryFilterBuilderLabels, "operators">
): EntityQueryFilterOperatorOption[] {
  const kind = coerceEntityColumnKind(column ? normalizeColumnLike(column).kind : undefined) ?? EntityColumnKind.String;
  const operatorLabels = labels?.operators ?? defaultOperatorLabels;
  const operators = getOperatorValuesForKind(kind);

  return operators.map((operator) => ({
    label: operatorLabels[operator] ?? ConditionOperator[operator] ?? String(operator),
    value: operator,
    valueMode: getOperatorValueMode(operator)
  }));
}

export function getEntityQueryFilterOperatorValueMode(
  operator: ConditionOperator
): EntityQueryFilterBuilderValueMode {
  return getOperatorValueMode(operator);
}

export function parseEntityQueryFilterBuilderInputValue(
  value: string,
  operator: ConditionOperator,
  column?: EntityQueryFilterBuilderColumnOption | null
): unknown {
  const mode = getOperatorValueMode(operator);

  if (mode === "none") {
    return undefined;
  }

  if (mode === "multiple") {
    return value
      .split(",")
      .map((part) => parseSingleValue(part.trim(), column))
      .filter((part) => part !== "");
  }

  return parseSingleValue(value, column);
}

export function formatEntityQueryFilterBuilderInputValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => item == null ? "" : String(item)).join(", ");
  }

  return value == null ? "" : String(value);
}

function createEntityQueryFilter(item: EntityQueryFilterBuilderItem): EntityQueryFilter | null {
  if (item.isEnabled === false) {
    return null;
  }

  if (item.kind === "group") {
    const items = createEntityQueryFilters(item);

    if (!items.length) {
      return null;
    }

    return {
      logicalOperation: item.logicalOperation,
      isEnabled: item.isEnabled ?? true,
      ...(item.isNot ? { isNot: true } : {}),
      items
    };
  }

  const filterPath = item.filterPath ?? item.path;

  if (!filterPath || item.virtual) {
    return null;
  }

  const valueMode = getOperatorValueMode(item.comparisonType);
  const value = valueMode === "none" ? undefined : normalizeFilterValue(item.value);

  if (valueMode !== "none" && isEmptyFilterValue(value)) {
    return null;
  }

  return {
    path: filterPath,
    comparisonType: item.comparisonType,
    isEnabled: item.isEnabled ?? true,
    ...(item.isNot ? { isNot: true } : {}),
    ...(valueMode === "none" ? {} : { value }),
    ...(item.secondValue === undefined ? {} : { secondValue: item.secondValue })
  };
}

function createBuilderItemFromQueryFilter(filter: EntityQueryFilter): EntityQueryFilterBuilderItem | null {
  if (filter.items?.length) {
    return {
      id: createEntityQueryFilterBuilderId("group"),
      kind: "group",
      logicalOperation: filter.logicalOperation ?? EntityLogicalOperation.And,
      isEnabled: filter.isEnabled ?? true,
      isNot: filter.isNot,
      items: filter.items.map(createBuilderItemFromQueryFilter).filter(isBuilderItem)
    };
  }

  if (!filter.path) {
    return null;
  }

  return {
    id: createEntityQueryFilterBuilderId("condition"),
    kind: "condition",
    path: filter.path,
    filterPath: filter.path,
    joinDirection: "root",
    comparisonType: filter.comparisonType ?? ConditionOperator.Equal,
    value: filter.value,
    secondValue: filter.secondValue,
    isEnabled: filter.isEnabled ?? true,
    isNot: filter.isNot
  };
}

function isBuilderItem(item: EntityQueryFilterBuilderItem | null): item is EntityQueryFilterBuilderItem {
  return Boolean(item);
}

function cloneEntityQueryFilterBuilderState(
  state: EntityQueryFilterBuilderState
): EntityQueryFilterBuilderState {
  return {
    isEnabled: state.isEnabled ?? true,
    logicalOperation: state.logicalOperation ?? EntityLogicalOperation.And,
    items: state.items.map(cloneEntityQueryFilterBuilderItem)
  };
}

function normalizeEntityQueryFilterBuilderValue(
  value?: EntityQueryFilterBuilderValue
): EntityQueryFilterCollection {
  if (Array.isArray(value)) {
    return { logicalOperation: EntityLogicalOperation.And, items: value };
  }

  if (value && typeof value === "object") {
    return value as EntityQueryFilterCollection;
  }

  return { logicalOperation: EntityLogicalOperation.And, items: [] };
}

function cloneEntityQueryFilterBuilderItem(
  item: EntityQueryFilterBuilderItem
): EntityQueryFilterBuilderItem {
  if (item.kind === "group") {
    return {
      ...item,
      items: item.items.map(cloneEntityQueryFilterBuilderItem)
    };
  }

  return { ...item };
}

function isEntityQueryFilterBuilderState(value: unknown): value is EntityQueryFilterBuilderState {
  if (!value || typeof value !== "object" || !("items" in value)) {
    return false;
  }

  const items = (value as { items?: unknown }).items;
  return Array.isArray(items) && items.some((item) => Boolean(item && typeof item === "object" && "id" in item));
}

function getOperatorValuesForKind(kind: EntityColumnKind): readonly ConditionOperator[] {
  switch (kind) {
    case EntityColumnKind.Number:
    case EntityColumnKind.Date:
    case EntityColumnKind.DateTime:
    case EntityColumnKind.Time:
      return [
        ConditionOperator.Equal,
        ConditionOperator.NotEqual,
        ConditionOperator.GreaterThan,
        ConditionOperator.GreaterThanOrEqual,
        ConditionOperator.LessThan,
        ConditionOperator.LessThanOrEqual,
        ConditionOperator.IsNull,
        ConditionOperator.IsNotNull
      ];
    case EntityColumnKind.Boolean:
      return [
        ConditionOperator.Equal,
        ConditionOperator.NotEqual,
        ConditionOperator.IsNull,
        ConditionOperator.IsNotNull
      ];
    case EntityColumnKind.Lookup:
      return [
        ConditionOperator.Equal,
        ConditionOperator.NotEqual,
        ConditionOperator.In,
        ConditionOperator.NotIn,
        ConditionOperator.IsNull,
        ConditionOperator.IsNotNull
      ];
    case EntityColumnKind.Json:
      return [
        ConditionOperator.Equal,
        ConditionOperator.NotEqual,
        ConditionOperator.Contains,
        ConditionOperator.IsNull,
        ConditionOperator.IsNotNull
      ];
    default:
      return [
        ConditionOperator.Equal,
        ConditionOperator.NotEqual,
        ConditionOperator.Contains,
        ConditionOperator.StartsWith,
        ConditionOperator.EndsWith,
        ConditionOperator.Like,
        ConditionOperator.NotLike,
        ConditionOperator.ILike,
        ConditionOperator.IsNull,
        ConditionOperator.IsNotNull
      ];
  }
}

function getOperatorValueMode(operator: ConditionOperator): EntityQueryFilterBuilderValueMode {
  if (operator === ConditionOperator.IsNull || operator === ConditionOperator.IsNotNull) {
    return "none";
  }

  if (operator === ConditionOperator.In || operator === ConditionOperator.NotIn) {
    return "multiple";
  }

  return "single";
}

function parseSingleValue(value: string, column?: EntityQueryFilterBuilderColumnOption | null): unknown {
  const kind = column?.kind;

  if (kind === EntityColumnKind.Number) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  }

  if (kind === EntityColumnKind.Boolean) {
    return value === "true";
  }

  return value;
}

function normalizeFilterValue(value: unknown): unknown {
  if (!Array.isArray(value)) {
    return value;
  }

  return value.filter((item) => !isEmptyFilterValue(item));
}

function isEmptyFilterValue(value: unknown): boolean {
  return value == null || value === "" || (Array.isArray(value) && value.length === 0);
}

function normalizeColumnLike(
  column: EntityColumnDefinition | ResolvedEntityColumnSchema
): ResolvedEntityColumnSchema {
  if ("path" in column) {
    return normalizeEntityColumn(column as EntityColumnDefinition);
  }

  return column;
}

function resolveColumnKind(column: ResolvedEntityColumnSchema): EntityColumnKind | undefined {
  const kind = coerceEntityColumnKind(column.kind);

  if (kind != null) {
    return kind;
  }

  return column.lookup || column.options?.length ? EntityColumnKind.Lookup : undefined;
}

function visitStructureContext(
  structure: EntityApiManagerStructureResponse,
  tableName: string,
  trail: readonly EntityQueryFilterBuilderRelationTrailItem[],
  labels: EntityDataGridColumnPickerLabels | undefined,
  maxDepth: number,
  visited: Set<string>,
  options: EntityQueryFilterBuilderColumnOption[]
): void {
  const entity = getStructureEntity(structure, tableName);

  if (!entity) {
    return;
  }

  const relationLabel = trail.map((trailItem) => trailItem.label).join(" / ");
  const joinDirection = trail.some((trailItem) => trailItem.joinDirection === "right")
    ? "right"
    : trail.length > 0 ? "left" : "root";

  if (joinDirection === "right") {
    const countPath = `${trail[trail.length - 1]?.path ?? tableName}.__count`;
    if (!visited.has(countPath)) {
      visited.add(countPath);
      options.push({
        key: countPath,
        path: countPath,
        label: relationLabel ? `${relationLabel} / ${getVirtualCountLabel(labels)}` : getVirtualCountLabel(labels),
        kind: EntityColumnKind.Number,
        column: {
          path: countPath,
          label: getVirtualCountLabel(labels),
          kind: EntityColumnKind.Number
        },
        aggregationType: EntityAggregationType.Count,
        joinDirection,
        relationLabel,
        relationPath: trail[trail.length - 1]?.path,
        rootTableName: trail[0]?.sourceTableName ?? tableName,
        tableName,
        virtual: true
      });
    }
  }

  for (const column of entity.columns) {
    const prefixPath = trail.length > 0 ? trail[trail.length - 1].path : "";
    const path = prefixPath ? `${prefixPath}.${column.propertyName}` : column.propertyName;
    const label = relationLabel
      ? `${relationLabel} / ${getStructureColumnLabel(column, entity.tableName, labels)}`
      : getStructureColumnLabel(column, entity.tableName, labels);
    const referenceEntity = column.referenceTableName ? getStructureEntity(structure, column.referenceTableName) : undefined;
    const lookup = column.isReference
      ? createStructureLookupSource(referenceEntity, column.referenceTableName)
      : undefined;
    const kind = column.isReference
      ? EntityColumnKind.Lookup
      : coerceEntityColumnKind(getStructureColumnKindByValue(column.dataValueType));

    if (!visited.has(path)) {
      visited.add(path);
      options.push({
        key: path,
        path,
        label,
        kind,
        column: {
          path,
          label,
          kind,
          ...(lookup ? { lookup, lookupMode: lookup.mode } : {})
        },
        filterPath: path,
        joinDirection,
        relationLabel,
        relationPath: trail[trail.length - 1]?.path,
        rootTableName: trail[0]?.sourceTableName ?? tableName,
        tableName
      });
    }
  }

  if (trail.length >= maxDepth) {
    return;
  }

  for (const relation of createRelationItems(structure, tableName, trail, labels)) {
    if (visited.has(`${relation.path}:context`)) {
      continue;
    }

    visited.add(`${relation.path}:context`);
    visitStructureContext(structure, relation.tableName, [...trail, relation], labels, maxDepth, visited, options);
  }
}

function createRelationItems(
  structure: EntityApiManagerStructureResponse,
  tableName: string,
  trail: readonly EntityQueryFilterBuilderRelationTrailItem[],
  labels: EntityDataGridColumnPickerLabels | undefined
): EntityQueryFilterBuilderRelationTrailItem[] {
  const entity = getStructureEntity(structure, tableName);

  if (!entity) {
    return [];
  }

  const prefixPath = trail.length > 0 ? trail[trail.length - 1].path : "";
  const directRelations = entity.columns
    .filter((column) => column.isReference && Boolean(column.referenceTableName))
    .map((column) => {
      const referenceTableName = String(column.referenceTableName);
      const referenceEntity = getStructureEntity(structure, referenceTableName);
      const path = prefixPath ? `${prefixPath}.${column.propertyName}` : column.propertyName;

      return {
        dbCode: column.columnName || column.propertyName,
        isReference: true,
        label: formatRelationLabel(
          getStructureColumnLabel(column, entity.tableName, labels),
          getStructureEntityLabel(referenceEntity, referenceTableName, labels),
          "left"
        ),
        path,
        propertyName: column.propertyName,
        referenceEntityLabel: getStructureEntityLabel(referenceEntity, referenceTableName, labels),
        referenceTableName,
        tableName: referenceTableName,
        joinDirection: "left" as const,
        relationColumnName: column.columnName,
        relationPropertyName: column.propertyName,
        sourceTableName: entity.tableName
      };
    });

  const reverseRelations = structure.entities.flatMap((candidateEntity) =>
    candidateEntity.columns
      .filter((column) => column.isReference && column.referenceTableName === tableName)
      .map((column) => {
        const candidatePrimaryColumn = getStructurePrimaryColumn(candidateEntity);
        const sourcePrimaryColumn = getStructurePrimaryColumn(entity);
        const reverseSegment = `[${column.propertyName}:${candidatePrimaryColumn?.propertyName ?? "Id"}:${sourcePrimaryColumn?.propertyName ?? "Id"}]`;
        const path = prefixPath
          ? `${prefixPath}.${reverseSegment}`
          : reverseSegment;

        return {
          dbCode: column.columnName || column.propertyName,
          isReference: true,
          label: formatRelationLabel(
            getStructureEntityLabel(candidateEntity, candidateEntity.tableName, labels),
            getStructureColumnLabel(column, candidateEntity.tableName, labels),
            "right"
          ),
          path,
          propertyName: column.propertyName,
          referenceEntityLabel: getStructureEntityLabel(candidateEntity, candidateEntity.tableName, labels),
          referenceTableName: candidateEntity.tableName,
          tableName: candidateEntity.tableName,
          joinDirection: "right" as const,
          relationColumnName: column.columnName,
          relationPropertyName: column.propertyName,
          sourceTableName: tableName
        };
      })
  );

  return [...directRelations, ...reverseRelations];
}

function createVirtualCountPickerItems(
  trail: readonly EntityQueryFilterBuilderRelationTrailItem[],
  labels: EntityDataGridColumnPickerLabels | undefined
): ColumnSettingsFieldPickerItem[] {
  if (!trail.some((trailItem) => trailItem.joinDirection === "right")) {
    return [];
  }

  const currentPath = trail[trail.length - 1]?.path ?? "";
  return [{
    dbCode: "__count",
    isReference: false,
    label: getVirtualCountLabel(labels),
    path: currentPath ? `${currentPath}.__count` : "__count",
    propertyName: "__count"
  }];
}

function getStructureEntity(
  structure: EntityApiManagerStructureResponse | null | undefined,
  tableName: string | null | undefined
): EntityApiStructureEntityResponse | undefined {
  return structure?.entities.find((entity) => entity.tableName === tableName);
}

function getStructureEntityLabel(
  entity: EntityApiStructureEntityResponse | undefined,
  fallbackTableName: string | null | undefined,
  labels: EntityDataGridColumnPickerLabels | undefined
): string {
  const tableName = entity?.tableName ?? fallbackTableName ?? "";
  return labels?.entities?.[tableName] ?? splitTechnicalName(entity?.entityTypeName ?? fallbackTableName ?? "Entity");
}

function getStructureColumnLabel(
  column: EntityApiStructureColumnResponse,
  tableName: string,
  labels: EntityDataGridColumnPickerLabels | undefined
): string {
  const tableLabels = labels?.columns?.[tableName];
  return tableLabels?.[column.propertyName] ?? tableLabels?.[column.columnName] ?? splitTechnicalName(column.propertyName);
}

function getStructureDisplayColumn(
  entity: EntityApiStructureEntityResponse | undefined
): EntityApiStructureColumnResponse | undefined {
  return entity?.columns.find((column) => column.isDisplay)
    ?? entity?.columns.find((column) => ["Name", "DisplayName", "Title"].includes(column.propertyName));
}

function getStructurePrimaryColumn(
  entity: EntityApiStructureEntityResponse | undefined
): EntityApiStructureColumnResponse | undefined {
  return entity?.columns.find((column) => column.isPrimary)
    ?? entity?.columns.find((column) => ["Id", "ID"].includes(column.propertyName));
}

function createStructureLookupSource(
  referenceEntity: EntityApiStructureEntityResponse | undefined,
  referenceTableName: string | null | undefined
): EntityLookupOptionsSource | undefined {
  const tableName = referenceEntity?.tableName ?? referenceTableName;

  if (!tableName) {
    return undefined;
  }

  const primaryColumn = getStructurePrimaryColumn(referenceEntity);
  const displayColumn = getStructureDisplayColumn(referenceEntity) ?? primaryColumn;

  return {
    tableName,
    valueColumn: primaryColumn?.propertyName ?? "Id",
    displayColumn: displayColumn?.propertyName ?? primaryColumn?.propertyName ?? "Id",
    mode: "lookup",
    rowCount: 15
  };
}

function getStructureColumnKind(
  item: ColumnSettingsFieldPickerItem,
  structure: EntityApiManagerStructureResponse | null | undefined,
  tableName: string | null | undefined
): EntityColumnKind {
  if (item.propertyName === "__count") {
    return EntityColumnKind.Number;
  }

  const entity = getStructureEntity(structure, tableName);
  const column = entity?.columns.find((candidate) => candidate.propertyName === item.propertyName);
  return getStructureColumnKindByValue(column?.dataValueType);
}

function getStructureColumnKindByValue(value: string | number | null | undefined): EntityColumnKind {
  const normalized = String(value ?? "").toLowerCase();

  if (["boolean", "bool", "3"].includes(normalized)) {
    return EntityColumnKind.Boolean;
  }

  if (["number", "decimal", "double", "float", "integer", "int", "long", "short", "2"].includes(normalized)) {
    return EntityColumnKind.Number;
  }

  if (["date", "4"].includes(normalized)) {
    return EntityColumnKind.Date;
  }

  if (["datetime", "date-time", "datetimeoffset", "5"].includes(normalized)) {
    return EntityColumnKind.DateTime;
  }

  if (["time", "6"].includes(normalized)) {
    return EntityColumnKind.Time;
  }

  if (["lookup", "reference", "7"].includes(normalized)) {
    return EntityColumnKind.Lookup;
  }

  if (["json", "9"].includes(normalized)) {
    return EntityColumnKind.Json;
  }

  return EntityColumnKind.String;
}

function matchesFieldPickerSearch(item: ColumnSettingsFieldPickerItem, searchQuery: string): boolean {
  if (!searchQuery) {
    return true;
  }

  return [
    item.label,
    item.dbCode,
    item.propertyName,
    item.path,
    item.referenceEntityLabel
  ].filter((value): value is string => Boolean(value))
    .some((value) => normalizeSearchText(value).includes(searchQuery));
}

function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase();
}

function formatRelationLabel(label: string, relatedLabel: string, direction: EntityQueryFilterBuilderJoinDirection): string {
  return direction === "right"
    ? `${relatedLabel} -> ${label}`
    : `${label} -> ${relatedLabel}`;
}

function getVirtualCountLabel(labels: EntityDataGridColumnPickerLabels | undefined): string {
  return labels?.columns?.__virtual?.__count ?? "Count";
}

function splitTechnicalName(value: string): string {
  return value
    .replace(/Entity$/i, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim() || value;
}

const defaultOperatorLabels: Record<ConditionOperator, string> = {
  [ConditionOperator.Equal]: "=",
  [ConditionOperator.NotEqual]: "!=",
  [ConditionOperator.GreaterThan]: ">",
  [ConditionOperator.GreaterThanOrEqual]: ">=",
  [ConditionOperator.LessThan]: "<",
  [ConditionOperator.LessThanOrEqual]: "<=",
  [ConditionOperator.In]: "in",
  [ConditionOperator.NotIn]: "not in",
  [ConditionOperator.Like]: "like",
  [ConditionOperator.NotLike]: "not like",
  [ConditionOperator.ILike]: "ilike",
  [ConditionOperator.IsNull]: "is null",
  [ConditionOperator.IsNotNull]: "is not null",
  [ConditionOperator.Contains]: "contains",
  [ConditionOperator.StartsWith]: "starts with",
  [ConditionOperator.EndsWith]: "ends with"
};
