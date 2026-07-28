import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Entity, createEmptyValues, type EntityDisplayValues, type EntityValues } from "@titanic-entity/entity-core";
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
  /** Entity instance owning the original, previous, and current value snapshots. */
  entity: Entity;

  /** Normalized template with resolved schema, attributes, methods, and diff. */
  normalizedTemplate: NormalizedEntityEditPageTemplate;

  /** Execution context passed to template predicates, renderers, and methods. */
  context: EntityEditPageContext;

  /** Whether current values differ from the latest accepted values. */
  isDirty: boolean;

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
  const entity = useMemo(() => new Entity(normalizedTemplate.schema, initialValues), [normalizedTemplate.schema]);
  const [values, setValuesState] = useState(initialValues);
  const [currentDisplayValues, setDisplayValuesState] = useState<EntityDisplayValues>(displayValues ?? {});
  const [isDirty, setIsDirtyState] = useState(false);
  const valuesRef = useRef(initialValues);
  const displayValuesRef = useRef<EntityDisplayValues>(displayValues ?? {});
  const acceptedValuesRef = useRef(initialValues);
  const acceptedDisplayValuesRef = useRef<EntityDisplayValues>(displayValues ?? {});
  const isDirtyRef = useRef(false);
  const contextRef = useRef<EntityEditPageContext | null>(null);
  const methodChainsRef = useRef<EntityEditPageMethodChains>({});

  const setIsDirty = useCallback((nextIsDirty: boolean) => {
    isDirtyRef.current = nextIsDirty;
    setIsDirtyState((currentIsDirty) => currentIsDirty === nextIsDirty ? currentIsDirty : nextIsDirty);
  }, []);

  useEffect(() => {
    const preservePendingChanges =
      isDirtyRef.current && areEntityValuesEqual(initialValues, valuesRef.current);

    valuesRef.current = initialValues;
    entity.acceptChanges(initialValues);
    displayValuesRef.current = displayValues ?? {};
    setValuesState(initialValues);
    setDisplayValuesState(displayValues ?? {});

    if (!preservePendingChanges) {
      acceptedValuesRef.current = initialValues;
      acceptedDisplayValuesRef.current = displayValues ?? {};
      setIsDirty(false);
    }
  }, [displayValues, entity, initialValues, setIsDirty]);

  const setValues = useCallback((updater: EntityEditPageValuesUpdater) => {
    const previousValues = valuesRef.current;
    const nextValues = typeof updater === "function" ? updater(valuesRef.current) : updater;
    const nextDisplayValues = clearChangedDisplayValues(displayValuesRef.current, previousValues, nextValues);

    entity.setValues(nextValues);
    valuesRef.current = nextValues;
    displayValuesRef.current = nextDisplayValues;
    setValuesState(nextValues);
    setDisplayValuesState(nextDisplayValues);
    const nextIsDirty = !areEntityValuesEqual(nextValues, acceptedValuesRef.current);
    setIsDirty(nextIsDirty);

    const currentContext = contextRef.current;
    if (currentContext) {
      onChange?.(nextValues, {
        ...currentContext,
        values: nextValues,
        displayValues: nextDisplayValues,
        isDirty: nextIsDirty
      });
    }
  }, [entity, onChange, setIsDirty]);

  const setValue = useCallback((key: string, nextValue: unknown) => {
    setValues((currentValues) => ({ ...currentValues, [key]: nextValue }));
  }, [setValues]);

  const reset = useCallback(() => {
    entity.resetChanges();
    const resetValues = entity.currentValues;
    const resetDisplayValues = acceptedDisplayValuesRef.current;

    valuesRef.current = resetValues;
    displayValuesRef.current = resetDisplayValues;
    setValuesState(resetValues);
    setDisplayValuesState(resetDisplayValues);
    setIsDirty(false);

    const currentContext = contextRef.current;
    if (currentContext) {
      onChange?.(resetValues, {
        ...currentContext,
        values: resetValues,
        displayValues: resetDisplayValues,
        isDirty: false
      });
    }
  }, [entity, onChange, setIsDirty]);

  const submit = useCallback(async () => {
    const currentContext = contextRef.current;
    if (!currentContext) {
      return;
    }

    const result = await onSubmit?.(valuesRef.current, { ...currentContext, values: valuesRef.current });

    if (result !== false) {
      entity.acceptChanges(valuesRef.current);
      acceptedValuesRef.current = valuesRef.current;
      acceptedDisplayValuesRef.current = displayValuesRef.current;
      setIsDirty(false);
    }
  }, [entity, onSubmit, setIsDirty]);

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
    const methodThis = {
      ...currentContext,
      context: currentContext,
      get: <TValue = unknown,>(key: string) => currentContext.getValue<TValue>(key),
      callParent: (parentArguments?: EntityEditPageMethodArguments) => {
        const parentIndex = methodIndex - 1;

        if (parentIndex < 0) {
          throw new Error(`Entity edit page method "${name}" does not have a parent implementation.`);
        }

        const parentCall = normalizeCallParentArguments(parentArguments, currentContext, args);
        return runMethodAtImpl(name, parentIndex, parentCall.context, parentCall.args);
      }
    } as EntityEditPageMethodThis;

    for (const [boundMethodName, boundMethodChain] of Object.entries(methodChainsRef.current)) {
      methodThis[boundMethodName] = (...boundArgs: unknown[]) =>
        runMethodAtImpl(boundMethodName, boundMethodChain.length - 1, currentContext, boundArgs);
    }

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
    entity,
    template: normalizedTemplate,
    schema: normalizedTemplate.schema,
    attributes: normalizedTemplate.attributes,
    methods,
    values,
    displayValues: currentDisplayValues,
    disabled,
    isDirty,
    getValue: <TValue = unknown,>(key: string) => values[key] as TValue | undefined,
    setValue,
    setValues,
    submit,
    reset,
    runMethod
  }), [currentDisplayValues, disabled, entity, isDirty, methods, normalizedTemplate, reset, runMethod, setValue, setValues, submit, values]);

  contextRef.current = context;

  return {
    entity,
    normalizedTemplate,
    context,
    isDirty,
    submit,
    reset
  };
}

function areEntityValuesEqual(left: EntityValues, right: EntityValues): boolean {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);

  return [...keys].every((key) => Object.is(left[key], right[key]));
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
