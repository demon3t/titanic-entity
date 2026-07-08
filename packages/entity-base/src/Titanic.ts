import type {
  UiPackageDescriptor,
  UiPackageEnumSchema,
  UiPackageEnumValues,
  UiPackageIconModuleSchema,
  UiPackageModuleExports,
  UiPackageSchema
} from "./types";
import {
  getUiPackageEnumRegistryKeys,
  resolveUiPackageEnumSchema
} from "./internal/enumSchemas";

export interface TitanicIconResource {
  viewBox: string;
  shapes: readonly unknown[];
}

export type TitanicIconTree = {
  readonly [key: string]: TitanicIconResource | TitanicIconTree;
};

export type TitanicIconModuleExports = UiPackageModuleExports & {
  icons?: TitanicIconTree;
  entityResourceIcons?: TitanicIconTree;
};

export interface TitanicIconRegistrationOptions {
  moduleName?: string;
  packageName?: string;
}

export interface TitanicEnumRegistrationOptions {
  packageName?: string;
}

export class TitanicIconRegistry {
  [key: string]: unknown;

  readonly all: Record<string, TitanicIconResource> = {};
  readonly groups: Record<string, TitanicIconTree> = {};

  register(
    groupName: string,
    icons: TitanicIconTree,
    options: TitanicIconRegistrationOptions = {}
  ): void {
    const normalizedGroupName = normalizeIconPathPart(groupName);

    if (!normalizedGroupName || !isIconTree(icons)) {
      return;
    }

    const nextGroup = mergeIconTrees(this.groups[normalizedGroupName], icons);
    this.groups[normalizedGroupName] = nextGroup;
    this[normalizedGroupName] = nextGroup;
    flattenIconTree(this.all, nextGroup, [normalizedGroupName], options);
  }

  registerModule(
    moduleName: string,
    moduleExports: UiPackageModuleExports,
    options: Omit<TitanicIconRegistrationOptions, "moduleName"> = {}
  ): void {
    const registrationOptions = {
      ...options,
      moduleName
    };

    Object.entries(moduleExports).forEach(([exportName, exportedValue]) => {
      if (!isIconTree(exportedValue)) {
        return;
      }

      if (exportName === "icons" || exportName === "entityResourceIcons") {
        this.registerGroups(exportedValue, registrationOptions);
        return;
      }

      if (exportName.endsWith("Icons")) {
        this.register(toIconGroupName(exportName), exportedValue, registrationOptions);
      }
    });
  }

  get(path: string): TitanicIconResource | undefined {
    return this.all[path] ?? resolveIconPath(this.groups, path);
  }

  has(path: string): boolean {
    return Boolean(this.get(path));
  }

  clear(): void {
    Object.keys(this.groups).forEach((key) => {
      delete this.groups[key];
      delete this[key];
    });
    Object.keys(this.all).forEach((key) => {
      delete this.all[key];
    });
  }

  private registerGroups(
    icons: TitanicIconTree,
    options: TitanicIconRegistrationOptions
  ): void {
    Object.entries(icons).forEach(([groupName, groupIcons]) => {
      if (isIconTree(groupIcons)) {
        this.register(groupName, groupIcons, options);
      }
    });
  }
}

export class TitanicEnumRegistry {
  [key: string]: unknown;

  readonly all: Record<string, UiPackageEnumValues> = {};

  register<TValues extends UiPackageEnumValues = UiPackageEnumValues>(
    name: string,
    values: TValues,
    options: TitanicEnumRegistrationOptions = {}
  ): TValues {
    for (const key of getUiPackageEnumRegistryKeys({ name, packageName: options.packageName })) {
      this.all[key] = values;
      this[key] = values;
    }

    return values;
  }

  registerSchema(schema: UiPackageEnumSchema): UiPackageEnumValues {
    const values = resolveUiPackageEnumSchema(schema, (key) => this.all[key]);

    for (const key of getUiPackageEnumRegistryKeys(schema)) {
      this.all[key] = values;
      this[key] = values;
    }

    return values;
  }

  get<TValues extends UiPackageEnumValues = UiPackageEnumValues>(
    name: string
  ): TValues | undefined {
    return this.all[name] as TValues | undefined;
  }

  has(name: string): boolean {
    return Boolean(this.get(name));
  }

  clear(): void {
    Object.keys(this.all).forEach((key) => {
      delete this.all[key];
      delete this[key];
    });
  }
}

export class TitanicPackageTools {
  toEnumValues(values: Record<string, string | number>): UiPackageEnumValues {
    return Object.fromEntries(
      Object.entries(values).filter(([key]) => Number.isNaN(Number(key)))
    );
  }
}

export class Titanic {
  static readonly Package = new TitanicPackageTools();
  static readonly icons = new TitanicIconRegistry();
  static readonly enums = new TitanicEnumRegistry();

  static registerPackage(packageDescriptor: UiPackageDescriptor): void {
    packageDescriptor.schemas?.forEach((schema) => {
      this.registerSchema({
        ...schema,
        packageName: schema.packageName ?? packageDescriptor.name
      });
    });
  }

  static registerPackages(packageDescriptors: readonly UiPackageDescriptor[]): void {
    packageDescriptors.forEach((packageDescriptor) => this.registerPackage(packageDescriptor));
  }

  static registerSchema(schema: UiPackageSchema): void {
    if (isIconModuleSchema(schema) && schema.exports) {
      this.icons.registerModule(schema.name, schema.exports, {
        packageName: schema.packageName
      });
    }

    if (isEnumSchema(schema)) {
      this.enums.registerSchema(schema);
    }
  }
}

function isIconModuleSchema(
  schema: UiPackageSchema
): schema is UiPackageIconModuleSchema<TitanicIconModuleExports> {
  return schema.kind === "module" && "resourceType" in schema && schema.resourceType === "icons";
}

function isEnumSchema(schema: UiPackageSchema): schema is UiPackageEnumSchema {
  return schema.kind === "enum";
}

function isIconResource(value: unknown): value is TitanicIconResource {
  return Boolean(value) &&
    typeof value === "object" &&
    typeof (value as { viewBox?: unknown }).viewBox === "string" &&
    Array.isArray((value as { shapes?: unknown }).shapes);
}

function isIconTree(value: unknown): value is TitanicIconTree {
  if (!value || typeof value !== "object" || Array.isArray(value) || isIconResource(value)) {
    return false;
  }

  const entries = Object.entries(value);
  return entries.length > 0 && entries.every(([, item]) => isIconResource(item) || isIconTree(item));
}

function mergeIconTrees(
  target: TitanicIconTree | undefined,
  source: TitanicIconTree
): TitanicIconTree {
  const nextTarget: Record<string, TitanicIconResource | TitanicIconTree> = {
    ...(target ?? {})
  };

  Object.entries(source).forEach(([key, value]) => {
    if (isIconResource(value)) {
      nextTarget[key] = value;
      return;
    }

    const currentValue = nextTarget[key];
    nextTarget[key] = mergeIconTrees(
      currentValue && !isIconResource(currentValue) ? currentValue : undefined,
      value
    );
  });

  return nextTarget;
}

function flattenIconTree(
  target: Record<string, TitanicIconResource>,
  icons: TitanicIconTree,
  path: readonly string[],
  options: TitanicIconRegistrationOptions
): void {
  Object.entries(icons).forEach(([key, value]) => {
    const nextPath = [...path, key];

    if (isIconResource(value)) {
      const iconPath = nextPath.join(".");
      target[iconPath] = value;
      target[key] ??= value;

      if (options.packageName) {
        target[`${options.packageName}.${iconPath}`] = value;
      }

      if (options.moduleName) {
        target[`${options.moduleName}.${iconPath}`] = value;
      }

      return;
    }

    flattenIconTree(target, value, nextPath, options);
  });
}

function resolveIconPath(
  groups: Record<string, TitanicIconTree>,
  path: string
): TitanicIconResource | undefined {
  const pathParts = path.split(".").filter(Boolean);
  let currentValue: TitanicIconTree | TitanicIconResource | undefined = groups;

  for (const pathPart of pathParts) {
    if (!currentValue || isIconResource(currentValue)) {
      return undefined;
    }

    currentValue = currentValue[pathPart];
  }

  return isIconResource(currentValue) ? currentValue : undefined;
}

function toIconGroupName(exportName: string): string {
  const withoutPrefix = exportName.replace(/^entity/, "");
  const withoutSuffix = withoutPrefix.replace(/Icons$/, "");
  const normalizedName = withoutSuffix.charAt(0).toLowerCase() + withoutSuffix.slice(1);

  return normalizedName === "culture" ? "cultures" : normalizedName;
}

function normalizeIconPathPart(value: string): string {
  return value.trim().replace(/^[^a-zA-Z_$]+/, "");
}
