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

/** Describes an icon resource that can be registered in the Titanic icon registry. */
export interface TitanicIconResource {
  /** SVG viewBox used when the icon is rendered. */
  viewBox: string;
  /** Shape descriptors used by the renderer package. */
  shapes: readonly unknown[];
  /** Optional icon variants keyed by theme name. */
  themes?: Readonly<Record<string, TitanicIconResource>>;
}

/** Nested collection of icon resources grouped by public resource path. */
export type TitanicIconTree = {
  readonly [key: string]: TitanicIconResource | TitanicIconTree;
};

/** Module exports shape accepted by the Titanic icon registry. */
export type TitanicIconModuleExports = UiPackageModuleExports & {
  icons?: TitanicIconTree;
  entityResourceIcons?: TitanicIconTree;
};

/** Options used when icon resources are registered. */
export interface TitanicIconRegistrationOptions {
  /** Optional module name added as an additional lookup prefix. */
  moduleName?: string;
  /** Optional package name added as an additional lookup prefix. */
  packageName?: string;
}

/** Options used when enum resources are registered. */
export interface TitanicEnumRegistrationOptions {
  /** Optional package name added as an additional lookup prefix. */
  packageName?: string;
}

/** Options used when resolving an icon resource. */
export interface TitanicIconResolveOptions {
  /** Optional theme variant key. Icons usually inherit theme colors from CSS. */
  theme?: string;
}

/** Registers and resolves icon resources contributed by Titanic packages. */
export class TitanicIconRegistry {
  [key: string]: unknown;

  /** Flat icon lookup table keyed by icon path and aliases. */
  readonly all: Record<string, TitanicIconResource> = {};
  /** Icon lookup tree grouped by public package resource names. */
  readonly groups: Record<string, TitanicIconTree> = {};

  /** Registers an icon group under the provided group name. */
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

  /** Registers all icon exports exposed by a package module schema. */
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

  /** Gets an icon by path and resolves a themed variant when one is available. */
  get(path: string, options: TitanicIconResolveOptions = {}): TitanicIconResource | undefined {
    return resolveTitanicIconResource(
      this.all[path] ?? resolveIconPath(this.groups, path),
      options
    );
  }

  /** Resolves an icon by path and returns the base icon when the theme has no variant. */
  resolve(path: string, options: TitanicIconResolveOptions = {}): TitanicIconResource | undefined {
    return this.get(path, options);
  }

  /** Gets a registered icon group by name. */
  group<TTree extends TitanicIconTree = TitanicIconTree>(groupName: string): TTree | undefined {
    return this.groups[normalizeIconPathPart(groupName)] as TTree | undefined;
  }

  /** Returns true when an icon exists for the provided path. */
  has(path: string): boolean {
    return Boolean(this.get(path));
  }

  /** Removes all registered icon groups and lookup aliases. */
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

/** Registers and resolves enum resources contributed by Titanic packages. */
export class TitanicEnumRegistry {
  [key: string]: unknown;

  /** Flat enum lookup table keyed by enum path and aliases. */
  readonly all: Record<string, UiPackageEnumValues> = {};

  /** Registers enum values under the provided enum name. */
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

  /** Resolves and registers enum values from an enum schema. */
  registerSchema(schema: UiPackageEnumSchema): UiPackageEnumValues {
    const values = resolveUiPackageEnumSchema(schema, (key) => this.all[key]);

    for (const key of getUiPackageEnumRegistryKeys(schema)) {
      this.all[key] = values;
      this[key] = values;
    }

    return values;
  }

  /** Gets enum values by name or alias. */
  get<TValues extends UiPackageEnumValues = UiPackageEnumValues>(
    name: string
  ): TValues | undefined {
    return this.all[name] as TValues | undefined;
  }

  /** Returns true when enum values are registered for the provided name. */
  has(name: string): boolean {
    return Boolean(this.get(name));
  }

  /** Removes all registered enum values and lookup aliases. */
  clear(): void {
    Object.keys(this.all).forEach((key) => {
      delete this.all[key];
      delete this[key];
    });
  }
}

/** Utility methods for package schema definitions. */
export class TitanicPackageTools {
  /** Converts a TypeScript enum-like object to serializable enum values. */
  toEnumValues(values: Record<string, string | number>): UiPackageEnumValues {
    return Object.fromEntries(
      Object.entries(values).filter(([key]) => Number.isNaN(Number(key)))
    );
  }
}

/** Public facade for package resource registration and shared Titanic helpers. */
export class Titanic {
  /** Package schema helper methods. */
  static readonly Package = new TitanicPackageTools();
  /** Shared icon registry exposed to packages and consumers. */
  static readonly Icons = new TitanicIconRegistry();
  /** @deprecated Use Titanic.Icons instead. */
  static readonly icons = Titanic.Icons;
  /** Shared enum registry exposed to packages and consumers. */
  static readonly enums = new TitanicEnumRegistry();

  /** Registers all schemas exposed by a package descriptor. */
  static registerPackage(packageDescriptor: UiPackageDescriptor): void {
    packageDescriptor.schemas?.forEach((schema) => {
      this.registerSchema({
        ...schema,
        packageName: schema.packageName ?? packageDescriptor.name
      });
    });
  }

  /** Registers all schemas exposed by package descriptors. */
  static registerPackages(packageDescriptors: readonly UiPackageDescriptor[]): void {
    packageDescriptors.forEach((packageDescriptor) => this.registerPackage(packageDescriptor));
  }

  /** Registers a single package schema in the appropriate Titanic registry. */
  static registerSchema(schema: UiPackageSchema): void {
    if (isIconModuleSchema(schema) && schema.exports) {
      this.Icons.registerModule(schema.name, schema.exports, {
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

function resolveTitanicIconResource(
  icon: TitanicIconResource | undefined,
  options: TitanicIconResolveOptions
): TitanicIconResource | undefined {
  if (!icon || !options.theme) {
    return icon;
  }

  return icon.themes?.[options.theme] ?? icon;
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
