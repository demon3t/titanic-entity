export type BaseModuleMethodArguments = IArguments | ArrayLike<unknown> | unknown[];

export interface BaseModuleMethodThis {
  callParent: (args?: BaseModuleMethodArguments) => Promise<unknown>;
}

export type BaseModuleMethod<
  TContext = unknown,
  TThis extends BaseModuleMethodThis = BaseModuleMethodThis,
  TResult = unknown
> = (this: TThis, context: TContext, ...args: unknown[]) => TResult | Promise<TResult>;

export type BaseModuleMethods<
  TContext = unknown,
  TThis extends BaseModuleMethodThis = BaseModuleMethodThis,
  TMethod extends BaseModuleMethod<TContext, TThis> = BaseModuleMethod<TContext, TThis>
> = Record<string, TMethod> & ThisType<TThis>;

export type BaseModuleMethodChains<
  TContext = unknown,
  TThis extends BaseModuleMethodThis = BaseModuleMethodThis,
  TMethod extends BaseModuleMethod<TContext, TThis> = BaseModuleMethod<TContext, TThis>
> = Record<string, TMethod[]>;

export interface BaseModuleTemplate<TContext = unknown, TMethods = BaseModuleMethods<TContext>, TDiff = unknown> {
  methods?: TMethods;
  diff?: TDiff;
}

export interface NormalizedBaseModuleTemplate<
  TContext = unknown,
  TMethods = BaseModuleMethods<TContext>,
  TMethodChains = BaseModuleMethodChains<TContext>,
  TDiff = unknown
> {
  methods: TMethods;
  methodChains: TMethodChains;
  diff: TDiff;
}
