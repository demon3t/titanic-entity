// Базовый пакет Entity UI: регистрация схем, навигации, ресурсов расширения и enum.
import {
  createContext,
  createElement,
  useContext,
  useMemo,
  type ComponentType,
  type ReactNode
} from "react";
import { Titanic } from "./Titanic";
export * from "./Titanic";
export * from "./enumValues";

export type UiPackageSchema =
  | UiPackagePageSchema<any>
  | UiPackageWorkspaceSchema
  | UiPackageSectionSchema<any>
  | UiPackageTemplateSchema<any>
  | UiPackageFieldSchema<any>
  | UiPackageGridSchema<any>
  | UiPackageEnumSchema<any>
  | UiPackageModuleSchema<any>
  | UiPackageComponentSchema<any>;
export type UiPackageManifestSchema =
  | UiPackagePageManifestSchema
  | UiPackageWorkspaceManifestSchema
  | UiPackageSectionManifestSchema
  | UiPackageTemplateManifestSchema
  | UiPackageFieldManifestSchema
  | UiPackageGridManifestSchema
  | UiPackageEnumManifestSchema
  | UiPackageModuleManifestSchema
  | UiPackageComponentManifestSchema;

export interface UiPackageEntityBinding {
  entityName: string;
  providerName?: string;
}

export interface UiPackageEntityBoundSchema {
  entityName?: string;
  entity?: UiPackageEntityBinding;
}

export interface UiPackagePageSchema<TProps = unknown> extends UiPackageEntityBoundSchema {
  kind: "page";
  name: string;
  packageName?: string;
  component: ComponentType<TProps>;
}

export interface UiPackageWorkspaceSchema {
  kind: "workspace";
  name: string;
  packageName?: string;
  title: string;
  caption?: string;
  order?: number;
  icon?: string;
  sections?: readonly string[];
}

export interface UiPackageSectionSchema<TProps = unknown> extends UiPackageEntityBoundSchema {
  kind: "section";
  name: string;
  packageName?: string;
  title: string;
  caption?: string;
  order?: number;
  icon?: string;
  workspaceName?: string;
  pageName?: string;
  component?: ComponentType<TProps>;
}

export interface UiPackageComponentLikeExtensionContext<TProps = unknown> {
  name: string;
  packageName: string;
  baseComponent?: ComponentType<TProps>;
}

export type UiPackageComponentLikeExtension<TProps = unknown> = (
  context: UiPackageComponentLikeExtensionContext<TProps>
) => ComponentType<TProps>;

export interface UiPackageComponentLikeSchema<TProps = unknown> {
  name: string;
  packageName?: string;
  component?: ComponentType<TProps>;
  extension?: UiPackageComponentLikeExtension<TProps>;
  replaces?: string;
}

export interface UiPackageTemplateSchema<TProps = unknown> extends UiPackageEntityBoundSchema, UiPackageComponentLikeSchema<TProps> {
  kind: "template";
}

export interface UiPackageFieldSchema<TProps = unknown> extends UiPackageEntityBoundSchema, UiPackageComponentLikeSchema<TProps> {
  kind: "field";
}

export interface UiPackageGridSchema<TProps = unknown> extends UiPackageEntityBoundSchema, UiPackageComponentLikeSchema<TProps> {
  kind: "grid";
}

export interface UiPackageEnumExtensionContext<TValues extends UiPackageEnumValues = UiPackageEnumValues> {
  name: string;
  packageName: string;
  baseValues?: TValues;
}

export type UiPackageEnumExtension<TValues extends UiPackageEnumValues = UiPackageEnumValues> = (
  context: UiPackageEnumExtensionContext<TValues>
) => TValues;

export type UiPackageEnumValues = Record<string, string | number>;

export interface UiPackageEnumSchema<TValues extends UiPackageEnumValues = UiPackageEnumValues> {
  kind: "enum";
  name: string;
  packageName?: string;
  values?: TValues;
  extension?: UiPackageEnumExtension<TValues>;
  replaces?: string;
}

export interface UiPackageModuleSchema<TExports = unknown> extends UiPackageEntityBoundSchema {
  kind: "module";
  name: string;
  packageName?: string;
  resourceType?: string;
  exports: TExports;
}

export interface UiPackageComponentExtensionContext<TProps = unknown> {
  name: string;
  packageName: string;
  baseComponent?: ComponentType<TProps>;
}

export type UiPackageComponentExtension<TProps = unknown> = UiPackageComponentLikeExtension<TProps>;

export interface UiPackageComponentSchema<TProps = unknown> extends UiPackageComponentLikeSchema<TProps> {
  kind: "component";
}

export interface UiPackageDescriptor {
  name: string;
  version?: string;
  dependsOn?: readonly string[];
  schemas?: readonly UiPackageSchema[];
}

export interface UiPackageManifest {
  name: string;
  version?: string;
  dependsOn?: readonly string[];
  schemas?: readonly UiPackageManifestSchema[];
}

export interface UiPackageSchemaManifestBase {
  kind: UiPackageSchema["kind"];
  name: string;
  packageName?: string;
  path?: string;
  entityName?: string;
  entity?: UiPackageEntityBinding;
}

export interface UiPackagePageManifestSchema extends UiPackageSchemaManifestBase {
  kind: "page";
  path: string;
  component?: string;
}

export interface UiPackageWorkspaceManifestSchema extends UiPackageSchemaManifestBase {
  kind: "workspace";
  title?: string;
  caption?: string;
  order?: number;
  icon?: string;
  sections?: readonly string[];
}

export interface UiPackageSectionManifestSchema extends UiPackageSchemaManifestBase {
  kind: "section";
  path: string;
  title?: string;
  caption?: string;
  order?: number;
  icon?: string;
  workspace?: string;
  page?: string;
  component?: string;
}

export interface UiPackageComponentLikeManifestSchema extends UiPackageSchemaManifestBase {
  path: string;
  component?: string;
  extension?: string;
  replaces?: string;
}

export interface UiPackageTemplateManifestSchema extends UiPackageComponentLikeManifestSchema {
  kind: "template";
}

export interface UiPackageFieldManifestSchema extends UiPackageComponentLikeManifestSchema {
  kind: "field";
}

export interface UiPackageGridManifestSchema extends UiPackageComponentLikeManifestSchema {
  kind: "grid";
}

export interface UiPackageEnumManifestSchema extends UiPackageSchemaManifestBase {
  kind: "enum";
  path?: string;
  values?: string | UiPackageEnumValues;
  extension?: string;
  replaces?: string;
}

export interface UiPackageModuleManifestSchema extends UiPackageSchemaManifestBase {
  kind: "module";
  path: string;
  resourceType?: string;
  schema?: string;
  exports?: string;
}

export interface UiPackageComponentManifestSchema extends UiPackageSchemaManifestBase {
  kind: "component";
  path: string;
  component?: string;
  extension?: string;
  replaces?: string;
}

export type UiPackageModuleExports = Record<string, unknown>;
export type UiPackageModuleMap = Record<string, UiPackageModuleExports>;

export interface UiPackageRegistry {
  getPackage: (name: string) => UiPackageDescriptor;
  getPage: <TProps = Record<string, never>>(name: string) => ComponentType<TProps>;
  getWorkspace: (name: string) => UiPackageWorkspaceSchema;
  getWorkspaces: () => UiPackageWorkspaceSchema[];
  getWorkspaceSections: <TProps = any>(name: string) => UiPackageSectionSchema<TProps>[];
  getSection: <TProps = any>(name: string) => UiPackageSectionSchema<TProps>;
  getSections: <TProps = any>() => UiPackageSectionSchema<TProps>[];
  getTemplate: <TProps = Record<string, never>>(name: string) => ComponentType<TProps>;
  getOptionalTemplate: <TProps = Record<string, never>>(name: string) => ComponentType<TProps> | undefined;
  getField: <TProps = Record<string, never>>(name: string) => ComponentType<TProps>;
  getOptionalField: <TProps = Record<string, never>>(name: string) => ComponentType<TProps> | undefined;
  getGrid: <TProps = Record<string, never>>(name: string) => ComponentType<TProps>;
  getOptionalGrid: <TProps = Record<string, never>>(name: string) => ComponentType<TProps> | undefined;
  getEnum: <TValues extends UiPackageEnumValues = UiPackageEnumValues>(name: string) => TValues;
  getOptionalEnum: <TValues extends UiPackageEnumValues = UiPackageEnumValues>(name: string) => TValues | undefined;
  getModule: <TExports = UiPackageModuleExports>(name: string) => TExports;
  getOptionalModule: <TExports = UiPackageModuleExports>(name: string) => TExports | undefined;
  getComponent: <TProps = Record<string, never>>(name: string) => ComponentType<TProps>;
  getOptionalComponent: <TProps = Record<string, never>>(name: string) => ComponentType<TProps> | undefined;
  getSchemas: () => UiPackageSchema[];
}

export interface UiPackageProviderProps {
  registry?: UiPackageRegistry;
  packages?: readonly UiPackageDescriptor[];
  children: ReactNode;
}

const UiPackageRegistryContext = createContext<UiPackageRegistry | null>(null);

export function definePackage<TDescriptor extends UiPackageDescriptor>(descriptor: TDescriptor): TDescriptor {
  Titanic.registerPackage(descriptor);
  return descriptor;
}

export function definePageSchema<TProps = unknown>(
  schema: UiPackagePageSchema<TProps>
): UiPackagePageSchema<TProps> {
  return schema;
}

export function defineWorkspaceSchema(
  schema: UiPackageWorkspaceSchema
): UiPackageWorkspaceSchema {
  return schema;
}

export function defineSectionSchema<TProps = unknown>(
  schema: UiPackageSectionSchema<TProps>
): UiPackageSectionSchema<TProps> {
  return schema;
}

export function defineTemplateSchema<TProps = unknown>(
  schema: UiPackageTemplateSchema<TProps>
): UiPackageTemplateSchema<TProps> {
  return schema;
}

export function defineFieldSchema<TProps = unknown>(
  schema: UiPackageFieldSchema<TProps>
): UiPackageFieldSchema<TProps> {
  return schema;
}

export function defineGridSchema<TProps = unknown>(
  schema: UiPackageGridSchema<TProps>
): UiPackageGridSchema<TProps> {
  return schema;
}

export function defineEnumSchema<TValues extends UiPackageEnumValues = UiPackageEnumValues>(
  schema: UiPackageEnumSchema<TValues>
): UiPackageEnumSchema<TValues> {
  return schema;
}

export function defineModuleSchema<TExports = unknown>(
  schema: UiPackageModuleSchema<TExports>
): UiPackageModuleSchema<TExports> {
  return schema;
}

export interface UiPackageIconModuleSchema<TExports = UiPackageModuleExports> extends UiPackageModuleSchema<TExports> {
  resourceType: "icons";
}

export function defineIconModuleSchema<TExports extends UiPackageModuleExports = UiPackageModuleExports>(
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

export function defineComponentSchema<TProps = unknown>(
  schema: UiPackageComponentSchema<TProps>
): UiPackageComponentSchema<TProps> {
  return schema;
}

export function UiPackageProvider({ registry, packages = [], children }: UiPackageProviderProps) {
  const resolvedRegistry = useMemo(
    () => registry ?? createPackageRegistry(packages),
    [packages, registry]
  );

  return createElement(UiPackageRegistryContext.Provider, { value: resolvedRegistry }, children);
}

export function useUiPackageRegistry(): UiPackageRegistry | null {
  return useContext(UiPackageRegistryContext);
}

export function useOptionalUiComponent<TProps = Record<string, never>>(
  name: string
): ComponentType<TProps> | undefined {
  return useUiPackageRegistry()?.getOptionalComponent<TProps>(name);
}

export function useUiComponent<TProps = Record<string, never>>(
  name: string,
  fallback: ComponentType<TProps>
): ComponentType<TProps> {
  return useOptionalUiComponent<TProps>(name) ?? fallback;
}

export function useOptionalUiTemplate<TProps = Record<string, never>>(
  name: string
): ComponentType<TProps> | undefined {
  return useUiPackageRegistry()?.getOptionalTemplate<TProps>(name);
}

export function useUiTemplate<TProps = Record<string, never>>(
  name: string,
  fallback: ComponentType<TProps>
): ComponentType<TProps> {
  return useOptionalUiTemplate<TProps>(name) ?? fallback;
}

export function useOptionalUiField<TProps = Record<string, never>>(
  name: string
): ComponentType<TProps> | undefined {
  return useUiPackageRegistry()?.getOptionalField<TProps>(name);
}

export function useUiField<TProps = Record<string, never>>(
  name: string,
  fallback: ComponentType<TProps>
): ComponentType<TProps> {
  return useOptionalUiField<TProps>(name) ?? fallback;
}

export function useOptionalUiGrid<TProps = Record<string, never>>(
  name: string
): ComponentType<TProps> | undefined {
  return useUiPackageRegistry()?.getOptionalGrid<TProps>(name);
}

export function useUiGrid<TProps = Record<string, never>>(
  name: string,
  fallback: ComponentType<TProps>
): ComponentType<TProps> {
  return useOptionalUiGrid<TProps>(name) ?? fallback;
}

export function useOptionalUiEnum<TValues extends UiPackageEnumValues = UiPackageEnumValues>(
  name: string
): TValues | undefined {
  return useUiPackageRegistry()?.getOptionalEnum<TValues>(name);
}

export function useUiEnum<TValues extends UiPackageEnumValues = UiPackageEnumValues>(
  name: string,
  fallback: TValues
): TValues {
  return useOptionalUiEnum<TValues>(name) ?? fallback;
}

export function useOptionalUiModule<TExports = UiPackageModuleExports>(
  name: string
): TExports | undefined {
  return useUiPackageRegistry()?.getOptionalModule<TExports>(name);
}

export function useUiModule<TExports = UiPackageModuleExports>(
  name: string,
  fallback: TExports
): TExports {
  return useOptionalUiModule<TExports>(name) ?? fallback;
}

export function createPackageFromDescriptor(
  descriptor: UiPackageManifest,
  modules: UiPackageModuleMap
): UiPackageDescriptor {
  return definePackage({
    name: descriptor.name,
    version: descriptor.version,
    dependsOn: descriptor.dependsOn,
    schemas: (descriptor.schemas ?? []).map((schemaDescriptor) =>
      createSchemaFromDescriptor(descriptor.name, schemaDescriptor, modules)
    )
  });
}

export function createPackageRegistry(packages: readonly UiPackageDescriptor[]): UiPackageRegistry {
  const sortedPackages = sortPackages(packages);
  const packageMap = new Map(sortedPackages.map((item) => [item.name, item]));
  const pageMap = new Map<string, UiPackagePageSchema<any>>();
  const workspaceMap = new Map<string, UiPackageWorkspaceSchema>();
  const sectionMap = new Map<string, UiPackageSectionSchema<any>>();
  const templateMap = new Map<string, ComponentType<any>>();
  const fieldMap = new Map<string, ComponentType<any>>();
  const gridMap = new Map<string, ComponentType<any>>();
  const enumMap = new Map<string, UiPackageEnumValues>();
  const moduleMap = new Map<string, UiPackageModuleExports>();
  const componentMap = new Map<string, ComponentType<any>>();
  const schemas: UiPackageSchema[] = [];

  for (const packageDescriptor of sortedPackages) {
    for (const schema of packageDescriptor.schemas ?? []) {
      const normalizedSchema = {
        ...schema,
        packageName: schema.packageName ?? packageDescriptor.name
      };

      schemas.push(normalizedSchema);
      Titanic.registerSchema(normalizedSchema);

      if (normalizedSchema.kind === "page") {
        pageMap.set(normalizedSchema.name, normalizedSchema);
        pageMap.set(`${normalizedSchema.packageName}.${normalizedSchema.name}`, normalizedSchema);
      } else if (normalizedSchema.kind === "workspace") {
        workspaceMap.set(normalizedSchema.name, normalizedSchema);
        workspaceMap.set(`${normalizedSchema.packageName}.${normalizedSchema.name}`, normalizedSchema);
      } else if (normalizedSchema.kind === "section") {
        sectionMap.set(normalizedSchema.name, normalizedSchema);
        sectionMap.set(`${normalizedSchema.packageName}.${normalizedSchema.name}`, normalizedSchema);
      } else if (normalizedSchema.kind === "template") {
        const component = resolveComponentLikeSchema(normalizedSchema, templateMap, componentMap);

        for (const key of getComponentRegistryKeys(normalizedSchema)) {
          templateMap.set(key, component);
          componentMap.set(key, component);
        }
      } else if (normalizedSchema.kind === "field") {
        const component = resolveComponentLikeSchema(normalizedSchema, fieldMap, componentMap);

        for (const key of getComponentRegistryKeys(normalizedSchema)) {
          fieldMap.set(key, component);
          componentMap.set(key, component);
        }
      } else if (normalizedSchema.kind === "grid") {
        const component = resolveComponentLikeSchema(normalizedSchema, gridMap, componentMap);

        for (const key of getComponentRegistryKeys(normalizedSchema)) {
          gridMap.set(key, component);
          componentMap.set(key, component);
        }
      } else if (normalizedSchema.kind === "enum") {
        const values = resolveEnumSchema(normalizedSchema, enumMap);

        for (const key of getEnumRegistryKeys(normalizedSchema)) {
          enumMap.set(key, values);
        }
      } else if (normalizedSchema.kind === "module") {
        for (const key of getModuleRegistryKeys(normalizedSchema)) {
          moduleMap.set(key, normalizedSchema.exports);
        }
      } else if (normalizedSchema.kind === "component") {
        const component = resolveComponentLikeSchema(normalizedSchema, componentMap);

        for (const key of getComponentRegistryKeys(normalizedSchema)) {
          componentMap.set(key, component);
        }
      }
    }
  }

  validateWorkspaceNavigation(workspaceMap, sectionMap);

  return {
    getPackage: (name) => {
      const packageDescriptor = packageMap.get(name);
      if (!packageDescriptor) {
        throw new Error(`UI package "${name}" is not registered.`);
      }

      return packageDescriptor;
    },
    getPage: <TProps = Record<string, never>>(name: string) => {
      const schema = pageMap.get(name);
      if (!schema) {
        throw new Error(`UI page schema "${name}" is not registered.`);
      }

      return schema.component as ComponentType<TProps>;
    },
    getWorkspace: (name: string) => {
      const schema = workspaceMap.get(name);
      if (!schema) {
        throw new Error(`UI workspace schema "${name}" is not registered.`);
      }

      return schema;
    },
    getWorkspaces: () =>
      getUniqueSchemas(workspaceMap)
        .sort(compareNavigationItems),
    getWorkspaceSections: <TProps = any>(name: string) => {
      const workspace = workspaceMap.get(name);
      if (!workspace) {
        throw new Error(`UI workspace schema "${name}" is not registered.`);
      }

      return getUniqueSchemas(sectionMap)
        .filter((section) => isSectionInWorkspace(section, workspace))
        .sort(compareSections) as UiPackageSectionSchema<TProps>[];
    },
    getSection: <TProps = any>(name: string) => {
      const schema = sectionMap.get(name);
      if (!schema) {
        throw new Error(`UI section schema "${name}" is not registered.`);
      }

      return schema as UiPackageSectionSchema<TProps>;
    },
    getSections: <TProps = any>() =>
      getUniqueSchemas(sectionMap)
        .sort(compareSections) as UiPackageSectionSchema<TProps>[],
    getTemplate: <TProps = Record<string, never>>(name: string) => {
      const component = templateMap.get(name);
      if (!component) {
        throw new Error(`UI template schema "${name}" is not registered.`);
      }

      return component as ComponentType<TProps>;
    },
    getOptionalTemplate: <TProps = Record<string, never>>(name: string) =>
      templateMap.get(name) as ComponentType<TProps> | undefined,
    getField: <TProps = Record<string, never>>(name: string) => {
      const component = fieldMap.get(name);
      if (!component) {
        throw new Error(`UI field schema "${name}" is not registered.`);
      }

      return component as ComponentType<TProps>;
    },
    getOptionalField: <TProps = Record<string, never>>(name: string) =>
      fieldMap.get(name) as ComponentType<TProps> | undefined,
    getGrid: <TProps = Record<string, never>>(name: string) => {
      const component = gridMap.get(name);
      if (!component) {
        throw new Error(`UI grid schema "${name}" is not registered.`);
      }

      return component as ComponentType<TProps>;
    },
    getOptionalGrid: <TProps = Record<string, never>>(name: string) =>
      gridMap.get(name) as ComponentType<TProps> | undefined,
    getEnum: <TValues extends UiPackageEnumValues = UiPackageEnumValues>(name: string) => {
      const values = enumMap.get(name);
      if (!values) {
        throw new Error(`UI enum schema "${name}" is not registered.`);
      }

      return values as TValues;
    },
    getOptionalEnum: <TValues extends UiPackageEnumValues = UiPackageEnumValues>(name: string) =>
      enumMap.get(name) as TValues | undefined,
    getModule: <TExports = UiPackageModuleExports>(name: string) => {
      const moduleExports = moduleMap.get(name);
      if (!moduleExports) {
        throw new Error(`UI module schema "${name}" is not registered.`);
      }

      return moduleExports as TExports;
    },
    getOptionalModule: <TExports = UiPackageModuleExports>(name: string) =>
      moduleMap.get(name) as TExports | undefined,
    getComponent: <TProps = Record<string, never>>(name: string) => {
      const component = componentMap.get(name);
      if (!component) {
        throw new Error(`UI component schema "${name}" is not registered.`);
      }

      return component as ComponentType<TProps>;
    },
    getOptionalComponent: <TProps = Record<string, never>>(name: string) =>
      componentMap.get(name) as ComponentType<TProps> | undefined,
    getSchemas: () => schemas
  };
}

function sortPackages(packages: readonly UiPackageDescriptor[]): UiPackageDescriptor[] {
  const packageMap = new Map(packages.map((item) => [item.name, item]));
  const sorted: UiPackageDescriptor[] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (packageDescriptor: UiPackageDescriptor) => {
    if (visited.has(packageDescriptor.name)) {
      return;
    }

    if (visiting.has(packageDescriptor.name)) {
      throw new Error(`Circular UI package dependency detected at "${packageDescriptor.name}".`);
    }

    visiting.add(packageDescriptor.name);

    for (const dependencyName of packageDescriptor.dependsOn ?? []) {
      const dependency = packageMap.get(dependencyName);
      if (!dependency) {
        throw new Error(`UI package "${packageDescriptor.name}" depends on missing package "${dependencyName}".`);
      }

      visit(dependency);
    }

    visiting.delete(packageDescriptor.name);
    visited.add(packageDescriptor.name);
    sorted.push(packageDescriptor);
  };

  for (const packageDescriptor of packages) {
    visit(packageDescriptor);
  }

  return sorted;
}

function createSchemaFromDescriptor(
  packageName: string,
  schemaDescriptor: UiPackageManifestSchema,
  modules: UiPackageModuleMap
): UiPackageSchema {
  const resolvedPackageName = schemaDescriptor.packageName ?? packageName;

  if (schemaDescriptor.kind === "workspace") {
    return defineWorkspaceSchema({
      kind: "workspace",
      packageName: resolvedPackageName,
      name: schemaDescriptor.name,
      title: schemaDescriptor.title ?? schemaDescriptor.name,
      caption: schemaDescriptor.caption,
      order: schemaDescriptor.order,
      icon: schemaDescriptor.icon,
      sections: schemaDescriptor.sections
    });
  }

  if (schemaDescriptor.kind === "enum") {
    const moduleExports = schemaDescriptor.path ? resolveModuleExports(schemaDescriptor, modules) : undefined;
    const extension = schemaDescriptor.extension
      ? getRequiredExport<UiPackageEnumExtension>(
          moduleExports ?? {},
          schemaDescriptor.extension,
          schemaDescriptor
        )
      : undefined;
    const values = resolveEnumManifestValues(schemaDescriptor, moduleExports);

    return defineEnumSchema({
      kind: "enum",
      packageName: resolvedPackageName,
      name: schemaDescriptor.name,
      values,
      extension,
      replaces: schemaDescriptor.replaces
    });
  }

  const moduleExports = resolveModuleExports(schemaDescriptor, modules);

  if (schemaDescriptor.kind === "page") {
    const componentExportName = schemaDescriptor.component ?? schemaDescriptor.name;
    const component = getRequiredExport<ComponentType<any>>(
      moduleExports,
      componentExportName,
      schemaDescriptor
    );

    return definePageSchema({
      kind: "page",
      packageName: resolvedPackageName,
      name: schemaDescriptor.name,
      component,
      entityName: schemaDescriptor.entityName,
      entity: schemaDescriptor.entity
    });
  }

  if (schemaDescriptor.kind === "section") {
    const component = schemaDescriptor.component
      ? getRequiredExport<ComponentType<any>>(
          moduleExports,
          schemaDescriptor.component,
          schemaDescriptor
        )
      : undefined;

    return defineSectionSchema({
      kind: "section",
      packageName: resolvedPackageName,
      name: schemaDescriptor.name,
      title: schemaDescriptor.title ?? schemaDescriptor.name,
      caption: schemaDescriptor.caption,
      order: schemaDescriptor.order,
      icon: schemaDescriptor.icon,
      workspaceName: schemaDescriptor.workspace,
      pageName: schemaDescriptor.page,
      component,
      entityName: schemaDescriptor.entityName,
      entity: schemaDescriptor.entity
    });
  }

  if (schemaDescriptor.kind === "template") {
    return defineTemplateSchema(createComponentLikeSchemaFromDescriptor(
      "template",
      resolvedPackageName,
      schemaDescriptor,
      moduleExports
    ));
  }

  if (schemaDescriptor.kind === "field") {
    return defineFieldSchema(createComponentLikeSchemaFromDescriptor(
      "field",
      resolvedPackageName,
      schemaDescriptor,
      moduleExports
    ));
  }

  if (schemaDescriptor.kind === "grid") {
    return defineGridSchema(createComponentLikeSchemaFromDescriptor(
      "grid",
      resolvedPackageName,
      schemaDescriptor,
      moduleExports
    ));
  }

  if (schemaDescriptor.kind === "component") {
    return defineComponentSchema(createComponentLikeSchemaFromDescriptor(
      "component",
      resolvedPackageName,
      schemaDescriptor,
      moduleExports
    ));
  }

  if (schemaDescriptor.schema) {
    const schema = getRequiredExport<UiPackageModuleSchema>(
      moduleExports,
      schemaDescriptor.schema,
      schemaDescriptor
    );

    return {
      ...schema,
      packageName: schema.packageName ?? resolvedPackageName,
      name: schema.name ?? schemaDescriptor.name,
      entityName: schema.entityName ?? schemaDescriptor.entityName,
      entity: schema.entity ?? schemaDescriptor.entity
    };
  }

  const exportName = schemaDescriptor.exports ?? "default";
  const exportedValue = getRequiredExport<unknown>(moduleExports, exportName, schemaDescriptor);

  return defineModuleSchema({
    kind: "module",
    packageName: resolvedPackageName,
    name: schemaDescriptor.name,
    resourceType: schemaDescriptor.resourceType,
    exports: exportedValue,
    entityName: schemaDescriptor.entityName,
    entity: schemaDescriptor.entity
  });
}

function createComponentLikeSchemaFromDescriptor<TKind extends "component" | "template" | "field" | "grid">(
  kind: TKind,
  packageName: string,
  schemaDescriptor: {
    name: string;
    component?: string;
    extension?: string;
    replaces?: string;
  },
  moduleExports: UiPackageModuleExports
): (TKind extends "component" ? UiPackageComponentSchema<any> :
  TKind extends "template" ? UiPackageTemplateSchema<any> :
  TKind extends "field" ? UiPackageFieldSchema<any> :
  UiPackageGridSchema<any>) {
  const extension = schemaDescriptor.extension
    ? getRequiredExport<UiPackageComponentLikeExtension<any>>(
        moduleExports,
        schemaDescriptor.extension,
        schemaDescriptor as UiPackageManifestSchema
      )
    : undefined;
  const component = !extension
    ? getRequiredExport<ComponentType<any>>(
        moduleExports,
        schemaDescriptor.component ?? schemaDescriptor.name,
        schemaDescriptor as UiPackageManifestSchema
      )
    : schemaDescriptor.component
      ? getRequiredExport<ComponentType<any>>(
          moduleExports,
          schemaDescriptor.component,
          schemaDescriptor as UiPackageManifestSchema
        )
      : undefined;

  return {
    kind,
    packageName,
    name: schemaDescriptor.name,
    component,
    extension,
    replaces: schemaDescriptor.replaces
  } as TKind extends "component" ? UiPackageComponentSchema<any> :
    TKind extends "template" ? UiPackageTemplateSchema<any> :
    TKind extends "field" ? UiPackageFieldSchema<any> :
    UiPackageGridSchema<any>;
}

function resolveEnumManifestValues(
  schemaDescriptor: UiPackageEnumManifestSchema,
  moduleExports: UiPackageModuleExports | undefined
): UiPackageEnumValues | undefined {
  if (!schemaDescriptor.values) {
    return schemaDescriptor.extension
      ? undefined
      : getRequiredExport<UiPackageEnumValues>(
          moduleExports ?? {},
          schemaDescriptor.name,
          schemaDescriptor
        );
  }

  if (typeof schemaDescriptor.values === "string") {
    return getRequiredExport<UiPackageEnumValues>(
      moduleExports ?? {},
      schemaDescriptor.values,
      schemaDescriptor
    );
  }

  return schemaDescriptor.values;
}

function validateWorkspaceNavigation(
  workspaceMap: ReadonlyMap<string, UiPackageWorkspaceSchema>,
  sectionMap: ReadonlyMap<string, UiPackageSectionSchema<any>>
): void {
  const workspaces = getUniqueSchemas(workspaceMap);

  if (workspaces.length === 0) {
    return;
  }

  const standaloneSections = getUniqueSchemas(sectionMap)
    .filter((section) => !workspaces.some((workspace) => isSectionInWorkspace(section, workspace)));

  if (standaloneSections.length > 0) {
    const sectionNames = standaloneSections
      .map((section) => `${section.packageName}.${section.name}`)
      .join(", ");

    throw new Error(
      `UI package navigation cannot mix workspaces with standalone sections. Add sections to a workspace or remove workspaces. Standalone sections: ${sectionNames}.`
    );
  }
}

function getUniqueSchemas<TSchema>(schemaMap: ReadonlyMap<string, TSchema>): TSchema[] {
  return [...schemaMap.values()].filter((schema, index, schemas) => schemas.indexOf(schema) === index);
}

function isSectionInWorkspace(
  section: UiPackageSectionSchema<any>,
  workspace: UiPackageWorkspaceSchema
): boolean {
  if (section.workspaceName && schemaReferenceMatches(workspace, section.workspaceName)) {
    return true;
  }

  return (workspace.sections ?? []).some((sectionReference) =>
    schemaReferenceMatches(section, sectionReference)
  );
}

function schemaReferenceMatches(
  schema: { name: string; packageName?: string },
  reference: string
): boolean {
  return reference === schema.name ||
    reference === `${schema.packageName}.${schema.name}`;
}

function compareNavigationItems(
  left: Pick<UiPackageWorkspaceSchema, "order" | "title">,
  right: Pick<UiPackageWorkspaceSchema, "order" | "title">
): number {
  return (left.order ?? 0) - (right.order ?? 0) ||
    left.title.localeCompare(right.title);
}

function compareSections(
  left: UiPackageSectionSchema<any>,
  right: UiPackageSectionSchema<any>
): number {
  return compareNavigationItems(left, right);
}

function resolveEnumSchema(
  schema: UiPackageEnumSchema,
  enumMap: ReadonlyMap<string, UiPackageEnumValues>
): UiPackageEnumValues {
  const baseValues = findBaseEnum(schema, enumMap);

  if (schema.extension) {
    return schema.extension({
      name: schema.replaces ?? schema.name,
      packageName: schema.packageName ?? "",
      baseValues
    });
  }

  if (schema.values) {
    return schema.values;
  }

  throw new Error(`UI enum schema "${schema.name}" requires values or extension.`);
}

function findBaseEnum(
  schema: UiPackageEnumSchema,
  enumMap: ReadonlyMap<string, UiPackageEnumValues>
): UiPackageEnumValues | undefined {
  for (const key of getEnumBaseKeys(schema)) {
    const values = enumMap.get(key);
    if (values) {
      return values;
    }
  }

  return undefined;
}

function getEnumBaseKeys(schema: UiPackageEnumSchema): string[] {
  return schema.replaces
    ? [schema.replaces, getShortSchemaName(schema.replaces), schema.name]
    : [schema.name];
}

function getEnumRegistryKeys(schema: UiPackageEnumSchema): string[] {
  const packageName = schema.packageName ?? "";
  const keys = new Set<string>([
    schema.name,
    packageName ? `${packageName}.${schema.name}` : schema.name
  ]);

  if (schema.replaces) {
    keys.add(schema.replaces);
    keys.add(getShortSchemaName(schema.replaces));
  }

  return [...keys];
}

function getModuleRegistryKeys(schema: UiPackageModuleSchema): string[] {
  const packageName = schema.packageName ?? "";

  return [
    schema.name,
    packageName ? `${packageName}.${schema.name}` : schema.name
  ];
}

function resolveComponentLikeSchema(
  schema: UiPackageComponentLikeSchema<any>,
  componentMap: ReadonlyMap<string, ComponentType<any>>,
  fallbackComponentMap?: ReadonlyMap<string, ComponentType<any>>
): ComponentType<any> {
  const baseComponent = findBaseComponent(schema, componentMap) ??
    (fallbackComponentMap ? findBaseComponent(schema, fallbackComponentMap) : undefined);

  if (schema.extension) {
    return schema.extension({
      name: schema.replaces ?? schema.name,
      packageName: schema.packageName ?? "",
      baseComponent
    });
  }

  if (schema.component) {
    return schema.component;
  }

  throw new Error(`UI component schema "${schema.name}" requires component or extension.`);
}

function findBaseComponent(
  schema: UiPackageComponentLikeSchema<any>,
  componentMap: ReadonlyMap<string, ComponentType<any>>
): ComponentType<any> | undefined {
  for (const key of getComponentBaseKeys(schema)) {
    const component = componentMap.get(key);
    if (component) {
      return component;
    }
  }

  return undefined;
}

function getComponentBaseKeys(schema: UiPackageComponentLikeSchema<any>): string[] {
  return schema.replaces
    ? [schema.replaces, getShortSchemaName(schema.replaces), schema.name]
    : [schema.name];
}

function getComponentRegistryKeys(schema: UiPackageComponentLikeSchema<any>): string[] {
  const packageName = schema.packageName ?? "";
  const keys = new Set<string>([
    schema.name,
    packageName ? `${packageName}.${schema.name}` : schema.name
  ]);

  if (schema.replaces) {
    keys.add(schema.replaces);
    keys.add(getShortSchemaName(schema.replaces));
  }

  return [...keys];
}

function getShortSchemaName(name: string): string {
  return name.split(".").at(-1) ?? name;
}

function resolveModuleExports(
  schemaDescriptor: UiPackageManifestSchema,
  modules: UiPackageModuleMap
): UiPackageModuleExports {
  if (!schemaDescriptor.path) {
    throw new Error(`UI package schema "${schemaDescriptor.name}" requires module path.`);
  }

  const candidates = getModulePathCandidates(schemaDescriptor.path);
  const path = candidates.find((candidate) => modules[candidate]);

  if (!path) {
    throw new Error(
      `UI package schema "${schemaDescriptor.name}" module was not found. Tried: ${candidates.join(", ")}.`
    );
  }

  return modules[path];
}

function getModulePathCandidates(path: string): string[] {
  const normalizedPath = path.replace(/\\/g, "/").replace(/\/$/, "");
  return [
    normalizedPath,
    `${normalizedPath}.ts`,
    `${normalizedPath}.tsx`,
    `${normalizedPath}/index.ts`,
    `${normalizedPath}/index.tsx`
  ];
}

function getRequiredExport<TExport>(
  moduleExports: UiPackageModuleExports,
  exportName: string,
  schemaDescriptor: UiPackageManifestSchema
): TExport {
  const exportedValue = moduleExports[exportName];

  if (exportedValue === undefined) {
    throw new Error(
      `UI package schema "${schemaDescriptor.name}" requires export "${exportName}" from "${schemaDescriptor.path}".`
    );
  }

  return exportedValue as TExport;
}
