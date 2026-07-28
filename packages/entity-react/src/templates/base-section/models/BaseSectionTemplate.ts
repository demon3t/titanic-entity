import type {
  BaseModuleMethod,
  BaseModuleMethodArguments,
  BaseModuleMethodChains,
  BaseModuleMethodThis,
  BaseModuleMethods,
  BaseModuleTemplate,
  NormalizedBaseModuleTemplate
} from "../../base-module";

export type BaseSectionRenderValue<TValue> = TValue | ((context: BaseSectionContext) => TValue);
export type BaseSectionPredicate = boolean | ((context: BaseSectionContext) => boolean);
export type BaseSectionMethod = BaseModuleMethod<BaseSectionContext, BaseSectionMethodThis>;
export type BaseSectionMethods = BaseModuleMethods<BaseSectionContext, BaseSectionMethodThis, BaseSectionMethod>;
export type BaseSectionMethodChains = BaseModuleMethodChains<
  BaseSectionContext,
  BaseSectionMethodThis,
  BaseSectionMethod
>;
export type BaseSectionMethodArguments = BaseModuleMethodArguments;

export interface BaseSectionContext {
  diff: BaseSectionDiffItem[];
  methods: BaseSectionMethods;
  runMethod: (name: string, ...args: unknown[]) => Promise<unknown>;
  template: NormalizedBaseSectionTemplate;
}

export interface BaseSectionMethodThis extends BaseModuleMethodThis, BaseSectionContext {
  context: BaseSectionContext;
}

export interface BaseSectionTemplate<TDiff = BaseSectionDiffItem[]>
  extends BaseModuleTemplate<BaseSectionContext, BaseSectionMethods, TDiff> {
  base?: BaseSectionTemplate<TDiff>;
  name?: string;
}

export interface NormalizedBaseSectionTemplate<TDiff = BaseSectionDiffItem[]>
  extends NormalizedBaseModuleTemplate<
    BaseSectionContext,
    BaseSectionMethods,
    BaseSectionMethodChains,
    TDiff
  > {
  name?: string;
}

export interface BaseSectionDiffItem {
  name?: string;
  type?: string;
  visible?: BaseSectionPredicate;
  [key: string]: unknown;
}
