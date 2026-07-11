import type {
  UiPackageDescriptor,
  UiPackageEnumSchema,
  UiPackageEnumValues,
  UiPackageIconModuleSchema,
  UiPackageLocalizationModuleSchema,
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
  /** Optional group name used when icons should be registered under a grouped public path. */
  groupName?: string;
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

/** Leaf value for localized Titanic string resources. */
export type TitanicLocalizationString = string;

/** Nested localized string tree keyed by public property name. */
export type TitanicLocalizationTree = {
  readonly [key: string]: TitanicLocalizationString | TitanicLocalizationTree;
};

/** Resource containing localized string trees keyed by locale. */
export interface TitanicLocalizationResource<
  TTree extends TitanicLocalizationTree = TitanicLocalizationTree
> {
  /** Optional fallback locale for this resource. */
  defaultLocale?: string;
  /** Localized string trees keyed by BCP 47 locale, for example en-US or ru-RU. */
  locales: Readonly<Record<string, TTree>>;
}

/** Nested collection of localization resources grouped by public resource path. */
export type TitanicLocalizationResourceTree = {
  readonly [key: string]: TitanicLocalizationResource | TitanicLocalizationResourceTree;
};

/** Resolved localized string tree exposed through Titanic.Localization group proxies. */
export type TitanicLocalizedPropertyTree = {
  readonly [key: string]: TitanicLocalizationString | TitanicLocalizedPropertyTree | undefined;
};

/** Module exports shape accepted by the Titanic localization registry. */
export type TitanicLocalizationModuleExports = UiPackageModuleExports & {
  localization?: TitanicLocalizationResourceTree;
  localizations?: TitanicLocalizationResourceTree;
};

/** Options used when localization resources are registered. */
export interface TitanicLocalizationRegistrationOptions {
  /** Optional explicit group name for a single localization resource. */
  groupName?: string;
  /** Optional module name added as an additional lookup prefix. */
  moduleName?: string;
  /** Optional package name added as an additional lookup prefix. */
  packageName?: string;
  /** Optional fallback locale used when the resource has no own default locale. */
  defaultLocale?: string;
}

/** Options used when resolving localized strings. */
export interface TitanicLocalizationResolveOptions {
  /** Explicit locale. When omitted, the registry uses the configured or browser locale. */
  locale?: string | null;
  /** Optional fallback locale for this lookup. */
  defaultLocale?: string | null;
}

/** Options used when resolving user-facing localized text. */
export interface TitanicLocalizationTextOptions extends TitanicLocalizationResolveOptions {
  /** Fallback text returned when the localization path is missing. */
  fallback?: string;
}

/** Registers and resolves icon resources contributed by Titanic packages. */
export class TitanicIconRegistry {
  [key: string]: unknown;

  /** Flat icon lookup table keyed by icon path and aliases. */
  readonly all: Record<string, TitanicIconResource> = {};
  /** Icon lookup tree grouped by public package resource names. */
  readonly groups: Record<string, TitanicIconTree> = {};
  private readonly directIconPropertyNames = new Set<string>();

  /** Registers an icon group under the provided group name. */
  register<TIcons extends TitanicIconTree = TitanicIconTree>(
    groupName: string,
    icons: TIcons,
    options: TitanicIconRegistrationOptions = {}
  ): TIcons {
    const normalizedGroupName = normalizeIconPathPart(groupName);

    if (!normalizedGroupName || !isIconTree(icons)) {
      return icons;
    }

    const nextGroup = mergeIconTrees(this.groups[normalizedGroupName], icons);
    this.groups[normalizedGroupName] = nextGroup;
    this[normalizedGroupName] = nextGroup;
    flattenIconTree(this.all, nextGroup, [normalizedGroupName], options);

    return icons;
  }

  /** Registers an icon group and returns the original icon tree for reuse. */
  registerGroup<TIcons extends TitanicIconTree = TitanicIconTree>(
    groupName: string,
    icons: TIcons,
    options: TitanicIconRegistrationOptions = {}
  ): TIcons {
    return this.register(groupName, icons, options);
  }

  /** Registers icons directly by their public names without adding a group prefix. */
  registerIcons<TIcons extends TitanicIconTree = TitanicIconTree>(
    icons: TIcons,
    options: TitanicIconRegistrationOptions = {}
  ): TIcons {
    if (!isIconTree(icons)) {
      return icons;
    }

    flattenIconTree(this.all, icons, [], options);
    attachIconTreeProperties(this, icons, this.directIconPropertyNames);

    return icons;
  }

  /** Overrides a single icon at its public path. */
  override(path: string, icon: TitanicIconResource): TitanicIconResource {
    const iconPath = normalizeIconPath(path);

    if (!iconPath || !isIconResource(icon)) {
      return icon;
    }

    this.all[iconPath] = icon;
    setIconPath(this.groups, iconPath.split("."), icon);

    const pathParts = iconPath.split(".");
    if (pathParts.length === 1) {
      attachIconProperty(this, pathParts[0], icon, this.directIconPropertyNames);
    } else {
      const groupName = pathParts[0];
      if (groupName && this.groups[groupName]) {
        this[groupName] = this.groups[groupName];
      }
    }

    return icon;
  }

  /** Overrides icons by registering them over existing public paths. */
  overrideIcons<TIcons extends TitanicIconTree = TitanicIconTree>(
    icons: TIcons,
    options: TitanicIconRegistrationOptions = {}
  ): TIcons {
    if (options.groupName) {
      return this.register(options.groupName, icons, options);
    }

    return this.registerIcons(icons, options);
  }

  /** Registers every top-level key of a grouped icon tree as an icon group. */
  registerGroups<TIcons extends TitanicIconTree = TitanicIconTree>(
    icons: TIcons,
    options: TitanicIconRegistrationOptions = {}
  ): TIcons {
    Object.entries(icons).forEach(([groupName, groupIcons]) => {
      if (isIconTree(groupIcons)) {
        this.register(groupName, groupIcons, options);
      }
    });

    return icons;
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
        if (registrationOptions.groupName) {
          this.register(registrationOptions.groupName, exportedValue, registrationOptions);
        } else {
          this.registerIcons(exportedValue, registrationOptions);
        }
        return;
      }

      if (exportName.endsWith("Icons")) {
        this.register(
          registrationOptions.groupName ?? toIconGroupName(exportName),
          exportedValue,
          registrationOptions
        );
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

  /** Removes all registered icons, groups and lookup aliases. */
  clear(): void {
    Object.keys(this.groups).forEach((key) => {
      delete this.groups[key];
      delete this[key];
    });
    this.directIconPropertyNames.forEach((key) => {
      delete this[key];
    });
    this.directIconPropertyNames.clear();
    Object.keys(this.all).forEach((key) => {
      delete this.all[key];
    });
  }
}

/** Registers and resolves localization resources contributed by Titanic packages. */
export class TitanicLocalizationRegistry {
  [key: string]: unknown;

  /** Flat localized string lookup table for the current effective locale. */
  readonly all: Record<string, string> = {};
  /** Localized property proxy trees grouped by public package resource names. */
  readonly groups: Record<string, TitanicLocalizedPropertyTree> = {};
  /** Default locale used when the user locale has no matching string. */
  defaultLocale = "en-US";
  /** Explicit active locale. When omitted, the registry detects the browser locale. */
  locale?: string;

  private readonly flatByLocale: Record<string, Record<string, string>> = {};
  private readonly groupTreesByLocale: Record<string, Record<string, TitanicLocalizationTree>> = {};
  private readonly pathDefaultLocales: Record<string, string> = {};
  private readonly branchPaths = new Set<string>();

  /** Sets the active locale. Pass undefined or null to return to browser locale detection. */
  setLocale(locale: string | null | undefined): void {
    const normalizedLocale = normalizeLocalizationLocale(locale);

    if (normalizedLocale) {
      this.locale = normalizedLocale;
    } else {
      delete this.locale;
    }

    this.refreshAll();
  }

  /** Sets the registry fallback locale. */
  setDefaultLocale(locale: string): void {
    const normalizedLocale = normalizeLocalizationLocale(locale);

    if (!normalizedLocale) {
      return;
    }

    this.defaultLocale = normalizedLocale;
    this.refreshAll();
  }

  /** Resolves the active locale from an explicit setting, browser/user locale, or fallback locale. */
  getCurrentLocale(): string {
    return this.locale ?? this.getUserLocale() ?? this.defaultLocale;
  }

  /** Reads the user locale from document and navigator when a browser runtime is available. */
  getUserLocale(): string | undefined {
    if (typeof document !== "undefined") {
      const documentLocale = normalizeLocalizationLocale(document.documentElement.lang);

      if (documentLocale) {
        return documentLocale;
      }
    }

    if (typeof navigator !== "undefined") {
      const browserLocales = [
        ...(Array.isArray(navigator.languages) ? navigator.languages : []),
        navigator.language
      ];

      for (const locale of browserLocales) {
        const normalizedLocale = normalizeLocalizationLocale(locale);

        if (normalizedLocale) {
          return normalizedLocale;
        }
      }
    }

    return undefined;
  }

  /** Registers a localization resource group. */
  register<TTree extends TitanicLocalizationTree = TitanicLocalizationTree>(
    groupName: string,
    resource: TitanicLocalizationResource<TTree>,
    options: TitanicLocalizationRegistrationOptions = {}
  ): TitanicLocalizationResource<TTree> {
    const normalizedGroupName = normalizeLocalizationPath(groupName);

    if (!normalizedGroupName || !isLocalizationResource(resource)) {
      return resource;
    }

    const defaultLocale = normalizeLocalizationLocale(
      resource.defaultLocale ?? options.defaultLocale ?? this.defaultLocale
    ) ?? this.defaultLocale;

    addLocalizationBranchPaths(this.branchPaths, normalizedGroupName);

    Object.entries(resource.locales).forEach(([locale, localizationTree]) => {
      const normalizedLocale = normalizeLocalizationLocale(locale);

      if (!normalizedLocale || !isLocalizationTree(localizationTree)) {
        return;
      }

      const localeGroups = this.groupTreesByLocale[normalizedLocale] ??= {};
      localeGroups[normalizedGroupName] = mergeLocalizationTrees(
        localeGroups[normalizedGroupName],
        localizationTree
      );

      const localeFlatMap = this.flatByLocale[normalizedLocale] ??= {};
      flattenLocalizationTree(
        localeFlatMap,
        localizationTree,
        [normalizedGroupName],
        options,
        defaultLocale,
        this.pathDefaultLocales,
        this.branchPaths
      );
    });

    attachLocalizationPropertyProxies(this, normalizedGroupName);
    this.refreshAll();

    return resource;
  }

  /** Registers a localization resource group and returns the original resource for reuse. */
  registerGroup<TTree extends TitanicLocalizationTree = TitanicLocalizationTree>(
    groupName: string,
    resource: TitanicLocalizationResource<TTree>,
    options: TitanicLocalizationRegistrationOptions = {}
  ): TitanicLocalizationResource<TTree> {
    return this.register(groupName, resource, options);
  }

  /** Registers every resource in a grouped localization resource tree. */
  registerGroups<TResources extends TitanicLocalizationResourceTree = TitanicLocalizationResourceTree>(
    resources: TResources,
    options: TitanicLocalizationRegistrationOptions = {}
  ): TResources {
    registerLocalizationResourceTree(this, resources, [], options);

    return resources;
  }

  /** Registers all localization exports exposed by a package module schema. */
  registerModule(
    moduleName: string,
    moduleExports: UiPackageModuleExports,
    options: Omit<TitanicLocalizationRegistrationOptions, "moduleName"> = {}
  ): void {
    const registrationOptions = {
      ...options,
      moduleName
    };

    Object.entries(moduleExports).forEach(([exportName, exportedValue]) => {
      if (isLocalizationResource(exportedValue)) {
        this.register(
          registrationOptions.groupName ?? toLocalizationGroupName(exportName),
          exportedValue,
          registrationOptions
        );
        return;
      }

      if (!isLocalizationResourceTree(exportedValue)) {
        return;
      }

      if (
        exportName === "localization" ||
        exportName === "localizations" ||
        exportName.endsWith("Localization") ||
        exportName.endsWith("Localizations")
      ) {
        this.registerGroups(exportedValue, registrationOptions);
      }
    });
  }

  /** Gets a localized string by path. */
  get(path: string, options: TitanicLocalizationResolveOptions = {}): string | undefined {
    const normalizedPath = normalizeLocalizationPath(path);

    if (!normalizedPath) {
      return undefined;
    }

    return resolveLocalizedString(
      this.flatByLocale,
      normalizedPath,
      this.resolveLocale(options),
      normalizeLocalizationLocale(options.defaultLocale) ??
        this.pathDefaultLocales[normalizedPath] ??
        this.defaultLocale
    );
  }

  /** Resolves a localized string by path. */
  resolve(path: string, options: TitanicLocalizationResolveOptions = {}): string | undefined {
    return this.get(path, options);
  }

  /** Gets localized text and falls back to the provided fallback text or the path itself. */
  text(path: string, options: TitanicLocalizationTextOptions = {}): string {
    return this.get(path, options) ?? options.fallback ?? path;
  }

  /** Short alias for resolving user-facing localized text. */
  t(path: string, options: TitanicLocalizationTextOptions = {}): string {
    return this.text(path, options);
  }

  /** Gets a registered localization group resolved for the active or requested locale. */
  group<TTree = TitanicLocalizationTree>(
    groupName: string,
    options: TitanicLocalizationResolveOptions = {}
  ): TTree | undefined {
    const normalizedGroupName = normalizeLocalizationPath(groupName);

    if (!normalizedGroupName || !this.branchPaths.has(normalizedGroupName)) {
      return undefined;
    }

    return buildResolvedLocalizationTree(
      this.flatByLocale,
      normalizedGroupName,
      this.resolveLocale(options),
      normalizeLocalizationLocale(options.defaultLocale) ??
        this.pathDefaultLocales[normalizedGroupName] ??
        this.defaultLocale
    ) as TTree | undefined;
  }

  /** Returns true when a localized string exists for the provided path. */
  has(path: string, options: TitanicLocalizationResolveOptions = {}): boolean {
    return this.get(path, options) !== undefined;
  }

  /** Returns true when the path points to a registered localization branch. */
  hasBranch(path: string): boolean {
    return this.branchPaths.has(normalizeLocalizationPath(path));
  }

  /** Returns the value used by dynamic localization property proxies. */
  getProperty(path: string): string | TitanicLocalizedPropertyTree | undefined {
    const localizedString = this.get(path);

    if (localizedString !== undefined) {
      return localizedString;
    }

    if (this.hasBranch(path)) {
      return createLocalizationPropertyProxy(this, path.split(".").filter(Boolean));
    }

    return undefined;
  }

  /** Removes all registered localization resources and lookup aliases. */
  clear(): void {
    Object.keys(this.groups).forEach((key) => {
      delete this.groups[key];
      delete this[key];
    });
    Object.keys(this.all).forEach((key) => {
      delete this.all[key];
    });
    Object.keys(this.flatByLocale).forEach((key) => {
      delete this.flatByLocale[key];
    });
    Object.keys(this.groupTreesByLocale).forEach((key) => {
      delete this.groupTreesByLocale[key];
    });
    Object.keys(this.pathDefaultLocales).forEach((key) => {
      delete this.pathDefaultLocales[key];
    });
    this.branchPaths.clear();
  }

  private resolveLocale(options: TitanicLocalizationResolveOptions): string {
    return normalizeLocalizationLocale(options.locale) ?? this.getCurrentLocale();
  }

  private refreshAll(): void {
    Object.keys(this.all).forEach((key) => {
      delete this.all[key];
    });

    Object.keys(this.pathDefaultLocales).forEach((path) => {
      const value = this.get(path);

      if (value !== undefined) {
        this.all[path] = value;
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
  /** Shared localization registry exposed to packages and consumers. */
  static readonly Localization = new TitanicLocalizationRegistry();
  /** @deprecated Use Titanic.Localization instead. */
  static readonly localization = Titanic.Localization;
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
        groupName: schema.groupName,
        packageName: schema.packageName
      });
    }

    if (isLocalizationModuleSchema(schema) && schema.exports) {
      this.Localization.registerModule(schema.name, schema.exports, {
        defaultLocale: schema.defaultLocale,
        groupName: schema.groupName,
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

function isLocalizationModuleSchema(
  schema: UiPackageSchema
): schema is UiPackageLocalizationModuleSchema<TitanicLocalizationModuleExports> {
  return schema.kind === "module" && "resourceType" in schema && schema.resourceType === "localization";
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

function setIconPath(
  target: Record<string, TitanicIconTree>,
  pathParts: readonly string[],
  icon: TitanicIconResource
): void {
  const [head, ...tail] = pathParts;

  if (!head || tail.length === 0) {
    return;
  }

  const currentValue = target[head];
  const nextTree = currentValue && !isIconResource(currentValue)
    ? { ...currentValue }
    : {};

  setIconTreePath(nextTree, tail, icon);
  target[head] = nextTree;
}

function setIconTreePath(
  target: Record<string, TitanicIconResource | TitanicIconTree>,
  pathParts: readonly string[],
  icon: TitanicIconResource
): void {
  const [head, ...tail] = pathParts;

  if (!head) {
    return;
  }

  if (tail.length === 0) {
    target[head] = icon;
    return;
  }

  const currentValue = target[head];
  const nextTree = currentValue && !isIconResource(currentValue)
    ? { ...currentValue }
    : {};

  setIconTreePath(nextTree, tail, icon);
  target[head] = nextTree;
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

function attachIconTreeProperties(
  registry: TitanicIconRegistry,
  icons: TitanicIconTree,
  propertyNames: Set<string>
): void {
  Object.entries(icons).forEach(([key, value]) => {
    attachIconProperty(registry, key, value, propertyNames);
  });
}

function attachIconProperty(
  registry: TitanicIconRegistry,
  key: string,
  value: TitanicIconResource | TitanicIconTree,
  propertyNames: Set<string>
): void {
  if (key in registry && !propertyNames.has(key)) {
    return;
  }

  propertyNames.add(key);
  registry[key] = value;
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

function normalizeIconPath(value: string): string {
  return value.split(".").map((pathPart) => pathPart.trim()).filter(Boolean).join(".");
}

function isLocalizationResource(value: unknown): value is TitanicLocalizationResource {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return "locales" in value &&
    isLocalizationLocaleMap((value as { locales?: unknown }).locales);
}

function isLocalizationResourceTree(value: unknown): value is TitanicLocalizationResourceTree {
  if (!value || typeof value !== "object" || Array.isArray(value) || isLocalizationResource(value)) {
    return false;
  }

  const entries = Object.entries(value);
  return entries.length > 0 &&
    entries.every(([, item]) => isLocalizationResource(item) || isLocalizationResourceTree(item));
}

function isLocalizationLocaleMap(value: unknown): value is Readonly<Record<string, TitanicLocalizationTree>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.entries(value).every(([locale, item]) =>
    Boolean(normalizeLocalizationLocale(locale)) && isLocalizationTree(item)
  );
}

function isLocalizationTree(value: unknown): value is TitanicLocalizationTree {
  if (!value || typeof value !== "object" || Array.isArray(value) || isLocalizationResource(value)) {
    return false;
  }

  return Object.values(value).every((item) =>
    typeof item === "string" || isLocalizationTree(item)
  );
}

function registerLocalizationResourceTree(
  registry: TitanicLocalizationRegistry,
  resources: TitanicLocalizationResourceTree,
  path: readonly string[],
  options: TitanicLocalizationRegistrationOptions
): void {
  Object.entries(resources).forEach(([groupName, resource]) => {
    const nextPath = [...path, groupName];

    if (isLocalizationResource(resource)) {
      registry.register(nextPath.join("."), resource, options);
      return;
    }

    if (isLocalizationResourceTree(resource)) {
      registerLocalizationResourceTree(registry, resource, nextPath, options);
    }
  });
}

function mergeLocalizationTrees(
  target: TitanicLocalizationTree | undefined,
  source: TitanicLocalizationTree
): TitanicLocalizationTree {
  const nextTarget: Record<string, string | TitanicLocalizationTree> = {
    ...(target ?? {})
  };

  Object.entries(source).forEach(([key, value]) => {
    if (typeof value === "string") {
      nextTarget[key] = value;
      return;
    }

    const currentValue = nextTarget[key];
    nextTarget[key] = mergeLocalizationTrees(
      currentValue && typeof currentValue !== "string" ? currentValue : undefined,
      value
    );
  });

  return nextTarget;
}

function flattenLocalizationTree(
  target: Record<string, string>,
  localizationTree: TitanicLocalizationTree,
  path: readonly string[],
  options: TitanicLocalizationRegistrationOptions,
  defaultLocale: string,
  pathDefaultLocales: Record<string, string>,
  branchPaths: Set<string>
): void {
  const branchPath = path.join(".");
  branchPaths.add(branchPath);
  pathDefaultLocales[branchPath] ??= defaultLocale;

  Object.entries(localizationTree).forEach(([key, value]) => {
    const nextPath = [...path, key];

    if (typeof value === "string") {
      registerLocalizationString(
        target,
        nextPath,
        value,
        options,
        defaultLocale,
        pathDefaultLocales
      );
      return;
    }

    flattenLocalizationTree(
      target,
      value,
      nextPath,
      options,
      defaultLocale,
      pathDefaultLocales,
      branchPaths
    );
  });
}

function registerLocalizationString(
  target: Record<string, string>,
  path: readonly string[],
  value: string,
  options: TitanicLocalizationRegistrationOptions,
  defaultLocale: string,
  pathDefaultLocales: Record<string, string>
): void {
  const localizationPath = path.join(".");
  const leafName = path[path.length - 1];
  const aliases = [
    localizationPath,
    ...(leafName ? [leafName] : []),
    ...(options.packageName ? [`${options.packageName}.${localizationPath}`] : []),
    ...(options.moduleName ? [`${options.moduleName}.${localizationPath}`] : [])
  ];

  aliases.forEach((alias, index) => {
    if (index === 1) {
      target[alias] ??= value;
    } else {
      target[alias] = value;
    }

    pathDefaultLocales[alias] ??= defaultLocale;
  });
}

function resolveLocalizedString(
  flatByLocale: Record<string, Record<string, string>>,
  path: string,
  locale: string,
  defaultLocale: string
): string | undefined {
  const candidates = getLocalizationLocaleCandidates(flatByLocale, locale, defaultLocale);

  for (const candidate of candidates) {
    const value = flatByLocale[candidate]?.[path];

    if (value !== undefined) {
      return value;
    }
  }

  return undefined;
}

function buildResolvedLocalizationTree(
  flatByLocale: Record<string, Record<string, string>>,
  groupName: string,
  locale: string,
  defaultLocale: string
): TitanicLocalizationTree | undefined {
  const prefix = `${groupName}.`;
  const paths = new Set<string>();

  Object.values(flatByLocale).forEach((flatMap) => {
    Object.keys(flatMap).forEach((path) => {
      if (path.startsWith(prefix)) {
        paths.add(path);
      }
    });
  });

  if (paths.size === 0) {
    return undefined;
  }

  const tree: Record<string, string | TitanicLocalizationTree> = {};

  paths.forEach((path) => {
    const value = resolveLocalizedString(flatByLocale, path, locale, defaultLocale);

    if (value === undefined) {
      return;
    }

    setNestedLocalizationValue(tree, path.slice(prefix.length).split("."), value);
  });

  return tree;
}

function setNestedLocalizationValue(
  target: Record<string, string | TitanicLocalizationTree>,
  pathParts: string[],
  value: string
): void {
  const [pathPart, ...restPath] = pathParts;

  if (!pathPart) {
    return;
  }

  if (restPath.length === 0) {
    target[pathPart] = value;
    return;
  }

  const nextTarget = target[pathPart];
  const nextTree: Record<string, string | TitanicLocalizationTree> =
    nextTarget && typeof nextTarget !== "string" ? { ...nextTarget } : {};

  target[pathPart] = nextTree;
  setNestedLocalizationValue(nextTree, restPath, value);
}

function getLocalizationLocaleCandidates(
  flatByLocale: Record<string, Record<string, string>>,
  locale: string,
  defaultLocale: string
): string[] {
  const localeKeys = Object.keys(flatByLocale);
  const candidates: string[] = [];

  addLocaleCandidate(candidates, localeKeys, locale);
  addLanguageLocaleCandidate(candidates, localeKeys, locale);
  addLocaleCandidate(candidates, localeKeys, defaultLocale);
  addLanguageLocaleCandidate(candidates, localeKeys, defaultLocale);

  localeKeys.forEach((localeKey) => addUnique(candidates, localeKey));

  return candidates;
}

function addLocaleCandidate(candidates: string[], localeKeys: string[], locale: string): void {
  const localeKey = findLocaleKey(localeKeys, locale);

  if (localeKey) {
    addUnique(candidates, localeKey);
  }
}

function addLanguageLocaleCandidate(candidates: string[], localeKeys: string[], locale: string): void {
  const language = getLocaleLanguage(locale);

  if (!language) {
    return;
  }

  const localeKey = localeKeys.find((key) => getLocaleLanguage(key) === language);

  if (localeKey) {
    addUnique(candidates, localeKey);
  }
}

function findLocaleKey(localeKeys: string[], locale: string): string | undefined {
  const normalizedLocale = normalizeLocaleKey(locale);
  return localeKeys.find((key) => normalizeLocaleKey(key) === normalizedLocale);
}

function addUnique(items: string[], item: string): void {
  if (!items.includes(item)) {
    items.push(item);
  }
}

function getLocaleLanguage(locale: string): string {
  return normalizeLocaleKey(locale).split("-")[0] ?? "";
}

function addLocalizationBranchPaths(branchPaths: Set<string>, path: string): void {
  const pathParts = path.split(".").filter(Boolean);

  pathParts.forEach((_, index) => {
    branchPaths.add(pathParts.slice(0, index + 1).join("."));
  });
}

function attachLocalizationPropertyProxies(
  registry: TitanicLocalizationRegistry,
  path: string
): void {
  const pathParts = path.split(".").filter(Boolean);

  pathParts.forEach((_, index) => {
    const branchPathParts = pathParts.slice(0, index + 1);
    const branchPath = branchPathParts.join(".");
    const proxy = createLocalizationPropertyProxy(registry, branchPathParts);

    registry.groups[branchPath] = proxy;
    registry[branchPath] = proxy;

    if (index === 0) {
      registry[branchPathParts[0]] = proxy;
    }
  });
}

function createLocalizationPropertyProxy(
  registry: TitanicLocalizationRegistry,
  pathParts: readonly string[]
): TitanicLocalizedPropertyTree {
  const proxyTarget = {};

  return new Proxy(proxyTarget, {
    get(_target, property) {
      if (typeof property === "symbol") {
        return property === Symbol.toStringTag ? "TitanicLocalization" : undefined;
      }

      if (property === "then") {
        return undefined;
      }

      if (property === "toJSON") {
        return () => registry.group(pathParts.join("."));
      }

      if (property === "toString") {
        return () => registry.get(pathParts.join(".")) ?? "[object TitanicLocalization]";
      }

      return registry.getProperty([...pathParts, property].join("."));
    },
    has(_target, property) {
      return typeof property === "string" && (
        registry.has([...pathParts, property].join(".")) ||
        registry.hasBranch([...pathParts, property].join("."))
      );
    },
    ownKeys() {
      return Object.keys(registry.group(pathParts.join(".")) ?? {});
    },
    getOwnPropertyDescriptor(_target, property) {
      if (typeof property !== "string") {
        return undefined;
      }

      const value = registry.getProperty([...pathParts, property].join("."));

      return value === undefined
        ? undefined
        : {
            configurable: true,
            enumerable: true
          };
    }
  }) as TitanicLocalizedPropertyTree;
}

function toLocalizationGroupName(exportName: string): string {
  const withoutPrefix = exportName.replace(/^entity/, "");
  const withoutSuffix = withoutPrefix.replace(/Localizations?$/, "");
  const normalizedName = withoutSuffix.charAt(0).toLowerCase() + withoutSuffix.slice(1);

  return normalizedName === "resource" ? "resources" : normalizedName;
}

function normalizeLocalizationPath(value: string): string {
  return value
    .split(".")
    .map(normalizeLocalizationPathPart)
    .filter(Boolean)
    .join(".");
}

function normalizeLocalizationPathPart(value: string): string {
  return value.trim().replace(/^[^a-zA-Z_$]+/, "");
}

function normalizeLocalizationLocale(value: string | null | undefined): string | undefined {
  const locale = typeof value === "string" ? value.trim() : "";

  if (!locale) {
    return undefined;
  }

  return locale
    .split("-")
    .filter(Boolean)
    .map((part, index) => index === 0 ? part.toLowerCase() : part.toUpperCase())
    .join("-");
}

function normalizeLocaleKey(value: string): string {
  return normalizeLocalizationLocale(value)?.toLowerCase() ?? "";
}
