// Шаблон страницы редактирования сущности для пакетного переиспользования.
import type { ComponentType, CSSProperties, FormEvent, ReactNode } from "react";
import { EntityField } from "../../components/fields/EntityField";
import type { EntityFieldProps } from "../../components/fields/models/EntityFieldProps";
import { EntityGrid } from "../../components/layout/EntityGrid";
import type { EntityGridProps } from "../../components/layout/models/EntityGridProps";
import { useUiComponent } from "@titanic-entity/entity-base";
import { useEntityEditPageController } from "../../headless/entityEditPageState";
import type {
  EntityEditPageAction,
  EntityEditPageActionsDiffItem,
  EntityEditPageContext,
  EntityEditPageDiffItem,
  EntityEditPageFieldDiffItem,
  EntityEditPagePredicate,
  EntityEditPageProps,
  EntityEditPageRenderValue
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
  const { normalizedTemplate, context, submit } = useEntityEditPageController({
    template,
    value,
    displayValues,
    disabled,
    onChange,
    onSubmit
  });

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
