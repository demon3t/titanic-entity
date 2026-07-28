export enum EntityColumnKind {
  String,
  Text,
  Number,
  Boolean,
  Date,
  DateTime,
  Time,
  Lookup,
  Color,
  Json
}

export type EntityColumnKindLegacyValue =
  | "string"
  | "text"
  | "number"
  | "boolean"
  | "date"
  | "datetime"
  | "dateTime"
  | "time"
  | "lookup"
  | "color"
  | "json";

export type EntityColumnKindInput =
  | EntityColumnKind
  | keyof typeof EntityColumnKind
  | EntityColumnKindLegacyValue;

const legacyKindMap: Record<string, EntityColumnKind> = {
  string: EntityColumnKind.String,
  text: EntityColumnKind.Text,
  number: EntityColumnKind.Number,
  boolean: EntityColumnKind.Boolean,
  date: EntityColumnKind.Date,
  datetime: EntityColumnKind.DateTime,
  time: EntityColumnKind.Time,
  lookup: EntityColumnKind.Lookup,
  color: EntityColumnKind.Color,
  json: EntityColumnKind.Json
};

const kindCssNames: Record<EntityColumnKind, string> = {
  [EntityColumnKind.String]: "string",
  [EntityColumnKind.Text]: "text",
  [EntityColumnKind.Number]: "number",
  [EntityColumnKind.Boolean]: "boolean",
  [EntityColumnKind.Date]: "date",
  [EntityColumnKind.DateTime]: "datetime",
  [EntityColumnKind.Time]: "time",
  [EntityColumnKind.Lookup]: "lookup",
  [EntityColumnKind.Color]: "color",
  [EntityColumnKind.Json]: "json"
};

export function coerceEntityColumnKind(
  kind: EntityColumnKindInput | null | undefined
): EntityColumnKind | undefined {
  if (kind === null || kind === undefined) {
    return undefined;
  }

  if (typeof kind === "number") {
    return typeof EntityColumnKind[kind] === "string" ? kind : undefined;
  }

  const enumValue = EntityColumnKind[kind as keyof typeof EntityColumnKind];
  if (typeof enumValue === "number") {
    return enumValue;
  }

  const normalizedKind = kind.trim();
  return legacyKindMap[normalizedKind] ?? legacyKindMap[normalizedKind.toLowerCase()];
}

export function getEntityColumnKindCssName(kind: EntityColumnKindInput | null | undefined): string {
  return kindCssNames[coerceEntityColumnKind(kind) ?? EntityColumnKind.String];
}
