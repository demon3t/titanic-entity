import type { EntityApiManagerStructureResponse, EntityApiStructureColumnResponse, EntityApiStructureEntityResponse } from "@titanic-entity/entity-api";
import type { EntityDataGridColumnPickerLabels } from "../../data-grid/EntityDataGridProps";
import type {
  EntityDataGridColumn,
  EntityDataGridColumnSetting
} from "../../data-grid/EntityDataGridSettings";

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
}

export interface ColumnSettingsFieldPickerState {
  items: ColumnSettingsFieldPickerItem[];
  rootLabel: string;
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

function splitTechnicalName(value: string): string {
  return value
    .replace(/Entity$/i, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim() || value;
}
