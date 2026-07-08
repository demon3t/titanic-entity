import type { UiPackageEnumSchema, UiPackageEnumValues } from "../types";

export interface UiPackageEnumRegistryKeyOptions {
  includeShortName?: boolean;
}

export function resolveUiPackageEnumSchema<TValues extends UiPackageEnumValues>(
  schema: UiPackageEnumSchema<TValues>,
  getRegisteredValues: (key: string) => UiPackageEnumValues | undefined
): TValues {
  const baseValues = findUiPackageBaseEnum(schema, getRegisteredValues) as TValues | undefined;

  if (schema.extension) {
    return schema.extension({
      name: schema.name,
      packageName: schema.packageName,
      schema,
      baseValues
    });
  }

  return {
    ...(baseValues ?? {}),
    ...(schema.values ?? {})
  } as TValues;
}

export function getUiPackageEnumBaseKeys(
  schema: Pick<UiPackageEnumSchema, "name" | "replaces">
): string[] {
  const keys = new Set<string>();

  if (schema.replaces) {
    keys.add(schema.replaces);
    keys.add(getShortSchemaName(schema.replaces));
  }

  keys.add(schema.name);
  keys.add(getShortSchemaName(schema.name));

  return [...keys];
}

export function getUiPackageEnumRegistryKeys(
  schema: Pick<UiPackageEnumSchema, "name" | "packageName" | "replaces">,
  options: UiPackageEnumRegistryKeyOptions = {}
): string[] {
  const { includeShortName = true } = options;
  const keys = new Set<string>();

  keys.add(schema.name);

  if (includeShortName) {
    keys.add(getShortSchemaName(schema.name));
  }

  if (schema.packageName) {
    keys.add(`${schema.packageName}.${schema.name}`);
  }

  if (schema.replaces) {
    keys.add(schema.replaces);
    keys.add(getShortSchemaName(schema.replaces));
  }

  return [...keys];
}

export function getShortSchemaName(name: string): string {
  const parts = name.split(".");
  return parts[parts.length - 1] ?? name;
}

function findUiPackageBaseEnum<TValues extends UiPackageEnumValues>(
  schema: UiPackageEnumSchema<TValues>,
  getRegisteredValues: (key: string) => UiPackageEnumValues | undefined
): UiPackageEnumValues | undefined {
  for (const key of getUiPackageEnumBaseKeys(schema)) {
    const values = getRegisteredValues(key);

    if (values) {
      return values;
    }
  }

  return undefined;
}
