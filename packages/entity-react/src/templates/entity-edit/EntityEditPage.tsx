// Шаблон страницы редактирования сущности для пакетного переиспользования.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType, CSSProperties, FormEvent, ReactNode } from "react";
import { createEmptyValues, type EntityDisplayValues, type EntityValues } from "@titanic/entity-core";
import { EntityField } from "../../components/fields/EntityField";
import type { EntityFieldProps } from "../../components/fields/models/EntityFieldProps";
import { EntityGrid } from "../../components/layout/EntityGrid";
import type { EntityGridProps } from "../../components/layout/models/EntityGridProps";
import { useUiComponent } from "@titanic/entity-base";
import { createEntityEditPageTemplate } from "./entityEditPageTemplate";
import type {
  EntityEditPageAction,
  EntityEditPageActionsDiffItem,
  EntityEditPageContext,
  EntityEditPageDiffItem,
  EntityEditPageFieldDiffItem,
  EntityEditPagePredicate,
  EntityEditPageProps,
  EntityEditPageRenderValue,
  EntityEditPageValuesUpdater
} from "./models/EntityEditPageTemplate";

export type { EntityEditPageProps } from "./models/EntityEditPageTemplate";

interface EntityEditPageUiComponents {
  FieldComponent: ComponentType<EntityFieldProps>;
  GridComponent: ComponentType<EntityGridProps>;
}

export function EntityEditPage({
  template,
  value,
  displayValues,
  disabled = false,
  className = "",
  submitLabel,
  manualCommitDelayMs,
  onChange,
  onSubmit
}: EntityEditPageProps) {
  const FieldComponent = useUiComponent<EntityFieldProps>("EntityField", EntityField);
  const GridComponent = useUiComponent<EntityGridProps>("EntityGrid", EntityGrid);
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

  const runMethod = useCallback(async (name: string, ...args: unknown[]) => {
    const currentContext = contextRef.current;
    const method = currentContext?.methods[name];

    if (!currentContext || !method) {
      throw new Error(`Entity edit page method "${name}" is not registered.`);
    }

    return method({ ...currentContext, values: valuesRef.current }, ...args);
  }, []);

  const methods = useMemo(() => ({
    save: (context: EntityEditPageContext) => context.submit(),
    reset: (context: EntityEditPageContext) => context.reset(),
    ...normalizedTemplate.methods
  }), [normalizedTemplate.methods]);

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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await submit();
  };

  const hasActions = hasActionsDiffItem(normalizedTemplate.diff);
  const resolvedSubmitLabel = submitLabel ?? normalizedTemplate.submitLabel ?? "Save";

  return (
    <form className={`titanic-edit-page ${className}`} onSubmit={handleSubmit}>
      {normalizedTemplate.title ? <h2 className="titanic-edit-page__title">{normalizedTemplate.title}</h2> : null}
      <GridComponent className="titanic-edit-page__grid">
        {normalizedTemplate.diff.map((item, index) =>
          renderDiffItem(item, index, context, { FieldComponent, GridComponent }, manualCommitDelayMs)
        )}
      </GridComponent>
      {!hasActions && onSubmit ? (
        <div className="titanic-edit-page__actions">
          <button className="titanic-button" type="submit" disabled={disabled}>
            {resolvedSubmitLabel}
          </button>
        </div>
      ) : null}
    </form>
  );
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

function renderDiffItem(
  item: EntityEditPageDiffItem,
  index: number,
  context: EntityEditPageContext,
  components: EntityEditPageUiComponents,
  manualCommitDelayMs?: number
): ReactNode {
  if (!resolvePredicate(item.visible, context, true)) {
    return null;
  }

  const key = item.name ?? `${item.type}-${index}`;
  const style = getGridSpanStyle(item.gridSpan);

  switch (item.type) {
    case "field":
      return renderField(item, key, context, components, manualCommitDelayMs);
    case "section":
      return (
        <section className={joinClassNames("titanic-edit-page__section", item.className)} key={key} style={style}>
          {item.title ? <h3>{resolveRenderValue(item.title, context)}</h3> : null}
          <components.GridComponent columns={item.columns} gap={item.gap}>
            {renderAttributeFields(item.attributes, context, components, manualCommitDelayMs)}
            {(item.items ?? []).map((child, childIndex) => renderDiffItem(child, childIndex, context, components, manualCommitDelayMs))}
          </components.GridComponent>
        </section>
      );
    case "row":
      return (
        <div className={joinClassNames("titanic-edit-page__row", item.className)} key={key} style={style}>
          <components.GridComponent columns={item.columns} gap={item.gap}>
            {renderAttributeFields(item.attributes, context, components, manualCommitDelayMs)}
            {(item.items ?? []).map((child, childIndex) => renderDiffItem(child, childIndex, context, components, manualCommitDelayMs))}
          </components.GridComponent>
        </div>
      );
    case "text":
      return (
        <div className={joinClassNames("titanic-edit-page__text", item.className)} key={key} style={style}>
          {resolveRenderValue(item.text, context)}
        </div>
      );
    case "actions":
      return renderActions(item, key, context, style);
    case "custom":
      return (
        <div className={joinClassNames("titanic-edit-page__custom", item.className)} key={key} style={style}>
          {item.render(context)}
        </div>
      );
  }
}

function renderAttributeFields(
  attributes: string[] | undefined,
  context: EntityEditPageContext,
  components: EntityEditPageUiComponents,
  manualCommitDelayMs?: number
): ReactNode[] {
  return (attributes ?? []).map((attribute, index) =>
    renderField({ type: "field", attribute }, `attribute-${attribute}-${index}`, context, components, manualCommitDelayMs)
  );
}

function renderField(
  item: EntityEditPageFieldDiffItem,
  key: string,
  context: EntityEditPageContext,
  components: EntityEditPageUiComponents,
  manualCommitDelayMs?: number
): ReactNode {
  const column = context.template.columnsByAttribute[item.attribute];
  if (!column) {
    return null;
  }

  return (
    <components.FieldComponent
      className={item.className}
      column={{ ...column, gridSpan: item.gridSpan ?? column.gridSpan }}
      disabled={context.disabled || resolvePredicate(item.disabled, context, false)}
      key={key}
      manualCommitDelayMs={manualCommitDelayMs}
      onChange={context.setValue}
      displayValues={context.displayValues}
      values={context.values}
    />
  );
}

function renderActions(
  item: EntityEditPageActionsDiffItem,
  key: string,
  context: EntityEditPageContext,
  style: CSSProperties | undefined
): ReactNode {
  return (
    <div className={joinClassNames("titanic-edit-page__actions", item.className)} key={key} style={style}>
      {item.actions.map((action, index) => renderAction(action, index, context))}
    </div>
  );
}

function renderAction(action: EntityEditPageAction, index: number, context: EntityEditPageContext): ReactNode {
  const key = action.name ?? `action-${index}`;
  const type = action.type ?? "button";
  const isNativeSubmit = type === "submit" && !action.method && !action.onClick;
  const disabled = context.disabled || resolvePredicate(action.disabled, context, false);

  const handleClick = async () => {
    if (action.onClick) {
      await action.onClick(context, ...(action.args ?? []));
      return;
    }

    if (action.method) {
      await context.runMethod(action.method, ...(action.args ?? []));
      return;
    }

    if (type === "submit") {
      await context.submit();
      return;
    }

    if (type === "reset") {
      context.reset();
    }
  };

  return (
    <button
      className={joinClassNames("titanic-button", getActionVariantClassName(action.variant), action.className)}
      disabled={disabled}
      key={key}
      onClick={isNativeSubmit ? undefined : () => void handleClick()}
      type={isNativeSubmit ? "submit" : "button"}
    >
      {resolveRenderValue(action.label, context)}
    </button>
  );
}

function hasActionsDiffItem(diff: EntityEditPageDiffItem[]): boolean {
  return diff.some((item) => {
    if (item.type === "actions") {
      return true;
    }

    return (item.type === "section" || item.type === "row") && hasActionsDiffItem(item.items ?? []);
  });
}

function resolveRenderValue<TValue>(value: EntityEditPageRenderValue<TValue>, context: EntityEditPageContext): TValue {
  return typeof value === "function" ? (value as (context: EntityEditPageContext) => TValue)(context) : value;
}

function resolvePredicate(
  predicate: EntityEditPagePredicate | undefined,
  context: EntityEditPageContext,
  defaultValue: boolean
): boolean {
  if (predicate === undefined) {
    return defaultValue;
  }

  return typeof predicate === "function" ? predicate(context) : predicate;
}

function getGridSpanStyle(gridSpan?: number): CSSProperties | undefined {
  return gridSpan ? { "--titanic-grid-span": gridSpan } as CSSProperties : undefined;
}

function getActionVariantClassName(variant: EntityEditPageAction["variant"]): string {
  return variant ? `titanic-edit-page__button_${variant}` : "";
}

function joinClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(" ");
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
