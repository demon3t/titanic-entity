import {
  Titanic,
  createEntityRecordQuery,
  toEntityDisplayValues,
  toEntityValues,
  useEntityEditPageController,
  useOptionalEntityApiClient,
  type EntityDisplayValues,
  type EntityValues
} from "@titanic-entity/entity-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode
} from "react";
import type {
  EntityEditPageAction,
  EntityEditPageContext,
  EntityEditPageDiffItem,
  EntityEditPageMethods,
  EntityEditPagePredicate,
  EntityEditPageRenderValue
} from "@titanic-entity/entity-react/templates";
import { ActionBar } from "../actionBar";
import { Button, ButtonMethodProvider } from "../button";
import { Container } from "../container";
import { Expander } from "../expander";
import { EntityField } from "../field";
import { Grid } from "../grid";
import { Label } from "../label";
import { getEditPageLabels } from "./edit-page-lcz";
import type { BasePageProps } from "./index";

interface LoadedEntityRecord {
  displayValues: EntityDisplayValues;
  values: EntityValues;
}

export const BasePage = Titanic.define<BasePageProps>(
  "Titanic.UI.BasePage",
  function BasePage({
    template,
    value,
    displayValues,
    recordId,
    loadRecord = true,
    clientName,
    disabled = false,
    className = "",
    top,
    bottom,
    backLabel,
    cancelLabel,
    deleteLabel,
    submitLabel,
    backDisabled = false,
    cancelDisabled = false,
    deleteDisabled = false,
    submitDisabled = false,
    actionBarVariant,
    locale,
    labels,
    manualCommitDelayMs,
    onChange,
    onBack,
    onCancel,
    onDelete,
    onSubmit
  }: BasePageProps) {
    const apiClient = useOptionalEntityApiClient(clientName);
    const [loadedRecord, setLoadedRecord] = useState<LoadedEntityRecord | null>(null);
    const loadedRecordRef = useRef<LoadedEntityRecord | null>(null);
    const loadedRecordKeyRef = useRef<string | null>(null);
    const recordLoadRequestRef = useRef(0);

    const setLoadedEntityRecord = (nextRecord: LoadedEntityRecord | null) => {
      loadedRecordRef.current = nextRecord;
      setLoadedRecord(nextRecord);
    };

    const clearLoadedEntityRecord = () => {
      recordLoadRequestRef.current += 1;
      loadedRecordKeyRef.current = null;
      if (loadedRecordRef.current !== null) {
        setLoadedEntityRecord(null);
      }
    };

    const pageMethods = useMemo<EntityEditPageMethods>(() => ({
      destroy: () => {
        recordLoadRequestRef.current += 1;
        loadedRecordKeyRef.current = null;
        loadedRecordRef.current = null;
        return null;
      },
      init: (context: EntityEditPageContext) => {
        if (!loadRecord) {
          clearLoadedEntityRecord();
          return null;
        }

        const nextRecordId = getRecordId(recordId, context.values, context.schema.primaryColumn);
        if (isEmptyRecordId(nextRecordId)) {
          clearLoadedEntityRecord();
          return null;
        }

        const loadKey = createRecordLoadKey(context.schema, nextRecordId);
        return loadedRecordKeyRef.current === loadKey
          ? loadedRecordRef.current
          : context.runMethod("loadEntity", nextRecordId);
      },
      loadEntity: async (context: EntityEditPageContext, nextRecordId?: unknown) => {
        const effectiveRecordId = getRecordId(nextRecordId, context.values, context.schema.primaryColumn);

        if (isEmptyRecordId(effectiveRecordId)) {
          clearLoadedEntityRecord();
          return null;
        }

        if (!apiClient) {
          return null;
        }

        const loadKey = createRecordLoadKey(context.schema, effectiveRecordId);
        const requestId = recordLoadRequestRef.current + 1;
        recordLoadRequestRef.current = requestId;
        loadedRecordKeyRef.current = loadKey;

        try {
          const rows = await apiClient.select(createEntityRecordQuery(context.schema, effectiveRecordId));
          if (recordLoadRequestRef.current !== requestId) {
            return loadedRecordRef.current;
          }

          const row = rows[0];
          const nextLoadedRecord = row
            ? { values: toEntityValues(row), displayValues: toEntityDisplayValues(row) }
            : null;
          setLoadedEntityRecord(nextLoadedRecord);
          return nextLoadedRecord;
        } catch (error) {
          if (recordLoadRequestRef.current === requestId) {
            loadedRecordKeyRef.current = null;
          }

          throw error;
        }
      },
      reloadEntity() {
        return this.loadEntity(this.get("Id"));
      }
    }), [apiClient, loadRecord, recordId]);

    const mergedValue = useMemo(
      () => loadedRecord?.values ? { ...loadedRecord.values, ...value } : value,
      [loadedRecord, value]
    );
    const mergedDisplayValues = useMemo(
      () => loadedRecord?.displayValues ? { ...loadedRecord.displayValues, ...displayValues } : displayValues,
      [displayValues, loadedRecord]
    );
    const { normalizedTemplate, context } = useEntityEditPageController({
      template,
      value: mergedValue,
      displayValues: mergedDisplayValues,
      disabled,
      methods: pageMethods,
      onChange,
      onSubmit
    });
    const effectiveRecordId = getRecordId(recordId, value, normalizedTemplate.schema.primaryColumn);
    const recordLoadKey = loadRecord && !isEmptyRecordId(effectiveRecordId)
      ? createRecordLoadKey(normalizedTemplate.schema, effectiveRecordId)
      : "";

    useEffect(() => {
      let cancelled = false;

      void context.runMethod("init").catch(() => {
        if (!cancelled) {
          loadedRecordKeyRef.current = null;
          if (loadedRecordRef.current !== null) {
            setLoadedEntityRecord(null);
          }
        }
      });

      return () => {
        cancelled = true;
        void context.runMethod("destroy").catch(() => undefined);
      };
    }, [apiClient, context.runMethod, loadRecord, recordLoadKey]);

    const diffItems = Array.isArray(normalizedTemplate.diff) ? normalizedTemplate.diff : [];
    const resolvedLabels = { ...getEditPageLabels(locale), ...(labels ?? {}) };
    const resolvedBackLabel = backLabel ?? resolvedLabels.back;
    const resolvedCancelLabel = cancelLabel ?? resolvedLabels.cancel;
    const resolvedDeleteLabel = deleteLabel ?? resolvedLabels.delete;
    const resolvedSubmitLabel = submitLabel ?? normalizedTemplate.submitLabel ?? resolvedLabels.submit;
    const topContent = top ? resolveRenderValue(top, context) : null;
    const bottomContent = bottom ? resolveRenderValue(bottom, context) : null;
    const hasChanges = context.isDirty;
    const hasToolbar = Boolean(
      (hasChanges && (onSubmit || onCancel)) ||
      (!hasChanges && onBack) ||
      onDelete
    );

    const runAction = async (action: EntityEditPageAction, type: string) => {
      if (action.onClick) {
        await action.onClick.call(
          {
            ...context,
            context,
            get: <TValue = unknown,>(key: string) => context.getValue<TValue>(key),
            callParent: () => {
              throw new Error(
                `Entity edit page action "${action.name ?? "anonymous"}" does not have a parent implementation.`
              );
            }
          },
          context,
          ...(action.args ?? [])
        );
      } else if (action.method) {
        await context.runMethod(action.method, ...(action.args ?? []));
      } else if (type === "submit") {
        await context.submit();
      } else if (type === "reset") {
        context.reset();
      }
    };

    const renderField = (item: any, key: string): ReactNode => {
      const column = context.template.columnsByAttribute[item.attribute];
      if (!column) {
        return null;
      }

      return (
        <EntityField
          className={item.className}
          column={{ ...column, gridSpan: item.gridSpan ?? column.gridSpan }}
          disabled={context.disabled || resolvePredicate(item.disabled, context, false)}
          displayValues={context.displayValues}
          key={key}
          manualCommitDelayMs={manualCommitDelayMs}
          values={context.values}
          onChange={context.setValue}
        />
      );
    };

    const renderAction = (action: EntityEditPageAction, index: number): ReactNode => {
      const type = action.type ?? "button";
      const isNativeSubmit = type === "submit" && !action.method && !action.onClick;

      return (
        <Button
          className={joinClassNames(
            action.variant ? `titanic-edit-page__button_${action.variant}` : "",
            action.className
          )}
          disabled={context.disabled || resolvePredicate(action.disabled, context, false)}
          key={action.name ?? `action-${index}`}
          type={isNativeSubmit ? "submit" : "button"}
          onClick={isNativeSubmit ? undefined : () => void runAction(action, type)}
        >
          {resolveRenderValue(action.label, context)}
        </Button>
      );
    };

    const renderDiffItem = (item: EntityEditPageDiffItem, index: number): ReactNode => {
      if (!resolvePredicate(item.visible, context, true)) {
        return null;
      }

      const key = item.name ?? `${item.type}-${index}`;
      const style = getGridSpanStyle(item.gridSpan);

      switch (item.type) {
        case "field":
          return renderField(item, key);
        case "section":
          return (
            <Expander
              className={joinClassNames("titanic-edit-page__section", item.className)}
              contentClassName="titanic-edit-page__section-content"
              defaultExpanded={item.defaultExpanded ?? true}
              key={key}
              label={item.title ? resolveRenderValue(item.title, context) : undefined}
              style={style}
            >
              <Grid columns={item.columns} gap={item.gap}>
                {(item.attributes ?? []).map((attribute, fieldIndex) => (
                  renderField({ type: "field", attribute }, `attribute-${attribute}-${fieldIndex}`)
                ))}
                {(item.items ?? []).map(renderDiffItem)}
              </Grid>
            </Expander>
          );
        case "row":
          return (
            <Container
              className={joinClassNames("titanic-edit-page__row", item.className)}
              key={key}
              style={style}
            >
              <Grid columns={item.columns} gap={item.gap}>
                {(item.attributes ?? []).map((attribute, fieldIndex) => (
                  renderField({ type: "field", attribute }, `attribute-${attribute}-${fieldIndex}`)
                ))}
                {(item.items ?? []).map(renderDiffItem)}
              </Grid>
            </Container>
          );
        case "text":
          return (
            <Container
              className={joinClassNames("titanic-edit-page__text", item.className)}
              key={key}
              style={style}
            >
              {resolveRenderValue(item.text, context)}
            </Container>
          );
        case "actions":
          return (
            <Container
              className={joinClassNames("titanic-edit-page__actions", item.className)}
              key={key}
              style={style}
            >
              {item.actions.map(renderAction)}
            </Container>
          );
        case "custom":
          return (
            <Container
              className={joinClassNames("titanic-edit-page__custom", item.className)}
              key={key}
              style={style}
            >
              {item.render(context)}
            </Container>
          );
        default:
          return null;
      }
    };

    return (
      <ButtonMethodProvider runMethod={context.runMethod}>
      <form
        className={joinClassNames("titanic-base-page", "titanic-edit-page", className)}
        onSubmit={async (event: FormEvent) => {
          event.preventDefault();
          await context.runMethod("save");
        }}
      >
        {hasToolbar ? (
          <ActionBar
            align="start"
            className="titanic-edit-page__toolbar"
            contentClassName="titanic-edit-page__toolbar-actions"
            variant={actionBarVariant}
          >
            {onSubmit && hasChanges ? (
              <Button disabled={disabled || submitDisabled} method="save" type="button" variant="primary">
                {resolvedSubmitLabel}
              </Button>
            ) : null}
            {hasChanges && (onSubmit || onCancel) ? (
              <Button
                disabled={disabled || cancelDisabled}
                type="button"
                variant="secondary"
                onClick={() => {
                  context.reset();
                  void onCancel?.(context);
                }}
              >
                {resolvedCancelLabel}
              </Button>
            ) : null}
            {onBack && !hasChanges ? (
              <Button
                disabled={disabled || backDisabled}
                type="button"
                variant="secondary"
                onClick={() => void onBack(context)}
              >
                {resolvedBackLabel}
              </Button>
            ) : null}
            {onDelete ? (
              <Button
                disabled={disabled || deleteDisabled}
                type="button"
                variant="danger"
                onClick={() => void onDelete(context.values, context)}
              >
                {resolvedDeleteLabel}
              </Button>
            ) : null}
          </ActionBar>
        ) : null}
        {normalizedTemplate.title || topContent ? (
          <Container className="titanic-edit-page__top">
            {normalizedTemplate.title ? (
              <Label as="h2" className="titanic-edit-page__title" value={normalizedTemplate.title} />
            ) : null}
            {topContent}
          </Container>
        ) : null}
        <Grid className="titanic-edit-page__grid">
          {diffItems.map(renderDiffItem)}
        </Grid>
        {bottomContent ? (
          <Container className="titanic-edit-page__bottom">
            {bottomContent}
          </Container>
        ) : null}
      </form>
      </ButtonMethodProvider>
    );
  }
);

function getRecordId(recordId: unknown, value: EntityValues | undefined, primaryColumn: string | undefined): unknown {
  return !isEmptyRecordId(recordId) ? recordId : value?.[primaryColumn ?? "Id"];
}

function isEmptyRecordId(value: unknown): boolean {
  return value === null || value === undefined || value === "";
}

function createRecordLoadKey(
  schema: { tableName: string; primaryColumn?: string; columns: readonly { path: string; alias?: string }[] },
  recordId: unknown
): string {
  const columnsKey = schema.columns.map((column) => `${column.path}:${column.alias ?? ""}`).join("|");
  return `${schema.tableName}:${schema.primaryColumn ?? "Id"}:${String(recordId)}:${columnsKey}`;
}

function resolveRenderValue<TValue>(
  value: EntityEditPageRenderValue<TValue>,
  context: EntityEditPageContext
): TValue {
  return typeof value === "function"
    ? (value as (context: EntityEditPageContext) => TValue)(context)
    : value;
}

function resolvePredicate(
  predicate: EntityEditPagePredicate | undefined,
  context: EntityEditPageContext,
  defaultValue: boolean
): boolean {
  return predicate === undefined
    ? defaultValue
    : typeof predicate === "function"
      ? predicate(context)
      : predicate;
}

function getGridSpanStyle(gridSpan?: number): CSSProperties | undefined {
  return gridSpan ? { "--titanic-grid-span": gridSpan } as CSSProperties : undefined;
}

function joinClassNames(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}
