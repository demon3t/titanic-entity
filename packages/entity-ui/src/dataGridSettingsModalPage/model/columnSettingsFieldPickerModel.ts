import type { EntityApiManagerStructureResponse, EntityApiStructureColumnResponse, EntityApiStructureEntityResponse } from "@titanic-entity/entity-api";
import type { EntityDataGridColumnPickerLabels } from "../../dataGrid/data-grid-props";
import type {
  EntityDataGridColumn,
  EntityDataGridColumnSetting
} from "../../dataGrid/data-grid-settings";

export interface ColumnSettingsFieldPickerTrailItem {
  label: string;
  path: string;
  tableName: string;
}

export interface ColumnSettingsFieldPickerItem {
  dbCode: string;
  isReference: boolean;
  label: string;
  path: string;
  propertyName: string;
  referenceEntityLabel?: string;
  referenceTableName?: string;
}

export interface ColumnSettingsAvailableColumnItem {
  isVisible: boolean;
  key: string;
  label: string;
  path?: string;
}

export interface ColumnSettingsFieldPickerState {
  items: ColumnSettingsFieldPickerItem[];
  rootLabel: string;
}

export interface ColumnSettingsFieldPickerPathOption {
  label: string;
  path: string;
  tableName: string;
  trail: ColumnSettingsFieldPickerTrailItem[];
}

export function createGridColumnFromFieldPickerItem<TRow>(
  item: ColumnSettingsFieldPickerItem,
  trail: readonly ColumnSettingsFieldPickerTrailItem[]
): EntityDataGridColumn<TRow> {
  const label = [
    ...trail.map((trailItem) => trailItem.label),
    item.label
  ].join(" / ");

  return {
    key: item.path,
    path: item.path,
    label: label || item.label,
    defaultVisible: false
  };
}

export function createFieldPickerPathOptions(
  structure: EntityApiManagerStructureResponse | null | undefined,
  rootTableName: string | null | undefined,
  labels: EntityDataGridColumnPickerLabels | undefined,
  maxDepth = 5
): ColumnSettingsFieldPickerPathOption[] {
  if (!structure || !rootTableName) {
    return [];
  }

  const entityByTableName = new Map(structure.entities.map((entity) => [entity.tableName, entity]));
  const rootEntity = entityByTableName.get(rootTableName);

  if (!rootEntity) {
    return [];
  }

  const rootLabel = getStructureEntityLabel(rootEntity, rootTableName, labels);
  const options: ColumnSettingsFieldPickerPathOption[] = [{
    label: rootLabel,
    path: "",
    tableName: rootTableName,
    trail: []
  }];
  const visitedPaths = new Set([""]);

  const visitReferenceColumns = (
    entity: EntityApiStructureEntityResponse,
    trail: readonly ColumnSettingsFieldPickerTrailItem[],
    depth: number
  ) => {
    if (depth >= maxDepth) {
      return;
    }

    for (const column of entity.columns) {
      const referenceTableName = column.referenceTableName ?? undefined;

      if (!column.isReference || !referenceTableName) {
        continue;
      }

      const referenceEntity = entityByTableName.get(referenceTableName);

      if (!referenceEntity) {
        continue;
      }

      const parentPath = trail.length > 0 ? trail[trail.length - 1].path : "";
      const path = parentPath ? `${parentPath}.${column.propertyName}` : column.propertyName;

      if (visitedPaths.has(path)) {
        continue;
      }

      const trailItem: ColumnSettingsFieldPickerTrailItem = {
        label: formatReferenceTrailLabel({
          label: getStructureColumnLabel(column, entity.tableName, labels),
          referenceEntityLabel: getStructureEntityLabel(referenceEntity, referenceTableName, labels)
        }),
        path,
        tableName: referenceTableName
      };
      const nextTrail = [...trail, trailItem];

      visitedPaths.add(path);
      options.push({
        label: [rootLabel, ...nextTrail.map((item) => item.label)].join(" / "),
        path,
        tableName: referenceTableName,
        trail: nextTrail
      });
      visitReferenceColumns(referenceEntity, nextTrail, depth + 1);
    }
  };

  visitReferenceColumns(rootEntity, [], 0);

  return options;
}

export function createAvailableColumnPathOptions<TRow>(
  settings: readonly EntityDataGridColumnSetting[],
  columnByKey: ReadonlyMap<string, EntityDataGridColumn<TRow>>,
  rootLabel: string
): ColumnSettingsFieldPickerPathOption[] {
  const options: ColumnSettingsFieldPickerPathOption[] = [{
    label: rootLabel || "Columns",
    path: "",
    tableName: "",
    trail: []
  }];
  const paths = new Set<string>();

  for (const setting of settings) {
    const columnPath = getAvailableColumnPath(setting, columnByKey.get(setting.key));

    if (!columnPath) {
      continue;
    }

    const segments = splitColumnPath(columnPath);

    for (let index = 1; index < segments.length; index += 1) {
      paths.add(segments.slice(0, index).join("."));
    }
  }

  for (const path of [...paths].sort(compareColumnPaths)) {
    const trail = createColumnPathTrail(path);

    options.push({
      label: [options[0].label, ...trail.map((item) => item.label)].join(" / "),
      path,
      tableName: path,
      trail
    });
  }

  return options;
}

export function createFieldPickerState(
  structure: EntityApiManagerStructureResponse | null | undefined,
  rootTableName: string | null | undefined,
  trail: readonly ColumnSettingsFieldPickerTrailItem[],
  searchQuery: string,
  labels: EntityDataGridColumnPickerLabels | undefined
): ColumnSettingsFieldPickerState | null {
  if (!structure || !rootTableName) {
    return null;
  }

  const entityByTableName = new Map(structure.entities.map((entity) => [entity.tableName, entity]));
  const rootEntity = entityByTableName.get(rootTableName);
  const currentTrailItem = trail.length > 0 ? trail[trail.length - 1] : undefined;
  const currentEntity = entityByTableName.get(currentTrailItem?.tableName ?? rootTableName);

  if (!rootEntity || !currentEntity) {
    return null;
  }

  const prefixPath = currentTrailItem?.path ?? "";
  const normalizedSearch = normalizeSearchText(searchQuery);
  const items = currentEntity.columns
    .map((column): ColumnSettingsFieldPickerItem => {
      const path = prefixPath ? `${prefixPath}.${column.propertyName}` : column.propertyName;
      const referenceEntity = column.referenceTableName ? entityByTableName.get(column.referenceTableName) : undefined;

      return {
        dbCode: column.columnName || column.propertyName,
        isReference: column.isReference,
        label: getStructureColumnLabel(column, currentEntity.tableName, labels),
        path,
        propertyName: column.propertyName,
        ...(referenceEntity || column.referenceTableName
          ? { referenceEntityLabel: getStructureEntityLabel(referenceEntity, column.referenceTableName, labels) }
          : {}),
        ...(column.referenceTableName ? { referenceTableName: column.referenceTableName } : {})
      };
    })
    .filter((item) => matchesFieldPickerSearch(item, normalizedSearch));

  return {
    items,
    rootLabel: getStructureEntityLabel(rootEntity, rootTableName, labels)
  };
}

export function filterAvailableColumnSettings<TRow>(
  settings: readonly EntityDataGridColumnSetting[],
  columnByKey: ReadonlyMap<string, EntityDataGridColumn<TRow>>,
  searchQuery: string
): EntityDataGridColumnSetting[] {
  const normalizedSearch = normalizeSearchText(searchQuery);

  if (!normalizedSearch) {
    return [...settings];
  }

  return settings.filter((setting) => {
    const column = columnByKey.get(setting.key);

    return matchesSearchText(normalizedSearch, [
      setting.key,
      setting.label,
      column?.key,
      column?.label,
      column?.path
    ]);
  });
}

export function filterAvailableColumnSettingsByPath<TRow>(
  settings: readonly EntityDataGridColumnSetting[],
  columnByKey: ReadonlyMap<string, EntityDataGridColumn<TRow>>,
  path: string
): EntityDataGridColumnSetting[] {
  const normalizedPath = normalizeColumnPath(path);

  if (!normalizedPath) {
    return [...settings];
  }

  return settings.filter((setting) => {
    const columnPath = getAvailableColumnPath(setting, columnByKey.get(setting.key));

    return columnPath === normalizedPath || Boolean(columnPath?.startsWith(`${normalizedPath}.`));
  });
}

function matchesFieldPickerSearch(item: ColumnSettingsFieldPickerItem, searchQuery: string): boolean {
  return matchesSearchText(searchQuery, [
    item.label,
    item.dbCode,
    item.propertyName,
    item.path,
    item.referenceEntityLabel
  ]);
}

function matchesSearchText(searchQuery: string, values: readonly (string | undefined)[]): boolean {
  if (!searchQuery) {
    return true;
  }

  return values
    .filter((value): value is string => Boolean(value))
    .some((value) => normalizeSearchText(value).includes(searchQuery));
}

function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase();
}

export function formatReferenceTrailLabel(item: Pick<ColumnSettingsFieldPickerItem, "label" | "referenceEntityLabel">): string {
  return item.referenceEntityLabel ? `${item.label} (${item.referenceEntityLabel})` : item.label;
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

export function getAvailableColumnPath<TRow>(
  setting: EntityDataGridColumnSetting,
  column: EntityDataGridColumn<TRow> | undefined
): string | undefined {
  return normalizeColumnPath(setting.path)
    ?? normalizeColumnPath(column?.path)
    ?? normalizeColumnPath(column?.key)
    ?? normalizeColumnPath(setting.key)
    ?? undefined;
}

function createColumnPathTrail(path: string): ColumnSettingsFieldPickerTrailItem[] {
  const segments = splitColumnPath(path);

  return segments.map((segment, index) => {
    const itemPath = segments.slice(0, index + 1).join(".");

    return {
      label: splitTechnicalName(segment),
      path: itemPath,
      tableName: itemPath
    };
  });
}

function splitColumnPath(path: string): string[] {
  return path
    .split(".")
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function normalizeColumnPath(path: string | null | undefined): string | null {
  const normalizedPath = splitColumnPath(path ?? "").join(".");

  return normalizedPath || null;
}

function compareColumnPaths(left: string, right: string): number {
  const leftSegments = splitColumnPath(left);
  const rightSegments = splitColumnPath(right);

  if (leftSegments.length !== rightSegments.length) {
    return leftSegments.length - rightSegments.length;
  }

  return left.localeCompare(right);
}

function splitTechnicalName(value: string): string {
  return value
    .replace(/Entity$/i, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim() || value;
}
