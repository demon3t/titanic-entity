import {
  Titanic,
  type TitanicIconTree,
  type TitanicLocalizationResource,
  type TitanicLocalizationResourceTree,
  type TitanicLocalizationTree
} from "./Titanic";
import type {
  UiPackageComponentSchema,
  UiPackageDescriptor,
  UiPackageEnumSchema,
  UiPackageEnumValues,
  UiPackageFieldSchema,
  UiPackageGridSchema,
  UiPackageIconModuleSchema,
  UiPackageLocalizationModuleSchema,
  UiPackageModuleExports,
  UiPackageModuleSchema,
  UiPackagePageSchema,
  UiPackageSchema,
  UiPackageSectionSchema,
  UiPackageTemplateSchema,
  UiPackageWorkspaceSchema
} from "./types";

/** Registers a UI package descriptor in the global Titanic registry. */
export function definePackage<TDescriptor extends UiPackageDescriptor>(
  descriptor: TDescriptor
): TDescriptor {
  Titanic.registerPackage(descriptor);
  return descriptor;
}

/** Preserves workspace schema inference for package descriptors. */
export function defineWorkspaceSchema<TSchema extends UiPackageWorkspaceSchema>(
  schema: TSchema
): TSchema {
  return schema;
}

/** Preserves section schema inference for package descriptors. */
export function defineSectionSchema<TSchema extends UiPackageSectionSchema>(
  schema: TSchema
): TSchema {
  return schema;
}

/** Preserves page component props while declaring a page schema. */
export function definePageSchema<TProps = unknown>(
  schema: UiPackagePageSchema<TProps>
): UiPackagePageSchema<TProps> {
  return schema;
}

/** Preserves template component props while declaring a template schema. */
export function defineTemplateSchema<TProps = unknown>(
  schema: UiPackageTemplateSchema<TProps>
): UiPackageTemplateSchema<TProps> {
  return schema;
}

/** Preserves field component props while declaring a field schema. */
export function defineFieldSchema<TProps = unknown>(
  schema: UiPackageFieldSchema<TProps>
): UiPackageFieldSchema<TProps> {
  return schema;
}

/** Preserves grid component props while declaring a grid schema. */
export function defineGridSchema<TProps = unknown>(
  schema: UiPackageGridSchema<TProps>
): UiPackageGridSchema<TProps> {
  return schema;
}

/** Preserves component props while declaring a fallback component schema. */
export function defineComponentSchema<TProps = unknown>(
  schema: UiPackageComponentSchema<TProps>
): UiPackageComponentSchema<TProps> {
  return schema;
}

/** Preserves enum value types while declaring an enum schema. */
export function defineEnumSchema<TValues extends UiPackageEnumValues = UiPackageEnumValues>(
  schema: UiPackageEnumSchema<TValues>
): UiPackageEnumSchema<TValues> {
  return schema;
}

/** Preserves module export types while declaring a module schema. */
export function defineModuleSchema<TExports extends UiPackageModuleExports = UiPackageModuleExports>(
  schema: UiPackageModuleSchema<TExports>
): UiPackageModuleSchema<TExports> {
  return schema;
}

export interface DefineIconResourcesOptions<
  TIcons extends TitanicIconTree = TitanicIconTree
> extends Omit<
    UiPackageIconModuleSchema<{ icons: TIcons } & UiPackageModuleExports>,
    "exports" | "kind" | "resourceType"
  > {
  /** Icons to expose from the module. Use groupName only when a grouped public path is needed. */
  icons: TIcons;
  /** Additional icon-related exports, such as named icons for direct imports. */
  exports?: UiPackageModuleExports;
}

export interface DefineIconPackageOptions<
  TIcons extends TitanicIconTree = TitanicIconTree
> extends Omit<UiPackageDescriptor, "schemas"> {
  /** Icons to expose from the package. */
  icons: TIcons;
  /** Optional group name used for Titanic.Icons.group(groupName) and Titanic.Icons.get("group.key"). */
  groupName?: string;
  /** Optional module schema name. Defaults to `${name}.Icons`. */
  moduleName?: string;
  /** Additional schemas to include in the package descriptor. */
  schemas?: readonly UiPackageSchema[];
  /** Additional icon-related exports, such as named icons for direct imports. */
  exports?: UiPackageModuleExports;
}

export interface DefineLocalizationResourcesOptions<
  TTree extends TitanicLocalizationTree = TitanicLocalizationTree,
  TResources extends TitanicLocalizationResourceTree = TitanicLocalizationResourceTree
> extends Omit<
    UiPackageLocalizationModuleSchema<UiPackageModuleExports>,
    "exports" | "kind" | "resourceType"
  > {
  /** Single localization resource to expose from the module. Use groupName to choose its public path. */
  localization?: TitanicLocalizationResource<TTree>;
  /** Locale map shorthand used to build a single localization resource. */
  locales?: Readonly<Record<string, TTree>>;
  /** Grouped localization resources to expose from the module. */
  localizations?: TResources;
  /** Additional localization-related exports for direct imports. */
  exports?: UiPackageModuleExports;
}

export interface DefineLocalizationPackageOptions<
  TTree extends TitanicLocalizationTree = TitanicLocalizationTree,
  TResources extends TitanicLocalizationResourceTree = TitanicLocalizationResourceTree
> extends Omit<UiPackageDescriptor, "schemas"> {
  /** Single localization resource to expose from the package. */
  localization?: TitanicLocalizationResource<TTree>;
  /** Locale map shorthand used to build a single localization resource. */
  locales?: Readonly<Record<string, TTree>>;
  /** Grouped localization resources to expose from the package. */
  localizations?: TResources;
  /** Optional group name used for Titanic.Localization.group(groupName) and Titanic.Localization.get("group.key"). */
  groupName?: string;
  /** Optional fallback locale used when the user locale has no matching string. */
  defaultLocale?: string;
  /** Optional module schema name. Defaults to `${name}.Localization`. */
  moduleName?: string;
  /** Additional schemas to include in the package descriptor. */
  schemas?: readonly UiPackageSchema[];
  /** Additional localization-related exports for direct imports. */
  exports?: UiPackageModuleExports;
}

/** Preserves module export types while declaring an icon resource module schema. */
export function defineIconModuleSchema<
  TExports extends UiPackageModuleExports = UiPackageModuleExports
>(
  schema: Omit<UiPackageIconModuleSchema<TExports>, "kind" | "resourceType"> & {
    kind?: "module";
    resourceType?: "icons";
  }
): UiPackageIconModuleSchema<TExports> {
  return {
    ...schema,
    kind: "module",
    resourceType: "icons"
  };
}

/** Declares an icon resource module schema from an icon tree. */
export function defineIconResources<TIcons extends TitanicIconTree = TitanicIconTree>(
  options: DefineIconResourcesOptions<TIcons>
): UiPackageIconModuleSchema<{ icons: TIcons } & UiPackageModuleExports> {
  const { icons, exports: extraExports, ...schema } = options;

  return defineIconModuleSchema({
    ...schema,
    exports: {
      ...extraExports,
      icons
    } as { icons: TIcons } & UiPackageModuleExports
  });
}

/** Declares and registers a package descriptor that exposes icon resources. */
export function defineIconPackage<TIcons extends TitanicIconTree = TitanicIconTree>(
  options: DefineIconPackageOptions<TIcons>
): UiPackageDescriptor {
  const {
    icons,
    groupName,
    moduleName,
    schemas = [],
    exports: extraExports,
    ...descriptor
  } = options;

  return definePackage({
    ...descriptor,
    schemas: [
      ...schemas,
      defineIconResources({
        name: moduleName ?? `${descriptor.name}.Icons`,
        packageName: descriptor.name,
        groupName,
        icons,
        exports: extraExports
      })
    ]
  });
}

/** Preserves module export types while declaring a localization resource module schema. */
export function defineLocalizationModuleSchema<
  TExports extends UiPackageModuleExports = UiPackageModuleExports
>(
  schema: Omit<UiPackageLocalizationModuleSchema<TExports>, "kind" | "resourceType"> & {
    kind?: "module";
    resourceType?: "localization";
  }
): UiPackageLocalizationModuleSchema<TExports> {
  return {
    ...schema,
    kind: "module",
    resourceType: "localization"
  };
}

/** Declares a localization resource module schema from locale maps or grouped resources. */
export function defineLocalizationResources<
  TTree extends TitanicLocalizationTree = TitanicLocalizationTree,
  TResources extends TitanicLocalizationResourceTree = TitanicLocalizationResourceTree
>(
  options: DefineLocalizationResourcesOptions<TTree, TResources>
): UiPackageLocalizationModuleSchema<UiPackageModuleExports> {
  const {
    localization,
    locales,
    localizations,
    exports: extraExports,
    defaultLocale,
    ...schema
  } = options;
  const localizationResource = localization ?? (
    locales
      ? {
          ...(defaultLocale ? { defaultLocale } : {}),
          locales
        } satisfies TitanicLocalizationResource<TTree>
      : undefined
  );

  return defineLocalizationModuleSchema({
    ...schema,
    defaultLocale,
    exports: {
      ...extraExports,
      ...(localizations ? { localizations } : {}),
      ...(localizationResource ? { localization: localizationResource } : {})
    }
  });
}

/** Declares and registers a package descriptor that exposes localization resources. */
export function defineLocalizationPackage<
  TTree extends TitanicLocalizationTree = TitanicLocalizationTree,
  TResources extends TitanicLocalizationResourceTree = TitanicLocalizationResourceTree
>(
  options: DefineLocalizationPackageOptions<TTree, TResources>
): UiPackageDescriptor {
  const {
    localization,
    locales,
    localizations,
    groupName,
    moduleName,
    schemas = [],
    exports: extraExports,
    defaultLocale,
    ...descriptor
  } = options;

  return definePackage({
    ...descriptor,
    schemas: [
      ...schemas,
      defineLocalizationResources({
        name: moduleName ?? `${descriptor.name}.Localization`,
        packageName: descriptor.name,
        groupName,
        defaultLocale,
        localization,
        locales,
        localizations,
        exports: extraExports
      })
    ]
  });
}
