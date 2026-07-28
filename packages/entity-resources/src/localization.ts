import {
  Titanic,
  defineLocalizationResources,
  type TitanicLocalizationResource,
  type TitanicLocalizationTree,
  type UiPackageLocalizationModuleSchema,
  type UiPackageModuleExports
} from "@titanic-entity/entity-base";

export interface DefineTitanicLocalizationOptions {
  name?: string;
  moduleName?: string;
  packageName?: string;
  groupName?: string;
  defaultLocale?: string;
}

export type TitanicLocalizationDefinitionSchema<
  TTree extends TitanicLocalizationTree = TitanicLocalizationTree
> = UiPackageLocalizationModuleSchema<
  UiPackageModuleExports & {
    localization: TitanicLocalizationResource<TTree>;
  }
>;

export type TitanicLocalizationDefine = <
  TTree extends TitanicLocalizationTree = TitanicLocalizationTree
>(
  schemaName: string,
  locale: string,
  localization: TTree,
  options?: DefineTitanicLocalizationOptions
) => TitanicLocalizationDefinitionSchema<TTree>;

function defineTitanicLocalization<
  TTree extends TitanicLocalizationTree = TitanicLocalizationTree
>(
  schemaName: string,
  locale: string,
  localization: TTree,
  options: DefineTitanicLocalizationOptions = {}
): TitanicLocalizationDefinitionSchema<TTree> {
  const { defaultLocale, groupName, moduleName, name, packageName } = options;
  const resource: TitanicLocalizationResource<TTree> = {
    ...(defaultLocale ? { defaultLocale } : {}),
    locales: {
      [locale]: localization
    } as Readonly<Record<string, TTree>>
  };

  const schema = defineLocalizationResources({
    name: moduleName ?? name ?? `${schemaName}.Localization.${locale}`,
    ...(packageName ? { packageName } : {}),
    schemaName,
    groupName: groupName ?? schemaName,
    ...(defaultLocale ? { defaultLocale } : {}),
    localization: resource
  }) as TitanicLocalizationDefinitionSchema<TTree>;

  Titanic.registerSchema(schema);

  return schema;
}

declare module "@titanic-entity/entity-base" {
  interface TitanicLocalizationRegistry {
    define: TitanicLocalizationDefine;
    merge: TitanicLocalizationDefine;
  }
}

const localizationApi = Titanic.Localization as typeof Titanic.Localization & {
  define?: TitanicLocalizationDefine;
  merge?: TitanicLocalizationDefine;
};

localizationApi.define ??= defineTitanicLocalization;
localizationApi.merge ??= defineTitanicLocalization;

export const Localization = Titanic.Localization;
export { Titanic };
