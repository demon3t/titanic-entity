import type { BaseModuleMethods, BaseModuleTemplate } from "./models/BaseModuleTemplate";

export function createBaseModuleMethods<TContext = unknown>(): BaseModuleMethods<TContext> {
  return {
    init: async () => undefined,
    destroy: async () => undefined
  };
}

export function createBaseModuleTemplate<TContext = unknown, TDiff = unknown[]>(
  diff = [] as TDiff
): BaseModuleTemplate<TContext, BaseModuleMethods<TContext>, TDiff> {
  return {
    methods: createBaseModuleMethods<TContext>(),
    diff
  };
}

export const baseModuleTemplate = createBaseModuleTemplate();
