import type { ComponentType, ReactNode } from "react";

export type UiPackageEntityBinding =
  | string
  | {
      entityName: string;
      providerName?: string;
    };

export interface UiPackageSchemaBase {
  kind:
    | "component"
    | "enum"
    | "field"
    | "grid"
    | "module"
    | "page"
    | "section"
    | "template"
    | "workspace";
  name: string;
  packageName?: string;
  replaces?: string;
  title?: string;
  caption?: string;
  description?: string;
  entityName?: string;
  providerName?: string;
  entity?: UiPackageEntityBinding;
  metadata?: Record<string, unknown>;
}

export interface UiPackageWorkspaceSchema extends UiPackageSchemaBase {
  kind: "workspace";
  title: string;
  sections?: readonly string[];
  icon?: string;
  order?: number;
}

export interface UiPackageSectionSchema<TProps = unknown> extends UiPackageSchemaBase {
  kind: "section";
  title: string;
  workspaceName?: string;
  pageName?: string;
  page?: string;
  component?: ComponentType<TProps>;
  icon?: string;
  order?: number;
}

export interface UiPackageComponentLikeExtensionContext<TProps = unknown> {
  name: string;
  schema: UiPackageComponentLikeSchema<TProps>;
  baseComponent?: ComponentType<TProps>;
}

export type UiPackageComponentLikeExtension<TProps = unknown> = (
  context: UiPackageComponentLikeExtensionContext<TProps>
) => ComponentType<TProps>;

export interface UiPackageComponentLikeSchema<TProps = unknown> extends UiPackageSchemaBase {
  component?: ComponentType<TProps>;
  extension?: UiPackageComponentLikeExtension<TProps>;
}

export interface UiPackagePageSchema<TProps = unknown> extends UiPackageComponentLikeSchema<TProps> {
  kind: "page";
  route?: string;
}

export interface UiPackageTemplateSchema<TProps = unknown> extends UiPackageComponentLikeSchema<TProps> {
  kind: "template";
}

export interface UiPackageFieldSchema<TProps = unknown> extends UiPackageComponentLikeSchema<TProps> {
  kind: "field";
}

export interface UiPackageGridSchema<TProps = unknown> extends UiPackageComponentLikeSchema<TProps> {
  kind: "grid";
}

export interface UiPackageComponentExtensionContext<TProps = unknown>
  extends UiPackageComponentLikeExtensionContext<TProps> {}

export type UiPackageComponentExtension<TProps = unknown> = UiPackageComponentLikeExtension<TProps>;

export interface UiPackageComponentSchema<TProps = unknown>
  extends UiPackageComponentLikeSchema<TProps> {
  kind: "component";
}

export type UiPackageEnumValues = Record<string, string | number>;

export interface UiPackageEnumExtensionContext<TValues extends UiPackageEnumValues = UiPackageEnumValues> {
  name: string;
  packageName?: string;
  schema: UiPackageEnumSchema<TValues>;
  baseValues?: TValues;
}

export type UiPackageEnumExtension<TValues extends UiPackageEnumValues = UiPackageEnumValues> = (
  context: UiPackageEnumExtensionContext<TValues>
) => TValues;

export interface UiPackageEnumSchema<TValues extends UiPackageEnumValues = UiPackageEnumValues>
  extends UiPackageSchemaBase {
  kind: "enum";
  values?: TValues;
  extension?: UiPackageEnumExtension<TValues>;
}

export type UiPackageModuleExports = Record<string, unknown>;

export type UiPackageResourceType = "icons" | "localization";

export interface UiPackageModuleSchema<TExports extends UiPackageModuleExports = UiPackageModuleExports>
  extends UiPackageSchemaBase {
  kind: "module";
  exports?: TExports;
}

export interface UiPackageIconModuleSchema<
  TExports extends UiPackageModuleExports = UiPackageModuleExports
> extends UiPackageModuleSchema<TExports> {
  resourceType: "icons";
  groupName?: string;
}

export interface UiPackageLocalizationModuleSchema<
  TExports extends UiPackageModuleExports = UiPackageModuleExports
> extends UiPackageModuleSchema<TExports> {
  resourceType: "localization";
  schemaName?: string;
  groupName?: string;
  defaultLocale?: string;
}

export type UiPackageSchema =
  | UiPackageWorkspaceSchema
  | UiPackageSectionSchema<any>
  | UiPackagePageSchema<any>
  | UiPackageTemplateSchema<any>
  | UiPackageFieldSchema<any>
  | UiPackageGridSchema<any>
  | UiPackageComponentSchema<any>
  | UiPackageEnumSchema
  | UiPackageModuleSchema
  | UiPackageIconModuleSchema
  | UiPackageLocalizationModuleSchema;

export interface UiPackageDescriptor {
  name: string;
  version?: string;
  dependsOn?: readonly string[];
  schemas?: readonly UiPackageSchema[];
}

export interface UiPackageManifestSchema {
  kind: UiPackageSchema["kind"];
  name: string;
  resourceType?: UiPackageResourceType;
  schemaName?: string;
  groupName?: string;
  defaultLocale?: string;
  packageName?: string;
  replaces?: string;
  title?: string;
  caption?: string;
  description?: string;
  path?: string;
  component?: string;
  exportName?: string;
  values?: UiPackageEnumValues;
  route?: string;
  workspaceName?: string;
  pageName?: string;
  page?: string;
  sections?: readonly string[];
  icon?: string;
  order?: number;
  entityName?: string;
  providerName?: string;
  entity?: UiPackageEntityBinding;
  metadata?: Record<string, unknown>;
}

export interface UiPackageManifestDescriptor {
  name: string;
  version?: string;
  dependsOn?: readonly string[];
  schemas?: readonly UiPackageManifestSchema[];
}

export interface UiPackageRegistry {
  packages: readonly UiPackageDescriptor[];
  schemas: readonly UiPackageSchema[];
  workspaces: readonly UiPackageWorkspaceSchema[];
  sections: readonly UiPackageSectionSchema<any>[];
  pages: readonly UiPackagePageSchema<any>[];
  templates: readonly UiPackageTemplateSchema<any>[];
  fields: readonly UiPackageFieldSchema<any>[];
  grids: readonly UiPackageGridSchema<any>[];
  components: readonly UiPackageComponentSchema<any>[];
  enums: readonly UiPackageEnumSchema[];
  modules: readonly UiPackageModuleSchema[];
  icons: readonly UiPackageIconModuleSchema[];
  localizations: readonly UiPackageLocalizationModuleSchema[];
  getWorkspace(name: string): UiPackageWorkspaceSchema | undefined;
  getSection(name: string): UiPackageSectionSchema | undefined;
  getPage<TProps = unknown>(name: string): ComponentType<TProps> | undefined;
  getTemplate<TProps = unknown>(name: string): ComponentType<TProps> | undefined;
  getField<TProps = unknown>(name: string): ComponentType<TProps> | undefined;
  getGrid<TProps = unknown>(name: string): ComponentType<TProps> | undefined;
  getComponent<TProps = unknown>(name: string): ComponentType<TProps> | undefined;
  getEnum<TValues extends UiPackageEnumValues = UiPackageEnumValues>(
    name: string
  ): TValues | undefined;
  getModule<TExports extends UiPackageModuleExports = UiPackageModuleExports>(
    name: string
  ): TExports | undefined;
  getIconModule<TExports extends UiPackageModuleExports = UiPackageModuleExports>(
    name: string
  ): UiPackageIconModuleSchema<TExports> | undefined;
  getLocalizationModule<TExports extends UiPackageModuleExports = UiPackageModuleExports>(
    name: string
  ): UiPackageLocalizationModuleSchema<TExports> | undefined;
}

export interface UiPackageProviderProps {
  packages?: readonly UiPackageDescriptor[];
  registry?: UiPackageRegistry;
  children: ReactNode;
}
