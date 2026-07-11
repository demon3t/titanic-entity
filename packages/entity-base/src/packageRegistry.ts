import { Titanic } from "./Titanic";
import {
  defineComponentSchema,
  defineEnumSchema,
  defineFieldSchema,
  defineGridSchema,
  defineIconModuleSchema,
  defineLocalizationModuleSchema,
  defineModuleSchema,
  definePackage,
  definePageSchema,
  defineSectionSchema,
  defineTemplateSchema,
  defineWorkspaceSchema
} from "./definitions";
import {
  getShortSchemaName,
  getUiPackageEnumRegistryKeys,
  resolveUiPackageEnumSchema
} from "./internal/enumSchemas";
import type {
  UiPackageComponentLikeSchema,
  UiPackageComponentSchema,
  UiPackageComponentType,
  UiPackageDescriptor,
  UiPackageEnumSchema,
  UiPackageEnumValues,
  UiPackageFieldSchema,
  UiPackageGridSchema,
  UiPackageIconModuleSchema,
  UiPackageLocalizationModuleSchema,
  UiPackageManifestDescriptor,
  UiPackageManifestSchema,
  UiPackageModuleExports,
  UiPackageModuleSchema,
  UiPackagePageSchema,
  UiPackageRegistry,
  UiPackageSchema,
  UiPackageSectionSchema,
  UiPackageTemplateSchema,
  UiPackageWorkspaceSchema
} from "./types";
import { UiPackageResourceType } from "./types";

export function createPackageRegistry(packages: readonly UiPackageDescriptor[] = []): UiPackageRegistry {
  const allPackages = getPackagesInDependencyOrder(packages);
  const schemas: UiPackageSchema[] = [];
  const workspaceMap = new Map<string, UiPackageWorkspaceSchema>();
  const sectionMap = new Map<string, UiPackageSectionSchema>();
  const pageSchemaMap = new Map<string, UiPackagePageSchema>();
  const pageMap = new Map<string, UiPackageComponentType<unknown>>();
  const templateSchemaMap = new Map<string, UiPackageTemplateSchema>();
  const templateMap = new Map<string, UiPackageComponentType<unknown>>();
  const fieldSchemaMap = new Map<string, UiPackageFieldSchema>();
  const fieldMap = new Map<string, UiPackageComponentType<unknown>>();
  const gridSchemaMap = new Map<string, UiPackageGridSchema>();
  const gridMap = new Map<string, UiPackageComponentType<unknown>>();
  const componentSchemaMap = new Map<string, UiPackageComponentSchema>();
  const componentMap = new Map<string, UiPackageComponentType<unknown>>();
  const enumSchemaMap = new Map<string, UiPackageEnumSchema>();
  const enumMap = new Map<string, UiPackageEnumValues>();
  const moduleSchemaMap = new Map<string, UiPackageModuleSchema>();
  const moduleMap = new Map<string, UiPackageModuleExports>();
  const iconModuleMap = new Map<string, UiPackageIconModuleSchema>();
  const localizationModuleMap = new Map<string, UiPackageLocalizationModuleSchema>();

  for (const pkg of allPackages) {
    for (const schema of pkg.schemas ?? []) {
      const normalizedSchema = {
        ...schema,
        packageName: schema.packageName ?? pkg.name
      } as UiPackageSchema;
      schemas.push(normalizedSchema);
      Titanic.registerSchema(normalizedSchema);

      switch (normalizedSchema.kind) {
        case "workspace":
          workspaceMap.set(normalizedSchema.name, normalizedSchema);
          break;
        case "section":
          sectionMap.set(normalizedSchema.name, normalizedSchema);
          break;
        case "page":
          registerComponentLike(normalizedSchema, pageSchemaMap, pageMap);
          registerComponentLike(
            toComponentSchema(normalizedSchema),
            componentSchemaMap,
            componentMap
          );
          break;
        case "template":
          registerComponentLike(normalizedSchema, templateSchemaMap, templateMap);
          registerComponentLike(
            toComponentSchema(normalizedSchema),
            componentSchemaMap,
            componentMap
          );
          break;
        case "field":
          registerComponentLike(normalizedSchema, fieldSchemaMap, fieldMap);
          registerComponentLike(
            toComponentSchema(normalizedSchema),
            componentSchemaMap,
            componentMap
          );
          break;
        case "grid":
          registerComponentLike(normalizedSchema, gridSchemaMap, gridMap);
          registerComponentLike(
            toComponentSchema(normalizedSchema),
            componentSchemaMap,
            componentMap
          );
          break;
        case "component":
          registerComponentLike(normalizedSchema, componentSchemaMap, componentMap);
          break;
        case "enum": {
          const values = resolveUiPackageEnumSchema(normalizedSchema, (key) => enumMap.get(key));

          for (const key of getUiPackageEnumRegistryKeys(normalizedSchema, {
            includeShortName: false
          })) {
            enumSchemaMap.set(key, normalizedSchema);
            enumMap.set(key, values);
          }
          break;
        }
        case "module":
          registerModule(
            normalizedSchema,
            moduleSchemaMap,
            moduleMap,
            iconModuleMap,
            localizationModuleMap
          );
          break;
        default:
          break;
      }
    }
  }

  validateNavigation([...workspaceMap.values()], [...sectionMap.values()]);

  return {
    packages: allPackages,
    schemas,
    workspaces: [...workspaceMap.values()],
    sections: [...sectionMap.values()],
    pages: [...pageSchemaMap.values()],
    templates: [...templateSchemaMap.values()],
    fields: [...fieldSchemaMap.values()],
    grids: [...gridSchemaMap.values()],
    components: [...componentSchemaMap.values()],
    enums: [...enumSchemaMap.values()],
    modules: [...moduleSchemaMap.values()],
    icons: [...iconModuleMap.values()],
    localizations: [...localizationModuleMap.values()],
    getWorkspace: (name) => workspaceMap.get(name),
    getSection: (name) => sectionMap.get(name),
    getPage: <TProps = unknown>(name: string) => pageMap.get(name) as
      | UiPackageComponentType<TProps>
      | undefined,
    getTemplate: <TProps = unknown>(name: string) => templateMap.get(name) as
      | UiPackageComponentType<TProps>
      | undefined,
    getField: <TProps = unknown>(name: string) => fieldMap.get(name) as
      | UiPackageComponentType<TProps>
      | undefined,
    getGrid: <TProps = unknown>(name: string) => gridMap.get(name) as
      | UiPackageComponentType<TProps>
      | undefined,
    getComponent: <TProps = unknown>(name: string) => componentMap.get(name) as
      | UiPackageComponentType<TProps>
      | undefined,
    getEnum: <TValues extends UiPackageEnumValues = UiPackageEnumValues>(name: string) =>
      enumMap.get(name) as TValues | undefined,
    getModule: <TExports extends UiPackageModuleExports = UiPackageModuleExports>(name: string) =>
      moduleMap.get(name) as TExports | undefined,
    getIconModule: <TExports extends UiPackageModuleExports = UiPackageModuleExports>(
      name: string
    ) => iconModuleMap.get(name) as
      | UiPackageIconModuleSchema<TExports>
      | undefined,
    getLocalizationModule: <TExports extends UiPackageModuleExports = UiPackageModuleExports>(
      name: string
    ) => localizationModuleMap.get(name) as
      | UiPackageLocalizationModuleSchema<TExports>
      | undefined
  };
}

export function createPackageFromDescriptor(
  descriptor: UiPackageManifestDescriptor,
  modules: Record<string, Record<string, unknown>>
): UiPackageDescriptor {
  const schemas = (descriptor.schemas ?? []).map((schemaDescriptor) =>
    createSchemaFromDescriptor(descriptor.name, schemaDescriptor, modules)
  );

  return definePackage({
    name: descriptor.name,
    version: descriptor.version,
    dependsOn: descriptor.dependsOn,
    schemas
  });
}

function getPackagesInDependencyOrder(
  packages: readonly UiPackageDescriptor[]
): UiPackageDescriptor[] {
  const packageByName = new Map<string, UiPackageDescriptor>();

  for (const pkg of packages) {
    packageByName.set(pkg.name, pkg);
  }

  const ordered: UiPackageDescriptor[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(pkg: UiPackageDescriptor): void {
    if (visited.has(pkg.name)) {
      return;
    }

    if (visiting.has(pkg.name)) {
      throw new Error(`Circular UI package dependency detected: ${pkg.name}`);
    }

    visiting.add(pkg.name);

    for (const dependencyName of pkg.dependsOn ?? []) {
      const dependency = packageByName.get(dependencyName);

      if (dependency) {
        visit(dependency);
      }
    }

    visiting.delete(pkg.name);
    visited.add(pkg.name);
    ordered.push(pkg);
  }

  for (const pkg of packages) {
    visit(pkg);
  }

  return ordered;
}

function registerComponentLike<TSchema extends UiPackageComponentLikeSchema>(
  schema: TSchema,
  schemaMap: Map<string, TSchema>,
  componentMap: Map<string, UiPackageComponentType<unknown>>
): void {
  const baseComponent = findBaseComponent(schema, componentMap);
  const component = schema.extension
    ? schema.extension({
        name: schema.name,
        schema,
        baseComponent: baseComponent as UiPackageComponentType<unknown> | undefined
      })
    : schema.component;

  for (const key of getRegistryKeys(schema)) {
    schemaMap.set(key, schema);

    if (component) {
      componentMap.set(key, component as UiPackageComponentType<unknown>);
    }
  }
}

function registerModule(
  schema: UiPackageModuleSchema,
  schemaMap: Map<string, UiPackageModuleSchema>,
  moduleMap: Map<string, UiPackageModuleExports>,
  iconModuleMap: Map<string, UiPackageIconModuleSchema>,
  localizationModuleMap: Map<string, UiPackageLocalizationModuleSchema>
): void {
  const isIconModule = isUiPackageIconModule(schema);
  const isLocalizationModule = isUiPackageLocalizationModule(schema);

  for (const key of getRegistryKeys(schema)) {
    schemaMap.set(key, schema);

    if (schema.exports) {
      moduleMap.set(key, schema.exports);
    }

    if (isIconModule) {
      iconModuleMap.set(key, schema);
    }

    if (isLocalizationModule) {
      localizationModuleMap.set(key, schema);
    }
  }
}

function findBaseComponent(
  schema: UiPackageComponentLikeSchema,
  componentMap: Map<string, UiPackageComponentType<unknown>>
): UiPackageComponentType<unknown> | undefined {
  const keys = new Set<string>();

  if (schema.replaces) {
    keys.add(schema.replaces);
    keys.add(getShortSchemaName(schema.replaces));
  }

  keys.add(schema.name);
  keys.add(getShortSchemaName(schema.name));

  for (const key of keys) {
    const component = componentMap.get(key);

    if (component) {
      return component;
    }
  }

  return undefined;
}

function getRegistryKeys(schema: Pick<UiPackageSchema, "name" | "packageName" | "replaces">): string[] {
  const keys = new Set<string>([schema.name]);

  if (schema.packageName) {
    keys.add(`${schema.packageName}.${schema.name}`);
  }

  if (schema.replaces) {
    keys.add(schema.replaces);
    keys.add(getShortSchemaName(schema.replaces));
  }

  return [...keys];
}

function toComponentSchema<TProps>(
  schema: UiPackageComponentLikeSchema<TProps>
): UiPackageComponentSchema<TProps> {
  return {
    ...schema,
    kind: "component"
  };
}

function validateNavigation(
  workspaces: UiPackageWorkspaceSchema[],
  sections: UiPackageSectionSchema[]
): void {
  if (workspaces.length === 0) {
    return;
  }

  const workspaceNames = new Set(workspaces.map((workspace) => workspace.name));
  const sectionNamesFromWorkspaces = new Set(
    workspaces.flatMap((workspace) => workspace.sections ?? [])
  );

  for (const section of sections) {
    const workspaceName = section.workspaceName;
    const isConnectedByWorkspace = sectionNamesFromWorkspaces.has(section.name);

    if (!workspaceName && !isConnectedByWorkspace) {
      throw new Error(
        `Section "${section.name}" must be linked to a workspace via workspaceName or workspace.sections.`
      );
    }

    if (workspaceName && !workspaceNames.has(workspaceName)) {
      throw new Error(
        `Section "${section.name}" references missing workspace "${workspaceName}".`
      );
    }
  }
}

function createSchemaFromDescriptor(
  packageName: string,
  schemaDescriptor: UiPackageManifestSchema,
  modules: Record<string, Record<string, unknown>>
): UiPackageSchema {
  const entity = resolveEntityBinding(schemaDescriptor);
  const entityName =
    typeof entity === "string" ? entity : entity?.entityName ?? schemaDescriptor.entityName;
  const providerName =
    typeof entity === "string" ? schemaDescriptor.providerName : entity?.providerName;
  const base = {
    name: schemaDescriptor.name,
    packageName: schemaDescriptor.packageName ?? packageName,
    replaces: schemaDescriptor.replaces,
    title: schemaDescriptor.title,
    caption: schemaDescriptor.caption,
    description: schemaDescriptor.description,
    entity,
    entityName,
    providerName,
    metadata: schemaDescriptor.metadata
  };

  switch (schemaDescriptor.kind) {
    case "workspace":
      return defineWorkspaceSchema({
        ...base,
        kind: "workspace",
        title: base.title ?? schemaDescriptor.name,
        sections: schemaDescriptor.sections,
        icon: schemaDescriptor.icon,
        order: schemaDescriptor.order
      });
    case "section":
      return defineSectionSchema({
        ...base,
        kind: "section",
        title: base.title ?? schemaDescriptor.name,
        workspaceName: schemaDescriptor.workspaceName,
        pageName: schemaDescriptor.pageName,
        page: schemaDescriptor.page,
        icon: schemaDescriptor.icon,
        order: schemaDescriptor.order
      });
    case "page":
      return definePageSchema({
        ...base,
        kind: "page",
        route: schemaDescriptor.route,
        component: resolveComponent(schemaDescriptor, modules)
      });
    case "template":
      return createComponentLikeSchemaFromDescriptor(schemaDescriptor, modules, "template", base);
    case "field":
      return createComponentLikeSchemaFromDescriptor(schemaDescriptor, modules, "field", base);
    case "grid":
      return createComponentLikeSchemaFromDescriptor(schemaDescriptor, modules, "grid", base);
    case "component":
      return createComponentLikeSchemaFromDescriptor(schemaDescriptor, modules, "component", base);
    case "enum":
      return defineEnumSchema({
        ...base,
        kind: "enum",
        values: schemaDescriptor.values
      });
    case "module":
      if (schemaDescriptor.resourceType === UiPackageResourceType.Icons) {
        return defineIconModuleSchema({
          ...base,
          kind: "module",
          groupName: schemaDescriptor.groupName,
          exports: resolveModuleExports(schemaDescriptor, modules)
        });
      }

      if (schemaDescriptor.resourceType === UiPackageResourceType.Localization) {
        return defineLocalizationModuleSchema({
          ...base,
          kind: "module",
          groupName: schemaDescriptor.groupName,
          defaultLocale: schemaDescriptor.defaultLocale,
          exports: resolveModuleExports(schemaDescriptor, modules)
        });
      }

      return defineModuleSchema({
        ...base,
        kind: "module",
        exports: resolveModuleExports(schemaDescriptor, modules)
      });
    default:
      throw new Error(`Unsupported UI package schema kind: ${schemaDescriptor.kind}`);
  }
}

function createComponentLikeSchemaFromDescriptor(
  schemaDescriptor: UiPackageManifestSchema,
  modules: Record<string, Record<string, unknown>>,
  kind: "component" | "field" | "grid" | "template",
  base: Omit<UiPackageSchema, "kind" | "name"> & { name: string }
): UiPackageSchema {
  const component = resolveComponent(schemaDescriptor, modules);

  switch (kind) {
    case "template":
      return defineTemplateSchema({
        ...base,
        kind,
        component
      });
    case "field":
      return defineFieldSchema({
        ...base,
        kind,
        component
      });
    case "grid":
      return defineGridSchema({
        ...base,
        kind,
        component
      });
    case "component":
      return defineComponentSchema({
        ...base,
        kind,
        component
      });
    default:
      throw new Error(`Unsupported component-like UI package schema kind: ${kind}`);
  }
}

function resolveComponent(
  schemaDescriptor: UiPackageManifestSchema,
  modules: Record<string, Record<string, unknown>>
): UiPackageComponentType<unknown> | undefined {
  const exports = resolveModuleExports(schemaDescriptor, modules);

  if (!exports) {
    return undefined;
  }

  const exportName = schemaDescriptor.component ?? schemaDescriptor.exportName ?? "default";
  return exports[exportName] as UiPackageComponentType<unknown> | undefined;
}

function resolveModuleExports(
  schemaDescriptor: UiPackageManifestSchema,
  modules: Record<string, Record<string, unknown>>
): Record<string, unknown> | undefined {
  if (!schemaDescriptor.path) {
    return undefined;
  }

  return modules[schemaDescriptor.path];
}

function resolveEntityBinding(schemaDescriptor: UiPackageManifestSchema) {
  if (schemaDescriptor.entity) {
    return schemaDescriptor.entity;
  }

  if (!schemaDescriptor.entityName) {
    return undefined;
  }

  return {
    entityName: schemaDescriptor.entityName,
    providerName: schemaDescriptor.providerName
  };
}

function isUiPackageIconModule(schema: UiPackageModuleSchema): schema is UiPackageIconModuleSchema {
  return (schema as Partial<UiPackageIconModuleSchema>).resourceType === UiPackageResourceType.Icons;
}

function isUiPackageLocalizationModule(
  schema: UiPackageModuleSchema
): schema is UiPackageLocalizationModuleSchema {
  return (
    (schema as Partial<UiPackageLocalizationModuleSchema>).resourceType ===
    UiPackageResourceType.Localization
  );
}
