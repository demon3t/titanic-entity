import {
  ConditionOperator,
  EntityColumnKind,
  EntityLogicalOperation
} from "@titanic-entity/entity-core";
import { Titanic } from "@titanic-entity/entity-react";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Button } from "../button";
import { getEntityQueryFilterBuilderLabels } from "./entity-query-filter-builder-lcz";
import type { EntityQueryFilterBuilderLabelsInput, EntityQueryFilterBuilderProps } from "./index";
import {
  createEntityQueryFilterBuilderColumnOptions,
  createEntityQueryFilterBuilderState,
  createEntityQueryFilterCollection,
  createEntityQueryFilterCondition,
  createEntityQueryFilterGroup,
  createEntityQueryFilters,
  formatEntityQueryFilterBuilderInputValue,
  getEntityQueryFilterOperatorValueMode,
  getEntityQueryFilterOperatorsForColumn,
  parseEntityQueryFilterBuilderInputValue,
  type EntityQueryFilterBuilderColumnOption,
  type EntityQueryFilterBuilderCondition,
  type EntityQueryFilterBuilderGroup,
  type EntityQueryFilterBuilderItem,
  type EntityQueryFilterBuilderLabels,
  type EntityQueryFilterBuilderState
} from "./model";

export const EntityQueryFilterBuilder = Titanic.define<EntityQueryFilterBuilderProps>(
  "Titanic.UI.EntityQueryFilterBuilder",
  function EntityQueryFilterBuilder({
    schema,
    columns,
    value,
    defaultValue,
    labels,
    locale,
    disabled = false,
    className = "",
    onChange
  }: EntityQueryFilterBuilderProps) {
    const columnOptions = useMemo(
      () => createEntityQueryFilterBuilderColumnOptions(columns ?? schema ?? null),
      [columns, schema]
    );
    const resolvedLabels = useMemo(
      () => resolveLabels(getEntityQueryFilterBuilderLabels(locale), labels),
      [labels, locale]
    );
    const controlled = value !== undefined;
    const [uncontrolledState, setUncontrolledState] = useState(() => (
      createEntityQueryFilterBuilderState(defaultValue)
    ));
    const controlledState = useMemo(() => createEntityQueryFilterBuilderState(value), [value]);
    const state = controlled ? controlledState : uncontrolledState;

    useEffect(() => {
      if (!controlled && defaultValue !== undefined) {
        setUncontrolledState(createEntityQueryFilterBuilderState(defaultValue));
      }
    }, [controlled, defaultValue]);

    const commitState = (nextState: EntityQueryFilterBuilderState) => {
      if (!controlled) {
        setUncontrolledState(nextState);
      }

      const collection = createEntityQueryFilterCollection(nextState);
      onChange?.({
        collection,
        filters: collection.items ?? [],
        state: nextState
      });
    };

    const addCondition = () => {
      commitState({
        ...state,
        items: [...state.items, createEntityQueryFilterCondition(columnOptions)]
      });
    };

    const addGroup = () => {
      commitState({
        ...state,
        items: [...state.items, createEntityQueryFilterGroup(columnOptions)]
      });
    };

    const filters = createEntityQueryFilters(state);

    return (
      <div className={joinClassNames("titanic-query-filter-builder", className)}>
        <div className="titanic-query-filter-builder__toolbar">
          <LogicalOperationSelect
            disabled={disabled}
            labels={resolvedLabels}
            value={state.logicalOperation}
            onChange={(logicalOperation) => commitState({ ...state, logicalOperation })}
          />
          <span className="titanic-query-filter-builder__summary">
            {filters.length ? `${filters.length}` : resolvedLabels.empty}
          </span>
          <div className="titanic-query-filter-builder__actions">
            <Button disabled={disabled || !columnOptions.length} type="button" variant="secondary" onClick={addCondition}>
              {resolvedLabels.addCondition}
            </Button>
            <Button disabled={disabled || !columnOptions.length} type="button" variant="secondary" onClick={addGroup}>
              {resolvedLabels.addGroup}
            </Button>
            <Button
              disabled={disabled || !state.items.length}
              type="button"
              variant="ghost"
              onClick={() => commitState({ ...state, items: [] })}
            >
              {resolvedLabels.clear}
            </Button>
          </div>
        </div>

        {!columnOptions.length ? (
          <div className="titanic-query-filter-builder__empty">{resolvedLabels.noFields}</div>
        ) : null}

        {columnOptions.length && state.items.length ? (
          <div className="titanic-query-filter-builder__items">
            {state.items.map((item) => (
              <FilterBuilderItem
                columns={columnOptions}
                disabled={disabled}
                item={item}
                key={item.id}
                labels={resolvedLabels}
                onAddCondition={(groupId) => commitState({
                  ...state,
                  items: addItemToGroup(state.items, groupId, createEntityQueryFilterCondition(columnOptions))
                })}
                onAddGroup={(groupId) => commitState({
                  ...state,
                  items: addItemToGroup(state.items, groupId, createEntityQueryFilterGroup(columnOptions))
                })}
                onChange={(nextItem) => commitState({
                  ...state,
                  items: updateItem(state.items, nextItem)
                })}
                onRemove={(itemId) => commitState({
                  ...state,
                  items: removeItem(state.items, itemId)
                })}
              />
            ))}
          </div>
        ) : null}
      </div>
    );
  }
);

interface FilterBuilderItemProps {
  columns: readonly EntityQueryFilterBuilderColumnOption[];
  disabled: boolean;
  item: EntityQueryFilterBuilderItem;
  labels: EntityQueryFilterBuilderLabels;
  onAddCondition: (groupId: string) => void;
  onAddGroup: (groupId: string) => void;
  onChange: (item: EntityQueryFilterBuilderItem) => void;
  onRemove: (itemId: string) => void;
}

function FilterBuilderItem(props: FilterBuilderItemProps) {
  if (props.item.kind === "group") {
    return <FilterBuilderGroup {...props} item={props.item} />;
  }

  return <FilterBuilderCondition {...props} item={props.item} />;
}

function FilterBuilderGroup({
  columns,
  disabled,
  item,
  labels,
  onAddCondition,
  onAddGroup,
  onChange,
  onRemove
}: FilterBuilderItemProps & { item: EntityQueryFilterBuilderGroup }) {
  return (
    <div className={joinClassNames(
      "titanic-query-filter-builder__group",
      item.isEnabled === false && "titanic-query-filter-builder__group_disabled"
    )}>
      <div className="titanic-query-filter-builder__group-header">
        <strong>{labels.group}</strong>
        <LogicalOperationSelect
          disabled={disabled}
          labels={labels}
          value={item.logicalOperation}
          onChange={(logicalOperation) => onChange({ ...item, logicalOperation })}
        />
        <BooleanToggle
          checked={item.isNot === true}
          disabled={disabled}
          label={labels.not}
          onChange={(isNot) => onChange({ ...item, isNot })}
        />
        <EnabledToggle
          disabled={disabled}
          labels={labels}
          value={item.isEnabled !== false}
          onChange={(enabled) => onChange({ ...item, isEnabled: enabled })}
        />
        <Button disabled={disabled} type="button" variant="ghost" onClick={() => onRemove(item.id)}>
          {labels.remove}
        </Button>
      </div>
      <div className="titanic-query-filter-builder__items titanic-query-filter-builder__items_nested">
        {item.items.map((child) => (
          <FilterBuilderItem
            columns={columns}
            disabled={disabled}
            item={child}
            key={child.id}
            labels={labels}
            onAddCondition={onAddCondition}
            onAddGroup={onAddGroup}
            onChange={(nextItem) => onChange({ ...item, items: updateItem(item.items, nextItem) })}
            onRemove={(itemId) => onChange({ ...item, items: removeItem(item.items, itemId) })}
          />
        ))}
      </div>
      <div className="titanic-query-filter-builder__group-actions">
        <Button disabled={disabled} type="button" variant="secondary" onClick={() => onAddCondition(item.id)}>
          {labels.addCondition}
        </Button>
        <Button disabled={disabled} type="button" variant="secondary" onClick={() => onAddGroup(item.id)}>
          {labels.addGroup}
        </Button>
      </div>
    </div>
  );
}

function FilterBuilderCondition({
  columns,
  disabled,
  item,
  labels,
  onChange,
  onRemove
}: FilterBuilderItemProps & { item: EntityQueryFilterBuilderCondition }) {
  const selectedColumn = columns.find((column) => column.path === item.path) ?? columns[0] ?? null;
  const operators = getEntityQueryFilterOperatorsForColumn(selectedColumn?.column, labels);
  const selectedOperator = operators.some((operator) => operator.value === item.comparisonType)
    ? item.comparisonType
    : operators[0]?.value ?? ConditionOperator.Equal;

  return (
    <div className={joinClassNames(
      "titanic-query-filter-builder__condition",
      item.isEnabled === false && "titanic-query-filter-builder__condition_disabled"
    )}>
      <label className="titanic-query-filter-builder__field">
        <span>{labels.field}</span>
        <select
          disabled={disabled}
          value={selectedColumn?.path ?? ""}
          onChange={(event) => {
            const nextColumn = columns.find((column) => column.path === event.target.value) ?? columns[0];
            const nextOperators = getEntityQueryFilterOperatorsForColumn(nextColumn?.column, labels);
            const nextOperator = nextOperators.some((operator) => operator.value === item.comparisonType)
              ? item.comparisonType
              : nextOperators[0]?.value ?? ConditionOperator.Equal;

            onChange({
              ...item,
              path: nextColumn?.path ?? "",
              comparisonType: nextOperator,
              value: undefined
            });
          }}
        >
          {columns.map((column) => (
            <option key={`${column.key}:${column.path}`} value={column.path}>{column.label}</option>
          ))}
        </select>
      </label>
      <label className="titanic-query-filter-builder__operator">
        <span>{labels.operator}</span>
        <select
          disabled={disabled}
          value={String(selectedOperator)}
          onChange={(event) => onChange({
            ...item,
            comparisonType: Number(event.target.value) as ConditionOperator,
            value: undefined
          })}
        >
          {operators.map((operator) => (
            <option key={operator.value} value={String(operator.value)}>{operator.label}</option>
          ))}
        </select>
      </label>
      <FilterValueInput
        column={selectedColumn}
        disabled={disabled}
        labels={labels}
        operator={selectedOperator}
        value={item.value}
        onChange={(nextValue) => onChange({ ...item, comparisonType: selectedOperator, value: nextValue })}
      />
      <BooleanToggle
        checked={item.isNot === true}
        disabled={disabled}
        label={labels.not}
        onChange={(isNot) => onChange({ ...item, isNot })}
      />
      <EnabledToggle
        disabled={disabled}
        labels={labels}
        value={item.isEnabled !== false}
        onChange={(enabled) => onChange({ ...item, isEnabled: enabled })}
      />
      <Button disabled={disabled} type="button" variant="ghost" onClick={() => onRemove(item.id)}>
        {labels.remove}
      </Button>
    </div>
  );
}

interface FilterValueInputProps {
  column: EntityQueryFilterBuilderColumnOption | null;
  disabled: boolean;
  labels: EntityQueryFilterBuilderLabels;
  operator: ConditionOperator;
  value: unknown;
  onChange: (value: unknown) => void;
}

function FilterValueInput({ column, disabled, labels, operator, value, onChange }: FilterValueInputProps) {
  const valueMode = getEntityQueryFilterOperatorValueMode(operator);

  if (valueMode === "none") {
    return <span className="titanic-query-filter-builder__value-placeholder" aria-hidden="true" />;
  }

  if (column?.kind === EntityColumnKind.Boolean && valueMode === "single") {
    return (
      <label className="titanic-query-filter-builder__value">
        <span>{labels.value}</span>
        <select disabled={disabled} value={value === true ? "true" : "false"} onChange={(event) => onChange(event.target.value === "true")}>
          <option value="true">{labels.booleanTrue}</option>
          <option value="false">{labels.booleanFalse}</option>
        </select>
      </label>
    );
  }

  const inputType = valueMode === "multiple" ? "text" : getInputType(column?.kind);
  const placeholder = valueMode === "multiple" ? labels.valueListPlaceholder : labels.valuePlaceholder;

  return (
    <label className="titanic-query-filter-builder__value">
      <span>{labels.value}</span>
      <input
        disabled={disabled}
        placeholder={placeholder}
        type={inputType}
        value={formatEntityQueryFilterBuilderInputValue(value)}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange(parseEntityQueryFilterBuilderInputValue(event.target.value, operator, column));
        }}
      />
    </label>
  );
}

function LogicalOperationSelect({
  disabled,
  labels,
  value,
  onChange
}: {
  disabled: boolean;
  labels: EntityQueryFilterBuilderLabels;
  value: EntityLogicalOperation;
  onChange: (value: EntityLogicalOperation) => void;
}) {
  return (
    <label className="titanic-query-filter-builder__logical">
      <select
        disabled={disabled}
        value={String(value)}
        onChange={(event) => onChange(Number(event.target.value) as EntityLogicalOperation)}
      >
        <option value={String(EntityLogicalOperation.And)}>{labels.and}</option>
        <option value={String(EntityLogicalOperation.Or)}>{labels.or}</option>
      </select>
    </label>
  );
}

function BooleanToggle({
  checked,
  disabled,
  label,
  onChange
}: {
  checked: boolean;
  disabled: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="titanic-query-filter-builder__toggle">
      <input disabled={disabled} checked={checked} type="checkbox" onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function EnabledToggle({
  disabled,
  labels,
  value,
  onChange
}: {
  disabled: boolean;
  labels: EntityQueryFilterBuilderLabels;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="titanic-query-filter-builder__toggle">
      <input disabled={disabled} checked={value} type="checkbox" onChange={(event) => onChange(event.target.checked)} />
      <span>{value ? labels.enabled : labels.disabled}</span>
    </label>
  );
}

function updateItem(
  items: readonly EntityQueryFilterBuilderItem[],
  nextItem: EntityQueryFilterBuilderItem
): EntityQueryFilterBuilderItem[] {
  return items.map((item) => {
    if (item.id === nextItem.id) {
      return nextItem;
    }

    if (item.kind === "group") {
      return { ...item, items: updateItem(item.items, nextItem) };
    }

    return item;
  });
}

function addItemToGroup(
  items: readonly EntityQueryFilterBuilderItem[],
  groupId: string,
  newItem: EntityQueryFilterBuilderItem
): EntityQueryFilterBuilderItem[] {
  return items.map((item) => {
    if (item.kind !== "group") {
      return item;
    }

    if (item.id === groupId) {
      return { ...item, items: [...item.items, newItem] };
    }

    return { ...item, items: addItemToGroup(item.items, groupId, newItem) };
  });
}

function removeItem(
  items: readonly EntityQueryFilterBuilderItem[],
  itemId: string
): EntityQueryFilterBuilderItem[] {
  return items
    .filter((item) => item.id !== itemId)
    .map((item) => item.kind === "group" ? { ...item, items: removeItem(item.items, itemId) } : item);
}

function getInputType(kind?: EntityColumnKind): string {
  switch (kind) {
    case EntityColumnKind.Number:
      return "number";
    case EntityColumnKind.Date:
      return "date";
    case EntityColumnKind.DateTime:
      return "datetime-local";
    case EntityColumnKind.Time:
      return "time";
    default:
      return "text";
  }
}

function resolveLabels(
  defaults: EntityQueryFilterBuilderLabels,
  input?: EntityQueryFilterBuilderLabelsInput
): EntityQueryFilterBuilderLabels {
  return {
    ...defaults,
    ...(input ?? {}),
    operators: {
      ...defaults.operators,
      ...(input?.operators ?? {})
    } as Record<ConditionOperator, string>
  };
}

function joinClassNames(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}
