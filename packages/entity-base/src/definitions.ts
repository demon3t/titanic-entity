import { Titanic } from "./Titanic";
import type {
  UiPackageComponentSchema,
  UiPackageDescriptor,
  UiPackageEnumSchema,
  UiPackageEnumValues,
  UiPackageFieldSchema,
  UiPackageGridSchema,
  UiPackageIconModuleSchema,
  UiPackageModuleExports,
  UiPackageModuleSchema,
  UiPackagePageSchema,
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
