import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createEmptyValues, type EntityDisplayValues, type EntityValues } from "@titanic-entity/entity-core";
import { createBaseModuleMethods } from "../templates/base-module";
import { createEntityEditPageTemplate } from "../templates/entity-edit/entityEditPageTemplate";
import type {
  EntityEditPageContext,
  EntityEditPageMethod,
  EntityEditPageMethodArguments,
  EntityEditPageMethodChains,
  EntityEditPageMethodThis,
  EntityEditPageMethods,
  EntityEditPageProps,
  EntityEditPageValuesUpdater,
  NormalizedEntityEditPageTemplate
} from "../templates/entity-edit/models/EntityEditPageTemplate";

/**
 * Configures state management for an EntityEditPage template.
 */
export interface EntityEditPageControllerOptions extends Pick<
  EntityEditPageProps<EntityValues>,
  "template" | "value" | "displayValues" | "disabled" | "onChange" | "onSubmit"
> {
  methods?: EntityEditPageMethods;
}

/**
 * Headless state API consumed by EntityEditPage and custom template renderers.
 */
export interface EntityEditPageController {
  /** Normalized template with resolved schema, attributes, methods, and diff. */
  normalizedTemplate: NormalizedEntityEditPageTemplate;

  /** Execution context passed to template predicates, renderers, and methods. */
  context: EntityEditPageContext;

  /** Submits the current values through the configured onSubmit callback. */
  submit: () => Promise<void>;

  /** Restores values and display values from the latest inputs. */
  reset: () => void;
}

/**
 * Creates a headless controller for an EntityEditPage template instance.
 */
export function useEntityEditPageController({
  template,
  value,
  displayValues,
  disabled = false,
  methods: externalMethods,
  onChange,
  onSubmit
}: EntityEditPageControllerOptions): EntityEditPageController {
  const normalizedTemplate = useMemo(() => createEntityEditPageTemplate(template), [template]);
  const initialValues = useMemo(
    () => createInitialValues(normalizedTemplate.attributes, normalizedTemplate.schema, value),
    [normalizedTemplate, value]
  );
  const [values, setValuesState] = useState(initialValues);
  const [currentDisplayValues, setDisplayValuesState] = useState<EntityDisplayValues>(displayValues ?? {});
  const valuesRef = useRef(initialValues);
  const displayValuesRef = useRef<EntityDisplayValues>(displayValues ?? {});
  const contextRef = useRef<EntityEditPageContext | null>(null);
  const methodChainsRef = useRef<EntityEditPageMethodChains>({});

  useEffect(() => {
    valuesRef.current = initialValues;
    displayValuesRef.current = displayValues ?? {};
    setValuesState(initialValues);
    setDisplayValuesState(displayValues ?? {});
  }, [displayValues, initialValues]);

  const setValues = useCallback((updater: EntityEditPageValuesUpdater) => {
    const previousValues = valuesRef.current;
    const nextValues = typeof updater === "function" ? updater(valuesRef.current) : updater;
    const nextDisplayValues = clearChangedDisplayValues(displayValuesRef.current, previousValues, nextValues);

    valuesRef.current = nextValues;
    displayValuesRef.current = nextDisplayValues;
    setValuesState(nextValues);
    setDisplayValuesState(nextDisplayValues);

    const currentContext = contextRef.current;
    if (currentContext) {
      onChange?.(nextValues, { ...currentContext, values: nextValues, displayValues: nextDisplayValues });
    }
  }, [onChange]);

  const setValue = useCallback((key: string, nextValue: unknown) => {
    setValues((currentValues) => ({ ...currentValues, [key]: nextValue }));
  }, [setValues]);

  const reset = useCallback(() => {
    valuesRef.current = initialValues;
    displayValuesRef.current = displayValues ?? {};
    setValuesState(initialValues);
    setDisplayValuesState(displayValues ?? {});
  }, [displayValues, initialValues]);

  const submit = useCallback(async () => {
    const currentContext = contextRef.current;
    if (!currentContext) {
      return;
    }

    await onSubmit?.(valuesRef.current, { ...currentContext, values: valuesRef.current });
  }, [onSubmit]);

  const baseModuleMethods = useMemo<EntityEditPageMethods>(
    () => createBaseModuleMethods<EntityEditPageContext>() as EntityEditPageMethods,
    []
  );

  const builtInMethods = useMemo<EntityEditPageMethods>(() => ({
    save: (context: EntityEditPageContext) => context.submit(),
    reset: (context: EntityEditPageContext) => context.reset()
  }), []);

  const methodChains = useMemo(
    () => mergeMethodChains(
      createMethodChainsFromMethods(baseModuleMethods),
      createMethodChainsFromMethods(builtInMethods),
      createMethodChainsFromMethods(externalMethods),
      normalizedTemplate.methodChains
    ),
    [baseModuleMethods, builtInMethods, externalMethods, normalizedTemplate.methodChains]
  );

  methodChainsRef.current = methodChains;

  const runMethodAt = useCallback(async function runMethodAtImpl(
    name: string,
    methodIndex: number,
    methodContext: EntityEditPageContext,
    args: unknown[]
  ): Promise<unknown> {
    const chain = methodChainsRef.current[name];
    const method = chain?.[methodIndex];

    if (!method) {
      throw new Error(`Entity edit page method "${name}" is not registered.`);
    }

    const currentContext = createMethodContext(methodContext, valuesRef.current, displayValuesRef.current);
    const methodThis: EntityEditPageMethodThis = {
      ...currentContext,
      context: currentContext,
      callParent: (parentArguments?: EntityEditPageMethodArguments) => {
        const parentIndex = methodIndex - 1;

        if (parentIndex < 0) {
          throw new Error(`Entity edit page method "${name}" does not have a parent implementation.`);
        }

        const parentCall = normalizeCallParentArguments(parentArguments, currentContext, args);
        return runMethodAtImpl(name, parentIndex, parentCall.context, parentCall.args);
      }
    };

    return method.call(methodThis, currentContext, ...args);
  }, []);

  const methods = useMemo<EntityEditPageMethods>(() => {
    const result: Record<string, EntityEditPageMethod> = {};

    for (const [name, chain] of Object.entries(methodChains)) {
      const methodIndex = chain.length - 1;
      result[name] = function runEntityEditPageMethod(context, ...args) {
        return runMethodAt(name, methodIndex, context, args);
      };
    }

    return result as EntityEditPageMethods;
  }, [methodChains, runMethodAt]);

  const runMethod = useCallback(async (name: string, ...args: unknown[]) => {
    const currentContext = contextRef.current;
    const chain = methodChainsRef.current[name];

    if (!currentContext || !chain?.length) {
      throw new Error(`Entity edit page method "${name}" is not registered.`);
    }

    return runMethodAt(name, chain.length - 1, currentContext, args);
  }, [runMethodAt]);

  const context = useMemo<EntityEditPageContext>(() => ({
    template: normalizedTemplate,
    schema: normalizedTemplate.schema,
    attributes: normalizedTemplate.attributes,
    methods,
    values,
    displayValues: currentDisplayValues,
    disabled,
    getValue: <TValue = unknown,>(key: string) => values[key] as TValue | undefined,
    setValue,
    setValues,
    submit,
    reset,
    runMethod
  }), [currentDisplayValues, disabled, methods, normalizedTemplate, reset, runMethod, setValue, setValues, submit, values]);

  contextRef.current = context;

  return {
    normalizedTemplate,
    context,
    submit,
    reset
  };
}

function createInitialValues(
  attributes: EntityEditPageContext["attributes"],
  schema: EntityEditPageContext["schema"],
  value?: EntityValues
): EntityValues {
  const attributeValues = Object.fromEntries(
    Object.entries(attributes)
      .map(([key, attribute]) => [key, getFirstDefined(attribute.value, attribute.defaultValue, attribute.column?.defaultValue)])
      .filter((entry): entry is [string, unknown] => entry[1] !== undefined)
  );

  return {
    ...createEmptyValues(schema),
    ...attributeValues,
    ...value
  };
}

function getFirstDefined<TValue>(...values: Array<TValue | undefined>): TValue | undefined {
  return values.find((item) => item !== undefined);
}

function clearChangedDisplayValues(
  currentDisplayValues: EntityDisplayValues,
  previousValues: EntityValues,
  nextValues: EntityValues
): EntityDisplayValues {
  let nextDisplayValues = currentDisplayValues;

  for (const [key, nextValue] of Object.entries(nextValues)) {
    if (!Object.is(previousValues[key], nextValue) && Object.prototype.hasOwnProperty.call(nextDisplayValues, key)) {
      nextDisplayValues = nextDisplayValues === currentDisplayValues ? { ...currentDisplayValues } : nextDisplayValues;
      delete nextDisplayValues[key];
    }
  }

  return nextDisplayValues;
}

function createMethodChainsFromMethods(methods: EntityEditPageMethods | undefined): EntityEditPageMethodChains {
  const result: EntityEditPageMethodChains = {};

  for (const [name, method] of Object.entries(methods ?? {})) {
    result[name] = [method];
  }

  return result;
}

function mergeMethodChains(...sources: Array<EntityEditPageMethodChains | undefined>): EntityEditPageMethodChains {
  const result: EntityEditPageMethodChains = {};

  for (const source of sources) {
    for (const [name, chain] of Object.entries(source ?? {})) {
      if (!chain.length) {
        continue;
      }

      result[name] ??= [];
      result[name].push(...chain);
    }
  }

  return result;
}

function createMethodContext(
  context: EntityEditPageContext,
  values: EntityValues,
  displayValues: EntityDisplayValues
): EntityEditPageContext {
  return {
    ...context,
    values,
    displayValues,
    getValue: <TValue = unknown,>(key: string) => values[key] as TValue | undefined
  };
}

function normalizeCallParentArguments(
  parentArguments: EntityEditPageMethodArguments | undefined,
  currentContext: EntityEditPageContext,
  currentArgs: unknown[]
): { context: EntityEditPageContext; args: unknown[] } {
  if (parentArguments === undefined) {
    return {
      context: currentContext,
      args: currentArgs
    };
  }

  const items = Array.from(parentArguments);
  const [firstItem, ...nextArgs] = items;

  if (isEntityEditPageContext(firstItem)) {
    return {
      context: firstItem,
      args: nextArgs
    };
  }

  return {
    context: currentContext,
    args: items
  };
}

function isEntityEditPageContext(value: unknown): value is EntityEditPageContext {
  return Boolean(
    value &&
    typeof value === "object" &&
    "schema" in value &&
    "runMethod" in value &&
    "setValue" in value
  );
}
