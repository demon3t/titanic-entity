import { createBaseModuleMethods } from "../base-module";
import type {
  BaseSectionContext,
  BaseSectionDiffItem,
  BaseSectionMethod,
  BaseSectionMethodChains,
  BaseSectionMethods,
  BaseSectionTemplate,
  NormalizedBaseSectionTemplate
} from "./models/BaseSectionTemplate";

export function createBaseSectionMethods(): BaseSectionMethods {
  return createBaseModuleMethods<BaseSectionContext>() as BaseSectionMethods;
}

export function createBaseSectionTemplate(
  template: BaseSectionTemplate = {}
): NormalizedBaseSectionTemplate {
  const resolvedTemplate = resolveBaseSectionTemplate(template);
  const methodChains = buildBaseSectionMethodChains(template);
  const methods = getLastMethods(methodChains);

  return {
    name: resolvedTemplate.name,
    methods,
    methodChains,
    diff: [...(resolvedTemplate.diff ?? [])]
  };
}

export function extendBaseSectionTemplate(
  base: BaseSectionTemplate,
  override: BaseSectionTemplate = {}
): BaseSectionTemplate {
  const resolvedBase = resolveBaseSectionTemplate(base);
  const resolvedOverride = override.base
    ? extendBaseSectionTemplate(resolveBaseSectionTemplate(override.base), {
        ...override,
        base: undefined
      })
    : override;

  return {
    name: resolvedOverride.name ?? resolvedBase.name,
    methods: {
      ...resolvedBase.methods,
      ...resolvedOverride.methods
    },
    diff: resolvedOverride.diff ?? resolvedBase.diff
  };
}

function resolveBaseSectionTemplate(template: BaseSectionTemplate): BaseSectionTemplate {
  if (!template.base) {
    return template;
  }

  return extendBaseSectionTemplate(template.base, {
    ...template,
    base: undefined
  });
}

function buildBaseSectionMethodChains(template: BaseSectionTemplate): BaseSectionMethodChains {
  const result: BaseSectionMethodChains = {};

  appendMethods(result, createBaseSectionMethods());
  appendTemplateMethods(result, template);

  return result;
}

function appendTemplateMethods(result: BaseSectionMethodChains, template: BaseSectionTemplate) {
  if (template.base) {
    appendTemplateMethods(result, template.base);
  }

  appendMethods(result, template.methods);
}

function appendMethods(result: BaseSectionMethodChains, methods?: BaseSectionMethods) {
  if (!methods) {
    return;
  }

  for (const [name, method] of Object.entries(methods) as [string, BaseSectionMethod][]) {
    result[name] = [...(result[name] ?? []), method];
  }
}

function getLastMethods(methodChains: BaseSectionMethodChains): BaseSectionMethods {
  const methods = {} as BaseSectionMethods;

  for (const [name, chain] of Object.entries(methodChains) as [string, BaseSectionMethod[]][]) {
    const method = chain[chain.length - 1];

    if (method) {
      methods[name] = method;
    }
  }

  return methods;
}

export const baseSectionTemplate = createBaseSectionTemplate({
  diff: [] as BaseSectionDiffItem[]
});
