import * as React from "react";
import type { ReactNode } from "react";
import { Titanic as CoreTitanic, type EntityValues } from "@titanic-entity/entity-core";
import type {
  BaseModuleMethod,
  BaseModuleMethodThis,
  BaseModuleMethods
} from "./base-module";
import { baseSectionTemplate } from "./base-section";
import type {
  BaseSectionDiffItem,
  BaseSectionTemplate,
  NormalizedBaseSectionTemplate
} from "./base-section";
import { baseEntityPageTemplate } from "./entity-edit/entityEditPageTemplate";
import type {
  EntityEditPageAttribute,
  EntityEditPageAttributes,
  EntityEditPageContext,
  EntityEditPageMethodThis,
  EntityEditPageMixin,
  EntityEditPageTemplate
} from "./entity-edit/models/EntityEditPageTemplate";

export type EntityReactModuleType = "component" | "page" | "section";
type EntityReactTemplateModuleType = Exclude<EntityReactModuleType, "component">;

export interface EntityReactModuleMetadata<TModuleType extends EntityReactModuleType = EntityReactModuleType> {
  readonly $className: string;
  readonly $moduleType: TModuleType;
}

export type DefinedEntityPageTemplate = EntityEditPageTemplate & EntityReactModuleMetadata<"page">;

export type DefinedEntitySectionTemplate<TDiff extends BaseSectionDiffItem[] = BaseSectionDiffItem[]> =
  BaseSectionTemplate<TDiff> & EntityReactModuleMetadata<"section">;

export type EntityReactComponentModule<TProps extends object = Record<string, never>> =
  (props: TProps) => ReactNode;

export interface TitanicEntityComponentScope<TProps extends object = Record<string, never>> {
  readonly className: string;
  readonly props: TProps;
  readonly attributes: Record<string, unknown>;
  readonly state: Record<string, unknown>;
  readonly refs: Record<string, React.RefObject<unknown>>;
  readonly locals: Record<string, unknown>;
  readonly methods: Record<string, (...args: unknown[]) => unknown>;
  get(path: string): unknown;
  renderDiff(diff?: readonly TitanicEntityComponentDiffItem[], locals?: Record<string, unknown>): ReactNode;
}

export type TitanicEntityComponentMethod<
  TProps extends object = Record<string, never>,
  TResult = unknown
> = (
  this: TitanicEntityComponentScope<TProps>,
  ...args: unknown[]
) => TResult;

export interface TitanicEntityComponentAttributeDefinition<
  TProps extends object = Record<string, never>
> {
  default?: unknown;
  deps?: TitanicEntityComponentValueExpression | readonly TitanicEntityComponentValueExpression[];
  effect?: TitanicEntityComponentMethod<TProps, void | (() => void)>;
  id?: boolean;
  memo?: TitanicEntityComponentMethod<TProps>;
  ref?: boolean;
  state?: boolean;
  value?: TitanicEntityComponentMethod<TProps>;
}

export type TitanicEntityComponentAttributes<TProps extends object = Record<string, never>> =
  Record<string, TitanicEntityComponentAttributeDefinition<TProps> | unknown>;

export type TitanicEntityComponentValueExpression =
  | unknown
  | {
      and?: readonly TitanicEntityComponentValueExpression[];
      args?: readonly TitanicEntityComponentValueExpression[];
      array?: readonly TitanicEntityComponentValueExpression[];
      attr?: string;
      call?: string;
      coalesce?: readonly TitanicEntityComponentValueExpression[];
      diff?: readonly TitanicEntityComponentDiffItem[];
      eq?: readonly [TitanicEntityComponentValueExpression, TitanicEntityComponentValueExpression];
      get?: string;
      literal?: unknown;
      local?: string;
      method?: string;
      neq?: readonly [TitanicEntityComponentValueExpression, TitanicEntityComponentValueExpression];
      not?: TitanicEntityComponentValueExpression;
      object?: Record<string, TitanicEntityComponentValueExpression>;
      or?: readonly TitanicEntityComponentValueExpression[];
      path?: string;
      prop?: string;
      ref?: string;
      render?: readonly TitanicEntityComponentDiffItem[];
      state?: string;
    };

export type TitanicEntityComponentDiffItem =
  | ReactNode
  | {
      as?: string;
      children?: TitanicEntityComponentDiffItem | readonly TitanicEntityComponentDiffItem[];
      component?: TitanicEntityComponentValueExpression;
      diff?: readonly TitanicEntityComponentDiffItem[];
      each?: TitanicEntityComponentValueExpression;
      indexAs?: string;
      key?: TitanicEntityComponentValueExpression;
      props?: Record<string, TitanicEntityComponentValueExpression>;
      slot?: string;
      tag?: TitanicEntityComponentValueExpression;
      text?: TitanicEntityComponentValueExpression;
      unless?: TitanicEntityComponentValueExpression;
      when?: TitanicEntityComponentValueExpression;
      call?: string;
      args?: readonly TitanicEntityComponentValueExpression[];
    };

export interface EntityReactComponentDefinitionMetadata<TDefinition extends object = object> {
  readonly $definition?: TDefinition;
}

export type DefinedEntityReactComponent<TProps extends object = Record<string, never>> =
  EntityReactComponentModule<TProps> &
  EntityReactModuleMetadata<"component"> &
  EntityReactComponentDefinitionMetadata;

export type DefinedEntityReactModule<TDiff extends BaseSectionDiffItem[] = BaseSectionDiffItem[]> =
  DefinedEntityPageTemplate | DefinedEntitySectionTemplate<TDiff> | DefinedEntityReactComponent<any>;

export interface EntityPageTemplateFactory {
  readonly template: EntityEditPageTemplate;
  extend<TEntity extends object>(template: EntityPageTemplate<TEntity>): EntityEditPageTemplate;
  define<TEntity extends object>(className: string, template: EntityPageTemplate<TEntity>): DefinedEntityPageTemplate;
}

export interface EntitySectionTemplateFactory {
  readonly template: BaseSectionTemplate;
  extend<TEntity extends object, TDiff extends BaseSectionDiffItem[] = BaseSectionDiffItem[]>(
    template: EntitySectionTemplate<TEntity, TDiff>
  ): BaseSectionTemplate<TDiff>;
  define<TEntity extends object, TDiff extends BaseSectionDiffItem[] = BaseSectionDiffItem[]>(
    className: string,
    template: EntitySectionTemplate<TEntity, TDiff>
  ): DefinedEntitySectionTemplate<TDiff>;
}

export type EntityPageEntityKey<TEntity extends object> = Extract<keyof TEntity, string>;
export type EntityPageValues<TEntity extends object> = EntityValues & Partial<TEntity>;
export type EntityPageValuesUpdater<TEntity extends object> =
  EntityPageValues<TEntity> | ((values: EntityPageValues<TEntity>) => EntityPageValues<TEntity>);

export type EntityPageAttributes<TEntity extends object> = {
  [TKey in EntityPageEntityKey<TEntity>]?: EntityEditPageAttribute<TEntity[TKey]>;
} & EntityEditPageAttributes;

export interface EntityPageContext<TEntity extends object>
  extends Omit<
    EntityEditPageContext,
    "attributes" | "getValue" | "methods" | "setValue" | "setValues" | "values"
  > {
  attributes: EntityPageAttributes<TEntity>;
  methods: EntityPageMethods<TEntity>;
  values: EntityPageValues<TEntity>;
  getValue<TKey extends EntityPageEntityKey<TEntity>>(key: TKey): TEntity[TKey] | undefined;
  getValue<TValue = unknown>(key: string): TValue | undefined;
  setValue<TKey extends EntityPageEntityKey<TEntity>>(key: TKey, value: TEntity[TKey]): void;
  setValue(key: string, value: unknown): void;
  setValues(updater: EntityPageValuesUpdater<TEntity>): void;
}

export interface EntityPageMethodThis<TEntity extends object>
  extends BaseModuleMethodThis, EntityPageContext<TEntity> {
  context: EntityPageContext<TEntity>;
}

export type EntityPageMethod<TEntity extends object, TResult = unknown> =
  BaseModuleMethod<EntityPageContext<TEntity>, EntityPageMethodThis<TEntity>, TResult>;

export type EntityPageMethods<TEntity extends object> =
  BaseModuleMethods<EntityPageContext<TEntity>, EntityPageMethodThis<TEntity>, EntityPageMethod<TEntity>>;

export interface EntityPageMixin<TEntity extends object>
  extends Omit<EntityEditPageMixin, "attributes" | "methods"> {
  attributes?: EntityPageAttributes<TEntity>;
  methods?: EntityPageMethods<TEntity>;
}

export interface EntityPageTemplate<TEntity extends object>
  extends Omit<EntityEditPageTemplate, "attributes" | "base" | "methods" | "mixins"> {
  attributes?: EntityPageAttributes<TEntity>;
  base?: EntityPageTemplateLike<TEntity>;
  extend?: EntityPageTemplateLike<TEntity>;
  extends?: EntityPageTemplateLike<TEntity>;
  methods?: EntityPageMethods<TEntity>;
  mixins?: EntityPageMixin<TEntity>[];
}

export type EntityPageTemplateLike<TEntity extends object> =
  EntityPageTemplate<TEntity> | EntityEditPageTemplate | EntityPageTemplateFactory;

export interface EntitySectionContext<
  TEntity extends object,
  TDiff extends BaseSectionDiffItem[] = BaseSectionDiffItem[]
> {
  diff: TDiff;
  entity?: Partial<TEntity>;
  methods: EntitySectionMethods<TEntity, TDiff>;
  runMethod: (name: string, ...args: unknown[]) => Promise<unknown>;
  template: NormalizedBaseSectionTemplate<TDiff>;
  values?: EntityPageValues<TEntity>;
}

export interface EntitySectionMethodThis<
  TEntity extends object,
  TDiff extends BaseSectionDiffItem[] = BaseSectionDiffItem[]
> extends BaseModuleMethodThis, EntitySectionContext<TEntity, TDiff> {
  context: EntitySectionContext<TEntity, TDiff>;
}

export type EntitySectionMethod<
  TEntity extends object,
  TDiff extends BaseSectionDiffItem[] = BaseSectionDiffItem[],
  TResult = unknown
> = BaseModuleMethod<EntitySectionContext<TEntity, TDiff>, EntitySectionMethodThis<TEntity, TDiff>, TResult>;

export type EntitySectionMethods<
  TEntity extends object,
  TDiff extends BaseSectionDiffItem[] = BaseSectionDiffItem[]
> = BaseModuleMethods<
  EntitySectionContext<TEntity, TDiff>,
  EntitySectionMethodThis<TEntity, TDiff>,
  EntitySectionMethod<TEntity, TDiff>
>;

export interface EntitySectionTemplate<
  TEntity extends object,
  TDiff extends BaseSectionDiffItem[] = BaseSectionDiffItem[]
> extends Omit<BaseSectionTemplate<TDiff>, "base" | "methods"> {
  base?: EntitySectionTemplateLike<TEntity, TDiff>;
  extend?: EntitySectionTemplateLike<TEntity, TDiff>;
  extends?: EntitySectionTemplateLike<TEntity, TDiff>;
  methods?: EntitySectionMethods<TEntity, TDiff>;
}

export type EntitySectionTemplateLike<
  TEntity extends object,
  TDiff extends BaseSectionDiffItem[] = BaseSectionDiffItem[]
> = EntitySectionTemplate<TEntity, TDiff> | BaseSectionTemplate<TDiff> | EntitySectionTemplateFactory;

export type TitanicEntityPageDefinition<TEntity extends object> =
  EntityPageTemplate<TEntity>;

export type TitanicEntitySectionDefinition<
  TEntity extends object,
  TDiff extends BaseSectionDiffItem[] = BaseSectionDiffItem[]
> = EntitySectionTemplate<TEntity, TDiff>;

export interface TitanicEntityComponentDefinitionMethods<TProps extends object = Record<string, never>>
  extends Record<string, unknown> {
  render?: EntityReactComponentModule<TProps>;
}

export interface TitanicEntityComponentDefinitionBase<TProps extends object = Record<string, never>> {
  attributes?: TitanicEntityComponentAttributes<TProps>;
  diff?: readonly TitanicEntityComponentDiffItem[];
  methods?: TitanicEntityComponentDefinitionMethods<TProps>;
}

export type TitanicEntityComponentDefinition<TProps extends object = Record<string, never>> =
  | (TitanicEntityComponentDefinitionBase<TProps> & {
      component?: never;
      render?: never;
    })
  | (TitanicEntityComponentDefinitionBase<TProps> & {
      component: EntityReactComponentModule<TProps>;
      methods?: Record<string, unknown>;
      render?: never;
    })
  | (TitanicEntityComponentDefinitionBase<TProps> & {
      render: EntityReactComponentModule<TProps>;
      component?: never;
      methods?: Record<string, unknown>;
    });

export type TitanicEntityReactModuleDefinition<
  TEntity extends object,
  TDiff extends BaseSectionDiffItem[] = BaseSectionDiffItem[]
> =
  | TitanicEntityPageDefinition<TEntity>
  | TitanicEntitySectionDefinition<TEntity, TDiff>
  | TitanicEntityComponentDefinition
  | EntityReactComponentModule;

export type TitanicEntityPagePatch<TEntity extends object> =
  EntityPageTemplate<TEntity>;

export type TitanicEntitySectionPatch<
  TEntity extends object,
  TDiff extends BaseSectionDiffItem[] = BaseSectionDiffItem[]
> = EntitySectionTemplate<TEntity, TDiff>;

export type TitanicEntityReactModulePatch<
  TEntity extends object,
  TDiff extends BaseSectionDiffItem[] = BaseSectionDiffItem[]
> =
  | TitanicEntityPagePatch<TEntity>
  | TitanicEntitySectionPatch<TEntity, TDiff>
  | TitanicEntityComponentDefinition
  | EntityReactComponentModule;

export interface TitanicEntityReactModuleApi {
  define<TProps extends object = Record<string, never>>(
    className: string,
    definition: EntityReactComponentModule<TProps>
  ): DefinedEntityReactComponent<TProps>;
  define<TProps extends object = Record<string, never>>(
    className: string,
    definition: TitanicEntityComponentDefinition<TProps>
  ): DefinedEntityReactComponent<TProps>;
  define<TEntity extends object>(
    className: string,
    definition: TitanicEntityPageDefinition<TEntity>
  ): DefinedEntityPageTemplate;
  define<TEntity extends object, TDiff extends BaseSectionDiffItem[] = BaseSectionDiffItem[]>(
    className: string,
    definition: TitanicEntitySectionDefinition<TEntity, TDiff>
  ): DefinedEntitySectionTemplate<TDiff>;

  extend<TProps extends object = Record<string, never>>(
    className: string,
    patch: EntityReactComponentModule<TProps>
  ): DefinedEntityReactComponent<TProps>;
  extend<TProps extends object = Record<string, never>>(
    className: string,
    patch: TitanicEntityComponentDefinition<TProps>
  ): DefinedEntityReactComponent<TProps>;
  extend<TEntity extends object>(
    className: string,
    patch: TitanicEntityPagePatch<TEntity>
  ): DefinedEntityPageTemplate;
  extend<TEntity extends object, TDiff extends BaseSectionDiffItem[] = BaseSectionDiffItem[]>(
    className: string,
    patch: TitanicEntitySectionPatch<TEntity, TDiff>
  ): DefinedEntitySectionTemplate<TDiff>;

  override<TProps extends object = Record<string, never>>(
    className: string,
    patch: EntityReactComponentModule<TProps>
  ): DefinedEntityReactComponent<TProps>;
  override<TProps extends object = Record<string, never>>(
    className: string,
    patch: TitanicEntityComponentDefinition<TProps>
  ): DefinedEntityReactComponent<TProps>;
  override<TEntity extends object>(
    className: string,
    patch: TitanicEntityPagePatch<TEntity>
  ): DefinedEntityPageTemplate;
  override<TEntity extends object, TDiff extends BaseSectionDiffItem[] = BaseSectionDiffItem[]>(
    className: string,
    patch: TitanicEntitySectionPatch<TEntity, TDiff>
  ): DefinedEntitySectionTemplate<TDiff>;

  getReactModule<TModule extends DefinedEntityReactModule = DefinedEntityReactModule>(
    className: string
  ): TModule | undefined;
  hasReactModule(className: string): boolean;
}

const entityReactModuleRegistry = new Map<string, DefinedEntityReactModule>();

export function defineEntityPage<TEntity extends object>(
  template: EntityPageTemplate<TEntity>
): EntityEditPageTemplate;
export function defineEntityPage<TEntity extends object>(
  className: string,
  template: EntityPageTemplate<TEntity>
): DefinedEntityPageTemplate;
export function defineEntityPage<TEntity extends object>(
  classNameOrTemplate: string | EntityPageTemplate<TEntity>,
  template?: EntityPageTemplate<TEntity>
): EntityEditPageTemplate | DefinedEntityPageTemplate {
  const className = typeof classNameOrTemplate === "string" ? classNameOrTemplate : undefined;
  const sourceTemplate = typeof classNameOrTemplate === "string" ? template : classNameOrTemplate;

  if (!sourceTemplate) {
    throw new TypeError("Entity page template is required.");
  }

  const normalizedTemplate = normalizeEntityPageTemplate(sourceTemplate);

  return className ? defineEntityReactModule(normalizedTemplate, className, "page") : normalizedTemplate;
}

export function defineEntitySection<
  TEntity extends object,
  TDiff extends BaseSectionDiffItem[] = BaseSectionDiffItem[]
>(
  template: EntitySectionTemplate<TEntity, TDiff>
): BaseSectionTemplate<TDiff>;
export function defineEntitySection<
  TEntity extends object,
  TDiff extends BaseSectionDiffItem[] = BaseSectionDiffItem[]
>(
  className: string,
  template: EntitySectionTemplate<TEntity, TDiff>
): DefinedEntitySectionTemplate<TDiff>;
export function defineEntitySection<
  TEntity extends object,
  TDiff extends BaseSectionDiffItem[] = BaseSectionDiffItem[]
>(
  classNameOrTemplate: string | EntitySectionTemplate<TEntity, TDiff>,
  template?: EntitySectionTemplate<TEntity, TDiff>
): BaseSectionTemplate<TDiff> | DefinedEntitySectionTemplate<TDiff> {
  const className = typeof classNameOrTemplate === "string" ? classNameOrTemplate : undefined;
  const sourceTemplate = typeof classNameOrTemplate === "string" ? template : classNameOrTemplate;

  if (!sourceTemplate) {
    throw new TypeError("Entity section template is required.");
  }

  const normalizedTemplate = normalizeEntitySectionTemplate(sourceTemplate);

  return className ? defineEntityReactModule(normalizedTemplate, className, "section") : normalizedTemplate;
}

export const BaseEntityPageTemplate: EntityPageTemplateFactory = {
  template: baseEntityPageTemplate,

  extend<TEntity extends object>(template: EntityPageTemplate<TEntity>): EntityEditPageTemplate {
    return defineEntityPage({
      ...template,
      base: undefined,
      extend: template.extend ?? template.extends ?? template.base ?? baseEntityPageTemplate,
      extends: undefined
    });
  },

  define<TEntity extends object>(className: string, template: EntityPageTemplate<TEntity>): DefinedEntityPageTemplate {
    return defineEntityPage(className, {
      ...template,
      base: undefined,
      extend: template.extend ?? template.extends ?? template.base ?? baseEntityPageTemplate,
      extends: undefined
    });
  }
};

export const BaseEntitySectionTemplate: EntitySectionTemplateFactory = {
  template: baseSectionTemplate,

  extend<TEntity extends object, TDiff extends BaseSectionDiffItem[] = BaseSectionDiffItem[]>(
    template: EntitySectionTemplate<TEntity, TDiff>
  ): BaseSectionTemplate<TDiff> {
    return defineEntitySection({
      ...template,
      base: undefined,
      extend:
        template.extend ??
        template.extends ??
        template.base ??
        (baseSectionTemplate as unknown as BaseSectionTemplate<TDiff>),
      extends: undefined
    });
  },

  define<TEntity extends object, TDiff extends BaseSectionDiffItem[] = BaseSectionDiffItem[]>(
    className: string,
    template: EntitySectionTemplate<TEntity, TDiff>
  ): DefinedEntitySectionTemplate<TDiff> {
    return defineEntitySection(className, {
      ...template,
      base: undefined,
      extend:
        template.extend ??
        template.extends ??
        template.base ??
        (baseSectionTemplate as unknown as BaseSectionTemplate<TDiff>),
      extends: undefined
    });
  }
};

function defineEntityReactComponentModule<TProps extends object>(
  className: string,
  definition: EntityReactComponentModule<TProps> | TitanicEntityComponentDefinition<TProps>
): DefinedEntityReactComponent<TProps> {
  const component =
    typeof definition === "function"
      ? definition
      : getTitanicEntityComponentRender<TProps>(definition) ??
        createDiffEntityReactComponent<TProps>(className, definition);

  const definedComponent = defineEntityReactModule(component, className, "component") as DefinedEntityReactComponent<TProps>;

  if (typeof definition !== "function") {
    Object.defineProperty(definedComponent, "$definition", {
      value: definition,
      enumerable: false,
      configurable: true
    });
  }

  return definedComponent;
}

function defineTitanicEntityReactModule<TProps extends object = Record<string, never>>(
  className: string,
  definition: EntityReactComponentModule<TProps>
): DefinedEntityReactComponent<TProps>;
function defineTitanicEntityReactModule<TProps extends object = Record<string, never>>(
  className: string,
  definition: TitanicEntityComponentDefinition<TProps>
): DefinedEntityReactComponent<TProps>;
function defineTitanicEntityReactModule<TEntity extends object>(
  className: string,
  definition: TitanicEntityPageDefinition<TEntity>
): DefinedEntityPageTemplate;
function defineTitanicEntityReactModule<
  TEntity extends object,
  TDiff extends BaseSectionDiffItem[] = BaseSectionDiffItem[]
>(
  className: string,
  definition: TitanicEntitySectionDefinition<TEntity, TDiff>
): DefinedEntitySectionTemplate<TDiff>;
function defineTitanicEntityReactModule<
  TEntity extends object,
  TDiff extends BaseSectionDiffItem[] = BaseSectionDiffItem[]
>(
  className: string,
  definition: TitanicEntityReactModuleDefinition<TEntity, TDiff>
): DefinedEntityReactModule<TDiff> {
  if (typeof definition === "function" || isTitanicEntityComponentDefinition(definition)) {
    return defineEntityReactComponentModule(className, definition);
  }

  const moduleType = resolveEntityReactModuleDefinitionType(className, definition);
  const template = omitEntityReactModuleType(definition);

  if (moduleType === "page") {
    return defineEntityPage(className, template as EntityPageTemplate<TEntity>);
  }

  return defineEntitySection(className, template as EntitySectionTemplate<TEntity, TDiff>);
}

function extendTitanicEntityReactModule<TProps extends object = Record<string, never>>(
  className: string,
  patch: EntityReactComponentModule<TProps>
): DefinedEntityReactComponent<TProps>;
function extendTitanicEntityReactModule<TProps extends object = Record<string, never>>(
  className: string,
  patch: TitanicEntityComponentDefinition<TProps>
): DefinedEntityReactComponent<TProps>;
function extendTitanicEntityReactModule<TEntity extends object>(
  className: string,
  patch: TitanicEntityPagePatch<TEntity>
): DefinedEntityPageTemplate;
function extendTitanicEntityReactModule<
  TEntity extends object,
  TDiff extends BaseSectionDiffItem[] = BaseSectionDiffItem[]
>(
  className: string,
  patch: TitanicEntitySectionPatch<TEntity, TDiff>
): DefinedEntitySectionTemplate<TDiff>;
function extendTitanicEntityReactModule<
  TEntity extends object,
  TDiff extends BaseSectionDiffItem[] = BaseSectionDiffItem[]
>(
  className: string,
  patch: TitanicEntityReactModulePatch<TEntity, TDiff>
): DefinedEntityReactModule<TDiff> {
  return patchTitanicEntityReactModule(className, patch);
}

function overrideTitanicEntityReactModule<TProps extends object = Record<string, never>>(
  className: string,
  patch: EntityReactComponentModule<TProps>
): DefinedEntityReactComponent<TProps>;
function overrideTitanicEntityReactModule<TProps extends object = Record<string, never>>(
  className: string,
  patch: TitanicEntityComponentDefinition<TProps>
): DefinedEntityReactComponent<TProps>;
function overrideTitanicEntityReactModule<TEntity extends object>(
  className: string,
  patch: TitanicEntityPagePatch<TEntity>
): DefinedEntityPageTemplate;
function overrideTitanicEntityReactModule<
  TEntity extends object,
  TDiff extends BaseSectionDiffItem[] = BaseSectionDiffItem[]
>(
  className: string,
  patch: TitanicEntitySectionPatch<TEntity, TDiff>
): DefinedEntitySectionTemplate<TDiff>;
function overrideTitanicEntityReactModule<
  TEntity extends object,
  TDiff extends BaseSectionDiffItem[] = BaseSectionDiffItem[]
>(
  className: string,
  patch: TitanicEntityReactModulePatch<TEntity, TDiff>
): DefinedEntityReactModule<TDiff> {
  return patchTitanicEntityReactModule(className, patch);
}

const titanicEntityReactModuleApi: TitanicEntityReactModuleApi = {
  define: defineTitanicEntityReactModule,
  extend: extendTitanicEntityReactModule,
  override: overrideTitanicEntityReactModule,
  getReactModule<TModule extends DefinedEntityReactModule = DefinedEntityReactModule>(
    className: string
  ): TModule | undefined {
    return entityReactModuleRegistry.get(className) as TModule | undefined;
  },
  hasReactModule(className: string): boolean {
    return entityReactModuleRegistry.has(className);
  }
};

export const Titanic = Object.assign(CoreTitanic, titanicEntityReactModuleApi) as typeof CoreTitanic &
  TitanicEntityReactModuleApi;

declare global {
  var Titanic: typeof CoreTitanic & TitanicEntityReactModuleApi;
}

Object.defineProperty(globalThis, "Titanic", {
  value: Titanic,
  enumerable: false,
  configurable: true,
  writable: false
});

function normalizeEntityPageTemplate<TEntity extends object>(
  template: EntityPageTemplateLike<TEntity>
): EntityEditPageTemplate {
  if (isEntityPageTemplateFactory(template)) {
    return template.template;
  }

  if (!hasEntityPageDslExtends(template)) {
    return template as EntityEditPageTemplate;
  }

  const { extend, extends: parentTemplate, base, ...rest } = template;
  const nextBase = extend ?? parentTemplate ?? base;

  return {
    ...(rest as EntityEditPageTemplate),
    ...(nextBase ? { base: normalizeEntityPageTemplate(nextBase) } : {})
  };
}

function normalizeEntitySectionTemplate<
  TEntity extends object,
  TDiff extends BaseSectionDiffItem[]
>(
  template: EntitySectionTemplateLike<TEntity, TDiff>
): BaseSectionTemplate<TDiff> {
  if (isEntitySectionTemplateFactory(template)) {
    return template.template as BaseSectionTemplate<TDiff>;
  }

  if (!hasEntitySectionDslExtends(template)) {
    return template as BaseSectionTemplate<TDiff>;
  }

  const { extend, extends: parentTemplate, base, ...rest } = template;
  const nextBase = extend ?? parentTemplate ?? base;

  return {
    ...(rest as BaseSectionTemplate<TDiff>),
    ...(nextBase ? { base: normalizeEntitySectionTemplate(nextBase) } : {})
  };
}

function hasEntityPageDslExtends<TEntity extends object>(
  template: EntityPageTemplateLike<TEntity>
): template is EntityPageTemplate<TEntity> {
  return "extend" in template || "extends" in template || "base" in template;
}

function hasEntitySectionDslExtends<
  TEntity extends object,
  TDiff extends BaseSectionDiffItem[]
>(
  template: EntitySectionTemplateLike<TEntity, TDiff>
): template is EntitySectionTemplate<TEntity, TDiff> {
  return "extend" in template || "extends" in template || "base" in template;
}

function isEntityPageTemplateFactory<TEntity extends object>(
  template: EntityPageTemplateLike<TEntity>
): template is EntityPageTemplateFactory {
  return isTemplateFactory(template);
}

function isEntitySectionTemplateFactory<
  TEntity extends object,
  TDiff extends BaseSectionDiffItem[]
>(
  template: EntitySectionTemplateLike<TEntity, TDiff>
): template is EntitySectionTemplateFactory {
  return isTemplateFactory(template);
}

function isTemplateFactory(
  value: unknown
): value is {
  readonly template: object;
  readonly extend: (...args: unknown[]) => unknown;
  readonly define: (...args: unknown[]) => unknown;
} {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as {
    template?: unknown;
    extend?: unknown;
    define?: unknown;
  };

  return (
    Boolean(candidate.template) &&
    typeof candidate.template === "object" &&
    typeof candidate.extend === "function" &&
    typeof candidate.define === "function"
  );
}

const entityPageDefinitionKeys = new Set([
  "columns",
  "diffOverrides",
  "displayColumn",
  "entity",
  "entitySchemaName",
  "localization",
  "mixins",
  "primaryColumn",
  "schema",
  "submitLabel",
  "tableName",
  "title"
]);

const entityPageDiffItemTypes = new Set([
  "actions",
  "custom",
  "field",
  "row",
  "section",
  "text"
]);

const entityPageDiffItemKeys = new Set([
  "actions",
  "attribute",
  "attributes",
  "render",
  "text"
]);

function resolveEntityReactModuleDefinitionType(
  className: string,
  definition: object
): EntityReactTemplateModuleType {
  const moduleType = inferEntityReactModuleType(definition);

  if (moduleType === "component") {
    throw new Error(
      `Titanic React module "${className}" is marked as a component. Pass a React function directly to Titanic.define.`
    );
  }

  if (moduleType) {
    return moduleType;
  }

  throw new Error(
    `Cannot infer Titanic React module "${className}" type. Extend BaseEntityPageTemplate or BaseEntitySectionTemplate, or use page attributes/entity schema fields.`
  );
}

function inferEntityReactModuleType(value: unknown): EntityReactModuleType | undefined {
  if (isEntityReactModuleMetadata(value)) {
    return value.$moduleType;
  }

  if (value === BaseEntityPageTemplate || value === baseEntityPageTemplate) {
    return "page";
  }

  if (value === BaseEntitySectionTemplate || value === baseSectionTemplate) {
    return "section";
  }

  if (typeof value === "function") {
    return "component";
  }

  if (!isRecord(value)) {
    return undefined;
  }

  const explicitType = getEntityReactModuleType(value);
  if (explicitType) {
    return explicitType;
  }

  const parentType = inferEntityReactModuleType(value.extend ?? value.extends ?? value.base);
  if (parentType) {
    return parentType;
  }

  return inferEntityReactModuleShapeType(value);
}

function inferEntityReactModuleShapeType(value: Record<string, unknown>): EntityReactModuleType | undefined {
  if (hasAnyOwnProperty(value, entityPageDefinitionKeys)) {
    return "page";
  }

  const diffType = inferEntityReactModuleDiffType(value.diff);
  if (diffType) {
    return diffType;
  }

  if (Object.prototype.hasOwnProperty.call(value, "name")) {
    return "section";
  }

  if (isTitanicEntityComponentDefinition(value)) {
    return "component";
  }

  return undefined;
}

function inferEntityReactModuleDiffType(diff: unknown): EntityReactTemplateModuleType | undefined {
  if (!Array.isArray(diff)) {
    return undefined;
  }

  return diff.some(hasEntityPageDiffItemShape) ? "page" : undefined;
}

function hasEntityPageDiffItemShape(item: unknown): boolean {
  if (!isRecord(item)) {
    return false;
  }

  if (typeof item.type === "string" && entityPageDiffItemTypes.has(item.type)) {
    return true;
  }

  if (hasAnyOwnProperty(item, entityPageDiffItemKeys)) {
    return true;
  }

  return Array.isArray(item.items) && item.items.some(hasEntityPageDiffItemShape);
}

function isTitanicEntityComponentDefinition<TProps extends object = Record<string, never>>(
  value: unknown
): value is TitanicEntityComponentDefinition<TProps> {
  if (!isRecord(value)) {
    return false;
  }

  if (Boolean(getTitanicEntityComponentRender<TProps>(value))) {
    return true;
  }

  if (
    Object.prototype.hasOwnProperty.call(value, "extend") ||
    Object.prototype.hasOwnProperty.call(value, "extends") ||
    Object.prototype.hasOwnProperty.call(value, "base") ||
    hasAnyOwnProperty(value, entityPageDefinitionKeys) ||
    Boolean(inferEntityReactModuleDiffType(value.diff)) ||
    Object.prototype.hasOwnProperty.call(value, "name")
  ) {
    return false;
  }

  return (
    Object.prototype.hasOwnProperty.call(value, "attributes") ||
    Object.prototype.hasOwnProperty.call(value, "methods") ||
    Object.prototype.hasOwnProperty.call(value, "diff")
  );
}

function getTitanicEntityComponentRender<TProps extends object = Record<string, never>>(
  value: unknown
): EntityReactComponentModule<TProps> | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  if (typeof value.render === "function") {
    return value.render as EntityReactComponentModule<TProps>;
  }

  if (typeof value.component === "function") {
    return value.component as EntityReactComponentModule<TProps>;
  }

  if (Array.isArray(value.diff) && value.diff.length > 0) {
    return undefined;
  }

  const methods = value.methods;
  if (isRecord(methods) && typeof methods.render === "function") {
    return methods.render as EntityReactComponentModule<TProps>;
  }

  return undefined;
}

function createDiffEntityReactComponent<TProps extends object = Record<string, never>>(
  className: string,
  definition: TitanicEntityComponentDefinition<TProps>
): EntityReactComponentModule<TProps> {
  const DefinedTitanicEntityReactComponent = React.forwardRef<unknown, TProps>(
    function DefinedTitanicEntityReactComponent(
      props: React.PropsWithoutRef<TProps>,
      ref
    ): ReactNode {
      const propsWithRef =
        ref == null
          ? props
          : ({ ...props, ref } as React.PropsWithoutRef<TProps> & { ref?: React.Ref<unknown> });
      const scope = useTitanicEntityComponentScope(className, definition, propsWithRef as TProps);

      React.useImperativeHandle(
        ref,
        () => {
          const methodDefinitions =
            (scope as unknown as { readonly $methodDefinitions?: Record<string, unknown> }).$methodDefinitions ?? {};
          const handleFactory =
            typeof methodDefinitions.getHandle === "function"
              ? methodDefinitions.getHandle
              : typeof methodDefinitions.createHandle === "function"
                ? methodDefinitions.createHandle
                : undefined;
          const handle = handleFactory ? callTitanicEntityComponentFunction(scope, handleFactory) : scope;

          return handle ?? scope;
        },
        [scope]
      );

      return scope.renderDiff(definition.diff ?? []);
    }
  );

  DefinedTitanicEntityReactComponent.displayName = className;

  return DefinedTitanicEntityReactComponent as unknown as EntityReactComponentModule<TProps>;
}

function useTitanicEntityComponentScope<TProps extends object = Record<string, never>>(
  className: string,
  definition: TitanicEntityComponentDefinition<TProps>,
  props: TProps
): TitanicEntityComponentScope<TProps> {
  const methodDefinitions = isRecord(definition.methods) ? definition.methods : {};
  const scope = createTitanicEntityComponentScope(className, props, methodDefinitions);
  const attributes = isRecord(definition.attributes) ? definition.attributes : {};

  for (const [attributeName, attributeDefinition] of Object.entries(attributes)) {
    applyTitanicEntityComponentAttribute(scope, attributeName, attributeDefinition);
  }

  for (const [attributeName, attributeDefinition] of Object.entries(attributes)) {
    applyTitanicEntityComponentEffect(scope, attributeName, attributeDefinition);
  }

  return scope;
}

function createTitanicEntityComponentScope<TProps extends object>(
  className: string,
  props: TProps,
  methodDefinitions: Record<string, unknown>,
  locals: Record<string, unknown> = {}
): TitanicEntityComponentScope<TProps> & {
  readonly $methodDefinitions: Record<string, unknown>;
} {
  const scope = {
    className,
    props,
    attributes: {},
    state: {},
    refs: {},
    locals,
    methods: {},
    $methodDefinitions: methodDefinitions,
    get(path: string): unknown {
      return getTitanicEntityComponentPathValue(this, path);
    },
    renderDiff(diff: readonly TitanicEntityComponentDiffItem[] = [], nextLocals: Record<string, unknown> = {}): ReactNode {
      const renderScope =
        Object.keys(nextLocals).length > 0 ? createTitanicEntityComponentChildScope(this, nextLocals) : this;

      return renderTitanicEntityComponentDiff(diff, renderScope);
    }
  } as TitanicEntityComponentScope<TProps> & {
    readonly $methodDefinitions: Record<string, unknown>;
  };

  for (const methodName of Object.keys(methodDefinitions)) {
    scope.methods[methodName] = (...args: unknown[]) => callTitanicEntityComponentMethod(scope, methodName, args);
  }

  return scope;
}

function createTitanicEntityComponentChildScope<TProps extends object>(
  scope: TitanicEntityComponentScope<TProps> & { readonly $methodDefinitions?: Record<string, unknown> },
  locals: Record<string, unknown>
): TitanicEntityComponentScope<TProps> & { readonly $methodDefinitions?: Record<string, unknown> } {
  const methodDefinitions = scope.$methodDefinitions ?? {};
  const childScope = {
    ...scope,
    locals: {
      ...scope.locals,
      ...locals
    },
    methods: {},
    $methodDefinitions: methodDefinitions
  } as TitanicEntityComponentScope<TProps> & { readonly $methodDefinitions?: Record<string, unknown> };

  for (const methodName of Object.keys(methodDefinitions)) {
    childScope.methods[methodName] = (...args: unknown[]) =>
      callTitanicEntityComponentMethod(childScope, methodName, args);
  }

  return childScope;
}

function applyTitanicEntityComponentAttribute<TProps extends object>(
  scope: TitanicEntityComponentScope<TProps>,
  attributeName: string,
  attributeDefinition: unknown
): void {
  const descriptor = isTitanicEntityComponentAttributeDefinition(attributeDefinition)
    ? attributeDefinition
    : undefined;
  const propValue = readRecordValue(scope.props, attributeName);

  if (!descriptor && isTitanicEntityComponentPlainAttribute(attributeDefinition)) {
    assignTitanicEntityComponentAttribute(scope, attributeName, propValue);
    return;
  }

  if (descriptor?.state) {
    const [stateValue, setStateValue] = React.useState(() =>
      resolveTitanicEntityComponentValue(
        Object.prototype.hasOwnProperty.call(descriptor, "default") ? descriptor.default : propValue,
        scope
      )
    );
    const value = propValue ?? stateValue;

    assignTitanicEntityComponentAttribute(scope, attributeName, value);
    scope.state[attributeName] = value;
    assignTitanicEntityComponentAttribute(scope, getSetterName(attributeName), setStateValue);
    return;
  }

  if (descriptor?.ref) {
    const ref = React.useRef(
      resolveTitanicEntityComponentValue(
        Object.prototype.hasOwnProperty.call(descriptor, "default") ? descriptor.default : null,
        scope
      )
    );

    scope.refs[attributeName] = ref as React.RefObject<unknown>;
    assignTitanicEntityComponentAttribute(scope, attributeName, ref);
    return;
  }

  if (descriptor?.id) {
    const id = React.useId();
    assignTitanicEntityComponentAttribute(scope, attributeName, propValue ?? id);
    return;
  }

  if (descriptor?.memo) {
    const value = React.useMemo(
      () => callTitanicEntityComponentFunction(scope, descriptor.memo),
      resolveTitanicEntityComponentDeps(descriptor.deps, scope) ?? []
    );

    assignTitanicEntityComponentAttribute(scope, attributeName, propValue ?? value);
    return;
  }

  if (descriptor?.value) {
    assignTitanicEntityComponentAttribute(
      scope,
      attributeName,
      propValue ?? callTitanicEntityComponentFunction(scope, descriptor.value)
    );
    return;
  }

  assignTitanicEntityComponentAttribute(
    scope,
    attributeName,
    propValue ??
      (descriptor && Object.prototype.hasOwnProperty.call(descriptor, "default")
        ? resolveTitanicEntityComponentValue(descriptor.default, scope)
        : attributeDefinition)
  );
}

function applyTitanicEntityComponentEffect<TProps extends object>(
  scope: TitanicEntityComponentScope<TProps>,
  _attributeName: string,
  attributeDefinition: unknown
): void {
  if (!isTitanicEntityComponentAttributeDefinition(attributeDefinition) || !attributeDefinition.effect) {
    return;
  }

  React.useEffect(
    () => callTitanicEntityComponentFunction(scope, attributeDefinition.effect) as void | (() => void),
    resolveTitanicEntityComponentDeps(attributeDefinition.deps, scope)
  );
}

function assignTitanicEntityComponentAttribute<TProps extends object>(
  scope: TitanicEntityComponentScope<TProps>,
  attributeName: string,
  value: unknown
): void {
  scope.attributes[attributeName] = value;
  (scope as unknown as Record<string, unknown>)[attributeName] = value;
}

function renderTitanicEntityComponentDiff<TProps extends object>(
  diff: readonly TitanicEntityComponentDiffItem[],
  scope: TitanicEntityComponentScope<TProps>
): ReactNode {
  return React.createElement(
    React.Fragment,
    null,
    ...diff.map((item, index) =>
      ensureTitanicEntityComponentKey(
        renderTitanicEntityComponentDiffItem(item, scope, index),
        getTitanicEntityDiffItemKey(item, index)
      )
    )
  );
}

function renderTitanicEntityComponentDiffItem<TProps extends object>(
  item: TitanicEntityComponentDiffItem,
  scope: TitanicEntityComponentScope<TProps>,
  index: number
): ReactNode {
  if (item === null || item === undefined || typeof item === "boolean") {
    return null;
  }

  if (typeof item === "string" || typeof item === "number" || React.isValidElement(item)) {
    return item;
  }

  if (Array.isArray(item)) {
    return React.createElement(
      React.Fragment,
      null,
      ...item.map((child, childIndex) =>
        ensureTitanicEntityComponentKey(
          renderTitanicEntityComponentDiffItem(child, scope, childIndex),
          getTitanicEntityDiffItemKey(child, childIndex)
        )
      )
    );
  }

  if (!isRecord(item)) {
    return String(item);
  }

  if (Object.prototype.hasOwnProperty.call(item, "when") && !resolveTitanicEntityComponentValue(item.when, scope)) {
    return null;
  }

  if (Object.prototype.hasOwnProperty.call(item, "unless") && resolveTitanicEntityComponentValue(item.unless, scope)) {
    return null;
  }

  if (Object.prototype.hasOwnProperty.call(item, "each")) {
    return renderTitanicEntityComponentDiffCollection(item, scope, index);
  }

  if (typeof item.slot === "string") {
    return readRecordValue(scope.props, item.slot) as ReactNode;
  }

  if (typeof item.call === "string") {
    return callTitanicEntityComponentMethod(
      scope,
      item.call,
      Array.isArray(item.args) ? item.args.map((arg) => resolveTitanicEntityComponentValue(arg, scope)) : []
    ) as ReactNode;
  }

  if (Object.prototype.hasOwnProperty.call(item, "text")) {
    return resolveTitanicEntityComponentValue(item.text, scope) as ReactNode;
  }

  const component = resolveTitanicEntityComponentElementType(item, scope);
  if (!component) {
    return null;
  }

  const props = resolveTitanicEntityComponentProps(item.props, scope);
  const key = Object.prototype.hasOwnProperty.call(item, "key")
    ? resolveTitanicEntityComponentValue(item.key, scope)
    : undefined;

  if (key !== undefined) {
    props.key = key;
  }

  const children = resolveTitanicEntityComponentChildren(item, scope);

  return React.createElement(component, props, ...children);
}

function renderTitanicEntityComponentDiffCollection<TProps extends object>(
  item: Record<string, unknown>,
  scope: TitanicEntityComponentScope<TProps>,
  index: number
): ReactNode {
  const collection = resolveTitanicEntityComponentValue(item.each, scope);
  const values = Array.isArray(collection) ? collection : [];
  const itemName = typeof item.as === "string" ? item.as : "item";
  const indexName = typeof item.indexAs === "string" ? item.indexAs : "index";
  const template = Array.isArray(item.diff)
    ? item.diff
    : Array.isArray(item.children)
      ? item.children
      : Object.prototype.hasOwnProperty.call(item, "children")
        ? [item.children as TitanicEntityComponentDiffItem]
        : [];

  return React.createElement(
    React.Fragment,
    null,
    ...values.map((value, itemIndex) =>
      React.createElement(
        React.Fragment,
        { key: getTitanicEntityCollectionItemKey(value, itemIndex) },
        renderTitanicEntityComponentDiff(
          template as readonly TitanicEntityComponentDiffItem[],
          createTitanicEntityComponentChildScope(scope, {
            [itemName]: value,
            [indexName]: itemIndex,
            $parentIndex: index
          })
        )
      )
    )
  );
}

function getTitanicEntityCollectionItemKey(value: unknown, index: number): React.Key {
  if (isRecord(value)) {
    const key =
      readRecordValue(value, "key") ??
      readRecordValue(value, "id") ??
      readRecordValue(value, "Id") ??
      readRecordValue(value, "name") ??
      readRecordValue(value, "Name");

    if (typeof key === "string" || typeof key === "number") {
      return key;
    }
  }

  return index;
}

function getTitanicEntityDiffItemKey(item: TitanicEntityComponentDiffItem, index: number): React.Key {
  if (React.isValidElement(item) && item.key !== null) {
    return item.key;
  }

  if (isRecord(item)) {
    const key = readRecordValue(item, "key");

    if (typeof key === "string" || typeof key === "number") {
      return key;
    }

    const name =
      readRecordValue(item, "component") ??
      readRecordValue(item, "tag") ??
      readRecordValue(item, "call") ??
      readRecordValue(item, "slot");

    if (typeof name === "string" || typeof name === "number") {
      return `${name}-${index}`;
    }
  }

  return index;
}

function ensureTitanicEntityComponentKey(node: ReactNode, key: React.Key): ReactNode {
  if (node === null || node === undefined || typeof node === "boolean") {
    return node;
  }

  if (React.isValidElement(node)) {
    return node.key === null ? React.cloneElement(node, { key } as React.Attributes) : node;
  }

  if (Array.isArray(node)) {
    return React.createElement(React.Fragment, { key }, ...node);
  }

  return React.createElement(React.Fragment, { key }, node);
}

function resolveTitanicEntityComponentElementType<TProps extends object>(
  item: Record<string, unknown>,
  scope: TitanicEntityComponentScope<TProps>
): React.ElementType | undefined {
  const componentValue = Object.prototype.hasOwnProperty.call(item, "component") ? item.component : item.tag;
  const resolvedComponent = resolveTitanicEntityComponentValue(componentValue, scope);

  if (typeof resolvedComponent === "function") {
    return resolvedComponent as React.ElementType;
  }

  if (typeof resolvedComponent !== "string" || resolvedComponent.length === 0) {
    return undefined;
  }

  if (resolvedComponent.includes(".")) {
    return Titanic.getReactModule(resolvedComponent) as React.ElementType | undefined;
  }

  return resolvedComponent as React.ElementType;
}

function resolveTitanicEntityComponentProps<TProps extends object>(
  props: unknown,
  scope: TitanicEntityComponentScope<TProps>
): Record<string, unknown> {
  if (!isRecord(props)) {
    return {};
  }

  const resolvedProps: Record<string, unknown> = {};

  for (const [propName, propValue] of Object.entries(props)) {
    const resolvedValue = resolveTitanicEntityComponentValue(propValue, scope);

    if (propName === "$spread") {
      if (isRecord(resolvedValue)) {
        Object.assign(resolvedProps, resolvedValue);
      }

      continue;
    }

    if (resolvedValue !== undefined) {
      resolvedProps[propName] = resolvedValue;
    }
  }

  return resolvedProps;
}

function resolveTitanicEntityComponentChildren<TProps extends object>(
  item: Record<string, unknown>,
  scope: TitanicEntityComponentScope<TProps>
): ReactNode[] {
  const children: ReactNode[] = [];

  if (Object.prototype.hasOwnProperty.call(item, "children")) {
    const childSource = item.children;
    const childItems = Array.isArray(childSource) ? childSource : [childSource];
    children.push(
      ...childItems.map((child, childIndex) =>
        ensureTitanicEntityComponentKey(
          renderTitanicEntityComponentDiffItem(child as TitanicEntityComponentDiffItem, scope, childIndex),
          getTitanicEntityDiffItemKey(child as TitanicEntityComponentDiffItem, childIndex)
        )
      )
    );
  }

  if (Array.isArray(item.diff)) {
    children.push(
      ...item.diff.map((child, childIndex) =>
        ensureTitanicEntityComponentKey(
          renderTitanicEntityComponentDiffItem(child as TitanicEntityComponentDiffItem, scope, childIndex),
          getTitanicEntityDiffItemKey(child as TitanicEntityComponentDiffItem, childIndex)
        )
      )
    );
  }

  if (Object.prototype.hasOwnProperty.call(item, "text")) {
    children.push(resolveTitanicEntityComponentValue(item.text, scope) as ReactNode);
  }

  return children;
}

function resolveTitanicEntityComponentValue<TProps extends object>(
  value: unknown,
  scope: TitanicEntityComponentScope<TProps>
): unknown {
  if (typeof value === "function") {
    return callTitanicEntityComponentFunction(scope, value);
  }

  if (!isRecord(value) || React.isValidElement(value)) {
    return value;
  }

  if (Object.prototype.hasOwnProperty.call(value, "literal")) {
    return value.literal;
  }

  if (Array.isArray(value.diff)) {
    return scope.renderDiff(value.diff);
  }

  if (Array.isArray(value.render)) {
    return scope.renderDiff(value.render);
  }

  if (typeof value.prop === "string") {
    return getTitanicEntityComponentPathValue(scope.props, value.prop);
  }

  if (typeof value.attr === "string") {
    return getTitanicEntityComponentPathValue(scope.attributes, value.attr);
  }

  if (typeof value.state === "string") {
    return getTitanicEntityComponentPathValue(scope.state, value.state);
  }

  if (typeof value.ref === "string") {
    return getTitanicEntityComponentPathValue(scope.refs, value.ref);
  }

  if (typeof value.local === "string") {
    return getTitanicEntityComponentPathValue(scope.locals, value.local);
  }

  if (typeof value.path === "string" || typeof value.get === "string") {
    return getTitanicEntityComponentPathValue(scope, (value.path ?? value.get) as string);
  }

  if (typeof value.method === "string") {
    return (...args: unknown[]) =>
      callTitanicEntityComponentMethod(scope, value.method as string, [
        ...args,
        ...(Array.isArray(value.args)
          ? value.args.map((arg) => resolveTitanicEntityComponentValue(arg, scope))
          : [])
      ]);
  }

  if (typeof value.call === "string") {
    return callTitanicEntityComponentMethod(
      scope,
      value.call,
      Array.isArray(value.args) ? value.args.map((arg) => resolveTitanicEntityComponentValue(arg, scope)) : []
    );
  }

  if (Object.prototype.hasOwnProperty.call(value, "not")) {
    return !resolveTitanicEntityComponentValue(value.not, scope);
  }

  if (Array.isArray(value.and)) {
    return value.and.every((part) => Boolean(resolveTitanicEntityComponentValue(part, scope)));
  }

  if (Array.isArray(value.or)) {
    return value.or.some((part) => Boolean(resolveTitanicEntityComponentValue(part, scope)));
  }

  if (Array.isArray(value.coalesce)) {
    for (const part of value.coalesce) {
      const resolvedValue = resolveTitanicEntityComponentValue(part, scope);

      if (resolvedValue !== null && resolvedValue !== undefined) {
        return resolvedValue;
      }
    }

    return undefined;
  }

  if (Array.isArray(value.eq) && value.eq.length === 2) {
    return (
      resolveTitanicEntityComponentValue(value.eq[0], scope) ===
      resolveTitanicEntityComponentValue(value.eq[1], scope)
    );
  }

  if (Array.isArray(value.neq) && value.neq.length === 2) {
    return (
      resolveTitanicEntityComponentValue(value.neq[0], scope) !==
      resolveTitanicEntityComponentValue(value.neq[1], scope)
    );
  }

  if (Array.isArray(value.array)) {
    return value.array.map((item) => resolveTitanicEntityComponentValue(item, scope));
  }

  if (isRecord(value.object)) {
    const resolvedObject: Record<string, unknown> = {};

    for (const [key, objectValue] of Object.entries(value.object)) {
      const resolvedValue = resolveTitanicEntityComponentValue(objectValue, scope);

      if (resolvedValue !== undefined) {
        resolvedObject[key] = resolvedValue;
      }
    }

    return resolvedObject;
  }

  return value;
}

function resolveTitanicEntityComponentDeps<TProps extends object>(
  deps: unknown,
  scope: TitanicEntityComponentScope<TProps>
): React.DependencyList | undefined {
  if (deps === undefined) {
    return undefined;
  }

  const resolvedDeps = resolveTitanicEntityComponentValue(deps, scope);

  return Array.isArray(resolvedDeps) ? resolvedDeps : [resolvedDeps];
}

function callTitanicEntityComponentMethod<TProps extends object>(
  scope: TitanicEntityComponentScope<TProps> & { readonly $methodDefinitions?: Record<string, unknown> },
  methodName: string,
  args: readonly unknown[] = []
): unknown {
  const methodDefinition = scope.$methodDefinitions?.[methodName];

  if (typeof methodDefinition === "function") {
    return callTitanicEntityComponentFunction(scope, methodDefinition, args);
  }

  const method = scope.methods[methodName];

  return typeof method === "function" ? method(...args) : undefined;
}

function callTitanicEntityComponentFunction<TProps extends object>(
  scope: TitanicEntityComponentScope<TProps>,
  method: unknown,
  args: readonly unknown[] = []
): unknown {
  return typeof method === "function" ? method.apply(scope, args) : undefined;
}

function getTitanicEntityComponentPathValue(source: unknown, path: string): unknown {
  if (!path) {
    return source;
  }

  const parts = path.split(".");
  let value = source;

  for (const part of parts) {
    if (!isRecord(value) && typeof value !== "function") {
      return undefined;
    }

    value = readRecordValue(value, part);
  }

  return value;
}

function readRecordValue(source: unknown, key: string): unknown {
  return isObjectLike(source) ? (source as Record<string, unknown>)[key] : undefined;
}

function isTitanicEntityComponentAttributeDefinition(
  value: unknown
): value is TitanicEntityComponentAttributeDefinition {
  if (!isRecord(value)) {
    return false;
  }

  return (
    Object.prototype.hasOwnProperty.call(value, "default") ||
    Object.prototype.hasOwnProperty.call(value, "deps") ||
    Object.prototype.hasOwnProperty.call(value, "effect") ||
    Object.prototype.hasOwnProperty.call(value, "id") ||
    Object.prototype.hasOwnProperty.call(value, "memo") ||
    Object.prototype.hasOwnProperty.call(value, "ref") ||
    Object.prototype.hasOwnProperty.call(value, "state") ||
    Object.prototype.hasOwnProperty.call(value, "value")
  );
}

function isTitanicEntityComponentPlainAttribute(value: unknown): boolean {
  return isRecord(value) && Object.keys(value).length === 0;
}

function getSetterName(attributeName: string): string {
  return `set${attributeName.charAt(0).toUpperCase()}${attributeName.slice(1)}`;
}

function createUndefinedEntityReactComponent<TProps extends object = Record<string, never>>(
  className: string
): EntityReactComponentModule<TProps> {
  return function UndefinedTitanicEntityReactComponent(): ReactNode {
    throw new Error(`Titanic React component "${className}" does not have a render implementation.`);
  };
}

function omitEntityReactModuleType<TTemplate extends object>(template: TTemplate): Omit<TTemplate, "type"> {
  const { type: _type, ...rest } = template as TTemplate & { type?: unknown };
  return rest as Omit<TTemplate, "type">;
}

function getEntityReactModuleType(value: unknown): EntityReactModuleType | undefined {
  if (!isObjectLike(value)) {
    return undefined;
  }

  const moduleType = (value as { type?: unknown }).type;
  return isEntityReactModuleType(moduleType) ? moduleType : undefined;
}

function isEntityReactModuleMetadata(value: unknown): value is EntityReactModuleMetadata {
  if (!isObjectLike(value)) {
    return false;
  }

  const candidate = value as Partial<EntityReactModuleMetadata>;

  return typeof candidate.$className === "string" && isEntityReactModuleType(candidate.$moduleType);
}

function isEntityReactModuleType(value: unknown): value is EntityReactModuleType {
  return value === "component" || value === "page" || value === "section";
}

function isObjectLike(value: unknown): value is object {
  return (typeof value === "object" && value !== null) || typeof value === "function";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasAnyOwnProperty(value: Record<string, unknown>, keys: ReadonlySet<string>): boolean {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      return true;
    }
  }

  return false;
}

function defineEntityReactModule<TTemplate extends object, TModuleType extends EntityReactModuleType>(
  template: TTemplate,
  className: string,
  moduleType: TModuleType
): TTemplate & EntityReactModuleMetadata<TModuleType> {
  Object.defineProperties(template, {
    $className: {
      value: className,
      enumerable: false,
      configurable: true
    },
    $moduleType: {
      value: moduleType,
      enumerable: false,
      configurable: true
    }
  });

  const definedTemplate = template as TTemplate & EntityReactModuleMetadata<TModuleType>;
  entityReactModuleRegistry.set(className, definedTemplate as unknown as DefinedEntityReactModule);

  return definedTemplate;
}

function patchTitanicEntityReactModule<
  TEntity extends object,
  TDiff extends BaseSectionDiffItem[] = BaseSectionDiffItem[]
>(
  className: string,
  patch: TitanicEntityReactModulePatch<TEntity, TDiff>
): DefinedEntityReactModule<TDiff> {
  const baseModule = getRequiredEntityReactModule(className);
  const moduleType = resolveEntityReactModulePatchType(baseModule, inferEntityReactModuleType(patch));

  if (typeof patch === "function" || isTitanicEntityComponentDefinition(patch)) {
    return defineEntityReactComponentModule(className, patch);
  }

  const templatePatch = omitEntityReactModuleType(patch);

  if (moduleType === "component") {
    throw new Error(
      `Titanic React component "${baseModule.$className}" cannot be extended with an entity template. Pass a React function instead.`
    );
  }

  if (moduleType === "page") {
    const pagePatch = templatePatch as TitanicEntityPagePatch<TEntity>;
    return defineEntityPage(className, {
      ...pagePatch,
      base: undefined,
      extend:
        pagePatch.extend ??
        pagePatch.extends ??
        pagePatch.base ??
        (baseModule as DefinedEntityPageTemplate),
      extends: undefined
    });
  }

  const sectionPatch = templatePatch as TitanicEntitySectionPatch<TEntity, TDiff>;
  return defineEntitySection(className, {
    ...sectionPatch,
    base: undefined,
    extend:
      sectionPatch.extend ??
      sectionPatch.extends ??
      sectionPatch.base ??
      (baseModule as DefinedEntitySectionTemplate<TDiff>),
    extends: undefined
  });
}

function getRequiredEntityReactModule(className: string): DefinedEntityReactModule {
  const module = entityReactModuleRegistry.get(className);

  if (!module) {
    throw new Error(`Titanic React module "${className}" is not defined.`);
  }

  return module;
}

function resolveEntityReactModulePatchType(
  baseModule: DefinedEntityReactModule,
  patchType?: EntityReactModuleType
): EntityReactModuleType {
  if (patchType && patchType !== baseModule.$moduleType) {
    throw new Error(
      `Titanic React module "${baseModule.$className}" has type "${baseModule.$moduleType}", not "${patchType}".`
    );
  }

  return baseModule.$moduleType;
}
