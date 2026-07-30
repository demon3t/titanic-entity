import {
  coerceEntityColumnKind,
  ConditionOperator,
  EntityColumnKind,
  EntityLogicalOperation,
  getColumnKey,
  normalizeEntityColumn,
  type EntityColumnDefinition,
  type EntityQueryFilter,
  type EntityQueryFilterCollection,
  type EntitySchema,
  type ResolvedEntityColumnSchema
} from "@titanic-entity/entity-core";

export type EntityQueryFilterBuilderItemKind = "condition" | "group";
export type EntityQueryFilterBuilderValueMode = "none" | "single" | "multiple";

export interface EntityQueryFilterBuilderColumnOption {
  key: string;
  path: string;
  label: string;
  kind?: EntityColumnKind;
  column: ResolvedEntityColumnSchema;
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
  remove: string;
  value: string;
  valueListPlaceholder: string;
  valuePlaceholder: string;
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
        kind: coerceEntityColumnKind(column.kind),
        column
      };
    });
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
    comparisonType: operators[0]?.value ?? ConditionOperator.Equal,
    isEnabled: true
  };
}

export function createEntityQueryFilterGroup(
  columns: readonly EntityQueryFilterBuilderColumnOption[] = []
): EntityQueryFilterBuilderGroup {
  return {
    id: createEntityQueryFilterBuilderId("group"),
    kind: "group",
    logicalOperation: EntityLogicalOperation.And,
    isEnabled: true,
    items: [createEntityQueryFilterCondition(columns)]
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

  if (!item.path) {
    return null;
  }

  const valueMode = getOperatorValueMode(item.comparisonType);
  const value = valueMode === "none" ? undefined : normalizeFilterValue(item.value);

  if (valueMode !== "none" && isEmptyFilterValue(value)) {
    return null;
  }

  return {
    path: item.path,
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
