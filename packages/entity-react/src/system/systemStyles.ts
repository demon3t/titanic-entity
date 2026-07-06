// Общие настройки системных стилей, которые хранятся в Entity ORM API.
import {
  createEntityGuid,
  entityQuery,
  getEntityValue,
  type EntityApiClient,
  type EntityApiEntity
} from "@titanic/entity-api";
import type { EntityDataGridColumn } from "../grids";
import type { EntityRecordPageConfig } from "../components/records/EntityRecordsPage";
import { EntityFieldKind, type EntityJsonRequiredField, type EntitySchema, type EntityValues } from "@titanic/entity-core";

export const systemStyleTableName = "sys_style";
export const systemStyleOrderColumn = "SortOrder";
export const systemStylePrimaryColumn = "Id";
export const systemStyleDisplayColumn = "Name";
export const systemStyleColumnPaths = [
  "Id",
  "Code",
  "Name",
  "Description",
  "ValuesJson",
  "IsSystem",
  "IsDefault",
  "SortOrder"
] as const;

export type SystemStyleColumnPath = typeof systemStyleColumnPaths[number];
export type SystemStyleFieldLabels = Record<SystemStyleColumnPath, string>;

export interface SystemStyleValues {
  theme?: string;
  tokens?: Record<string, string | number | boolean | null | undefined>;
}

export interface SystemStyleOption {
  id: string;
  code: string;
  name: string;
  description: string;
  valuesJson: string;
  values: SystemStyleValues;
  isDefault: boolean;
  sortOrder: number;
}

export const systemStyleRequiredJsonFields = [
  { path: "theme", defaultValue: "custom", label: "Theme" },
  { path: "tokens.background", defaultValue: "#f1f3f6", label: "Background" },
  { path: "tokens.surface", defaultValue: "#ffffff", label: "Surface" },
  { path: "tokens.surfaceMuted", defaultValue: "#f8fafc", label: "Muted surface" },
  { path: "tokens.text", defaultValue: "#111827", label: "Text" },
  { path: "tokens.mutedText", defaultValue: "#64748b", label: "Muted text" },
  { path: "tokens.accent", defaultValue: "#1f2937", label: "Accent" },
  { path: "tokens.accentHover", defaultValue: "#111827", label: "Accent hover" },
  { path: "tokens.accentText", defaultValue: "#ffffff", label: "Accent text" },
  { path: "tokens.border", defaultValue: "#cbd5e1", label: "Border" },
  { path: "tokens.borderMuted", defaultValue: "#d8dee8", label: "Muted border" },
  { path: "tokens.hover", defaultValue: "#eef2f7", label: "Hover" },
  { path: "tokens.focusRing", defaultValue: "rgba(51, 65, 85, 0.14)", label: "Focus ring" },
  { path: "tokens.danger", defaultValue: "#922f2f", label: "Danger" },
  { path: "tokens.dangerBorder", defaultValue: "#d6a5a5", label: "Danger border" },
  { path: "tokens.dangerSurface", defaultValue: "#fff3f2", label: "Danger surface" },
  { path: "tokens.shadow", defaultValue: "0 8px 24px rgba(15, 23, 42, 0.07)", label: "Shadow" }
] satisfies readonly EntityJsonRequiredField[];

export const systemStyleRecordConfig = {
  tableName: systemStyleTableName,
  primaryColumn: systemStylePrimaryColumn,
  displayColumn: systemStyleDisplayColumn,
  orderColumn: systemStyleOrderColumn
} satisfies EntityRecordPageConfig;

export function createSystemStyleSchema(labels: SystemStyleFieldLabels, title: string): EntitySchema {
  return {
    tableName: systemStyleTableName,
    primaryColumn: systemStylePrimaryColumn,
    displayColumn: systemStyleDisplayColumn,
    title,
    columns: [
      {
        path: "Id",
        label: labels.Id,
        readOnly: true,
        hidden: true,
        defaultValue: createEntityGuid()
      },
      {
        path: "Code",
        label: labels.Code,
        required: true,
        gridSpan: 12,
        maxLength: 64
      },
      {
        path: "Name",
        label: labels.Name,
        required: true,
        gridSpan: 12,
        maxLength: 128
      },
      {
        path: "Description",
        label: labels.Description,
        kind: EntityFieldKind.Text,
        gridSpan: 24
      },
      {
        path: "ValuesJson",
        label: labels.ValuesJson,
        kind: EntityFieldKind.Json,
        required: true,
        gridSpan: 24,
        defaultValue: "{}",
        jsonEditor: {
          defaultMode: "fields",
          requiredFields: systemStyleRequiredJsonFields
        }
      },
      {
        path: "IsSystem",
        label: labels.IsSystem,
        kind: EntityFieldKind.Boolean,
        readOnly: true,
        gridSpan: 12,
        defaultValue: false
      },
      {
        path: "IsDefault",
        label: labels.IsDefault,
        kind: EntityFieldKind.Boolean,
        gridSpan: 12,
        defaultValue: false
      },
      {
        path: "SortOrder",
        label: labels.SortOrder,
        kind: EntityFieldKind.Number,
        gridSpan: 12,
        defaultValue: 100
      }
    ]
  };
}

export function createSystemStyleGridColumns(labels: SystemStyleFieldLabels): readonly EntityDataGridColumn<EntityApiEntity>[] {
  return systemStyleColumnPaths.map((path) => ({
    key: path,
    path,
    label: labels[path] ?? path,
    defaultVisible: path !== "Id" && path !== "Description" && path !== "ValuesJson",
    required: path === systemStylePrimaryColumn
  }));
}

export async function loadSystemStyles(client: EntityApiClient): Promise<SystemStyleOption[]> {
  const rows = await client.select(entityQuery(systemStyleTableName)
    .select(...systemStyleColumnPaths)
    .orderBy(systemStyleOrderColumn)
    .orderBy(systemStyleDisplayColumn)
    .take(100));

  return rows
    .map(mapSystemStyleRow)
    .filter((style): style is SystemStyleOption => Boolean(style?.code));
}

export function getDefaultSystemStyleCode(styles: readonly SystemStyleOption[], fallbackCode = "light"): string {
  return styles.find((style) => style.isDefault)?.code ?? styles[0]?.code ?? fallbackCode;
}

export function resolveSystemStyle(
  styles: readonly SystemStyleOption[],
  code: string | null | undefined,
  fallbackCode = "light"
): SystemStyleOption | null {
  return styles.find((style) => style.code === code) ??
    styles.find((style) => style.code === getDefaultSystemStyleCode(styles, fallbackCode)) ??
    styles[0] ??
    null;
}

export function applySystemStyleTokens(
  target: HTMLElement,
  style: SystemStyleOption | null,
  appliedVariables: Iterable<string> = []
): string[] {
  for (const variableName of appliedVariables) {
    target.style.removeProperty(variableName);
  }

  if (!style) {
    target.removeAttribute("data-demo-theme");
    return [];
  }

  target.dataset.demoTheme = style.code;

  const nextVariables: string[] = [];
  for (const [tokenName, tokenValue] of Object.entries(style.values.tokens ?? {})) {
    if (tokenValue === null || tokenValue === undefined) {
      continue;
    }

    const variableName = toSystemStyleCssVariableName(tokenName);
    target.style.setProperty(variableName, String(tokenValue));
    nextVariables.push(variableName);
  }

  return nextVariables;
}

export async function clearOtherDefaultSystemStyles(client: EntityApiClient, saveValues: EntityValues): Promise<void> {
  if (!isTruthyValue(saveValues.IsDefault)) {
    return;
  }

  const nextDefaultId = saveValues.Id ? String(saveValues.Id) : "";
  const currentDefaultRows = await client.select(entityQuery(systemStyleTableName)
    .select(systemStylePrimaryColumn, "IsDefault")
    .where("IsDefault", true)
    .take(20));
  const rowsToClear = currentDefaultRows.filter((row) => {
    const rowId = getEntityValue<string>(row, systemStylePrimaryColumn);

    return rowId && rowId !== nextDefaultId;
  });

  await Promise.all(rowsToClear.map((row) => client.save(systemStyleTableName, {
    [systemStylePrimaryColumn]: getEntityValue<string>(row, systemStylePrimaryColumn),
    IsDefault: false
  })));
}

export function isTruthyValue(value: unknown): boolean {
  return value === true || value === 1 || value === "1" ||
    (typeof value === "string" && value.toLowerCase() === "true");
}

function mapSystemStyleRow(row: EntityApiEntity): SystemStyleOption | null {
  const id = getEntityValue<string>(row, "Id") ?? "";
  const code = getEntityValue<string>(row, "Code") ?? "";
  const valuesJson = getEntityValue<string>(row, "ValuesJson") ?? "{}";

  if (!id || !code) {
    return null;
  }

  return {
    id,
    code,
    name: getEntityValue<string>(row, "Name") ?? code,
    description: getEntityValue<string>(row, "Description") ?? "",
    valuesJson,
    values: parseSystemStyleValues(valuesJson),
    isDefault: isTruthyValue(getEntityValue<unknown>(row, "IsDefault")),
    sortOrder: Number(getEntityValue<unknown>(row, "SortOrder") ?? 0)
  };
}

function parseSystemStyleValues(valuesJson: string): SystemStyleValues {
  try {
    const parsed = JSON.parse(valuesJson) as SystemStyleValues;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function toSystemStyleCssVariableName(tokenName: string): string {
  return `--titanic-style-${tokenName
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()}`;
}
