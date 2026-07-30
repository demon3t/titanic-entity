import {
  ConditionOperator,
  EntityColumnKind,
  EntityLogicalOperation
} from "@titanic-entity/entity-core";
import { Titanic, useEntityLookupOptions } from "@titanic-entity/entity-react";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Button } from "../button";
import { getEntityDataGridLabels } from "../dataGrid/data-grid-lcz";
import { ColumnSettingsFieldPickerSchema, type ColumnSettingsFieldPickerItem } from "../dataGridSettingsModalPage/schemas";
import { DateInput } from "../dateInput";
import { DateTimeInput } from "../dateTimeInput";
import { LookupInput, type LookupInputValue } from "../lookupInput";
import { NumberInput } from "../numberInput";
import { TimeInput } from "../timeInput";
import { getEntityQueryFilterBuilderLabels } from "./entity-query-filter-builder-lcz";
import type { EntityQueryFilterBuilderLabelsInput, EntityQueryFilterBuilderProps } from "./index";
import {
  applyEntityQueryFilterBuilderColumnToCondition,
  createEntityQueryFilterBuilderColumnOptions,
  createEntityQueryFilterBuilderColumnFromPickerItem,
  createEntityQueryFilterBuilderState,
  createEntityQueryFilterBuilderStructureColumnOptions,
  createEntityQueryFilterCollection,
  createEntityQueryFilterCondition,
  createEntityQueryFilterFieldPickerPathOptions,
  createEntityQueryFilterFieldPickerState,
  createEntityQueryFilterGroup,
  createEntityQueryUnsupportedFilters,
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
    structure,
    rootTableName,
    columnPickerLabels,
    maxRelationDepth = 5,
    labels,
    locale,
    disabled = false,
    className = "",
    onChange
  }: EntityQueryFilterBuilderProps) {
    const columnOptions = useMemo(
      () => structure && rootTableName
        ? createEntityQueryFilterBuilderStructureColumnOptions(
            structure,
            rootTableName,
            columnPickerLabels,
            maxRelationDepth
          )
        : createEntityQueryFilterBuilderColumnOptions(columns ?? schema ?? null),
      [columnPickerLabels, columns, maxRelationDepth, rootTableName, schema, structure]
    );
    const dataGridLabels = useMemo(() => getEntityDataGridLabels(locale), [locale]);
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
        state: nextState,
        unsupportedFilters: createEntityQueryUnsupportedFilters(nextState)
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

    return (
      <div className={joinClassNames("titanic-query-filter-builder", className)}>
        {!columnOptions.length ? (
          <div className="titanic-query-filter-builder__empty">{resolvedLabels.noFields}</div>
        ) : null}

        {columnOptions.length ? (
          <div className="titanic-query-filter-builder__group titanic-query-filter-builder__group_root">
            <div className="titanic-query-filter-builder__group-header">
              <FilterGroupIcon />
              <LogicalOperationSelect
                disabled={disabled}
                labels={resolvedLabels}
                value={state.logicalOperation}
                onChange={(logicalOperation) => commitState({ ...state, logicalOperation })}
              />
              <div className="titanic-query-filter-builder__group-actions">
                <FilterIconButton
                  disabled={disabled || !columnOptions.length}
                  icon="condition"
                  label={resolvedLabels.addCondition}
                  onClick={addCondition}
                />
                <FilterIconButton
                  disabled={disabled || !columnOptions.length}
                  icon="group"
                  label={resolvedLabels.addGroup}
                  onClick={addGroup}
                />
                <FilterIconButton
                  disabled={disabled || !state.items.length}
                  icon="clear"
                  label={resolvedLabels.clear}
                  onClick={() => commitState({ ...state, items: [] })}
                />
              </div>
            </div>
            <div className="titanic-query-filter-builder__items">
            {state.items.map((item) => (
              <FilterBuilderItem
                columns={columnOptions}
                columnPickerLabels={columnPickerLabels}
                dataGridLabels={dataGridLabels}
                disabled={disabled}
                item={item}
                key={item.id}
                labels={resolvedLabels}
                locale={locale}
                maxRelationDepth={maxRelationDepth}
                rootTableName={rootTableName}
                structure={structure}
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
          </div>
        ) : null}
      </div>
    );
  }
);

interface FilterBuilderItemProps {
  columns: readonly EntityQueryFilterBuilderColumnOption[];
  columnPickerLabels?: EntityQueryFilterBuilderProps["columnPickerLabels"];
  dataGridLabels: ReturnType<typeof getEntityDataGridLabels>;
  disabled: boolean;
  item: EntityQueryFilterBuilderItem;
  labels: EntityQueryFilterBuilderLabels;
  locale?: string;
  maxRelationDepth: number;
  rootTableName?: string | null;
  structure?: EntityQueryFilterBuilderProps["structure"];
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
  columnPickerLabels,
  dataGridLabels,
  disabled,
  item,
  labels,
  locale,
  maxRelationDepth,
  rootTableName,
  structure,
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
        <FilterGroupIcon />
        <LogicalOperationSelect
          disabled={disabled}
          labels={labels}
          value={item.logicalOperation}
          onChange={(logicalOperation) => onChange({ ...item, logicalOperation })}
        />
        <div className="titanic-query-filter-builder__group-actions">
          <FilterIconButton
            disabled={disabled}
            icon="condition"
            label={labels.addCondition}
            onClick={() => onAddCondition(item.id)}
          />
          <FilterIconButton
            disabled={disabled}
            icon="group"
            label={labels.addGroup}
            onClick={() => onAddGroup(item.id)}
          />
          <FilterToggleButton
            active={item.isNot === true}
            disabled={disabled}
            label={labels.not}
            text={labels.not}
            onClick={() => onChange({ ...item, isNot: item.isNot !== true })}
          />
          <FilterIconButton
            active={item.isEnabled === false}
            disabled={disabled}
            icon={item.isEnabled === false ? "disabled" : "enabled"}
            label={item.isEnabled === false ? labels.disabled : labels.enabled}
            onClick={() => onChange({ ...item, isEnabled: item.isEnabled === false })}
          />
          <FilterIconButton
            disabled={disabled}
            icon="remove"
            label={labels.remove}
            onClick={() => onRemove(item.id)}
          />
        </div>
      </div>
      <div className="titanic-query-filter-builder__items titanic-query-filter-builder__items_nested">
        {item.items.map((child) => (
          <FilterBuilderItem
            columns={columns}
            columnPickerLabels={columnPickerLabels}
            dataGridLabels={dataGridLabels}
            disabled={disabled}
            item={child}
            key={child.id}
            labels={labels}
            locale={locale}
            maxRelationDepth={maxRelationDepth}
            rootTableName={rootTableName}
            structure={structure}
            onAddCondition={onAddCondition}
            onAddGroup={onAddGroup}
            onChange={(nextItem) => onChange({ ...item, items: updateItem(item.items, nextItem) })}
            onRemove={(itemId) => onChange({ ...item, items: removeItem(item.items, itemId) })}
          />
        ))}
      </div>
    </div>
  );
}

function FilterBuilderCondition({
  columns,
  columnPickerLabels,
  dataGridLabels,
  disabled,
  item,
  labels,
  locale,
  maxRelationDepth,
  rootTableName,
  structure,
  onChange,
  onRemove
}: FilterBuilderItemProps & { item: EntityQueryFilterBuilderCondition }) {
  const [fieldPickerOpen, setFieldPickerOpen] = useState(false);
  const [fieldPickerTrail, setFieldPickerTrail] = useState<ColumnSettingsFieldPickerItem[]>([]);
  const [fieldPickerSearch, setFieldPickerSearch] = useState("");
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
      <div className="titanic-query-filter-builder__field">
        <span className="titanic-query-filter-builder__sr-only">{labels.field}</span>
        {structure && rootTableName ? (
          <>
            <Button
              className="titanic-query-filter-builder__field-button"
              disabled={disabled || !columns.length}
              type="button"
              variant="secondary"
              onClick={() => setFieldPickerOpen((current) => !current)}
            >
              {selectedColumn?.label ?? labels.openFieldPicker}
            </Button>
            {fieldPickerOpen ? (
              <FieldPickerPopover
                columnPickerLabels={columnPickerLabels}
                dataGridLabels={dataGridLabels}
                item={item}
                labels={labels}
                maxRelationDepth={maxRelationDepth}
                rootTableName={rootTableName}
                search={fieldPickerSearch}
                structure={structure}
                trail={fieldPickerTrail}
                onClose={() => setFieldPickerOpen(false)}
                onSearchChange={setFieldPickerSearch}
                onSelect={(column) => {
                  onChange(applyEntityQueryFilterBuilderColumnToCondition(item, column, labels));
                  setFieldPickerOpen(false);
                  setFieldPickerTrail([]);
                  setFieldPickerSearch("");
                }}
                onTrailChange={setFieldPickerTrail}
              />
            ) : null}
          </>
        ) : (
          <select
            disabled={disabled}
            value={selectedColumn?.path ?? ""}
            onChange={(event) => {
              const nextColumn = columns.find((column) => column.path === event.target.value) ?? columns[0];
              onChange(applyEntityQueryFilterBuilderColumnToCondition(item, nextColumn, labels));
            }}
          >
            {columns.map((column) => (
              <option key={`${column.key}:${column.path}`} value={column.path}>{column.label}</option>
            ))}
          </select>
        )}
      </div>
      <label className="titanic-query-filter-builder__operator">
        <span className="titanic-query-filter-builder__sr-only">{labels.operator}</span>
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
        locale={locale}
        operator={selectedOperator}
        value={item.value}
        onChange={(nextValue) => onChange({ ...item, comparisonType: selectedOperator, value: nextValue })}
      />
      <div className="titanic-query-filter-builder__condition-actions">
        <FilterToggleButton
          active={item.isNot === true}
          disabled={disabled}
          label={labels.not}
          text={labels.not}
          onClick={() => onChange({ ...item, isNot: item.isNot !== true })}
        />
        <FilterIconButton
          active={item.isEnabled === false}
          disabled={disabled}
          icon={item.isEnabled === false ? "disabled" : "enabled"}
          label={item.isEnabled === false ? labels.disabled : labels.enabled}
          onClick={() => onChange({ ...item, isEnabled: item.isEnabled === false })}
        />
        <FilterIconButton
          disabled={disabled}
          icon="remove"
          label={labels.remove}
          onClick={() => onRemove(item.id)}
        />
      </div>
    </div>
  );
}

interface FieldPickerPopoverProps {
  columnPickerLabels?: EntityQueryFilterBuilderProps["columnPickerLabels"];
  dataGridLabels: ReturnType<typeof getEntityDataGridLabels>;
  item: EntityQueryFilterBuilderCondition;
  labels: EntityQueryFilterBuilderLabels;
  maxRelationDepth: number;
  rootTableName: string;
  search: string;
  structure: NonNullable<EntityQueryFilterBuilderProps["structure"]>;
  trail: readonly ColumnSettingsFieldPickerItem[];
  onClose: () => void;
  onSearchChange: (value: string) => void;
  onSelect: (column: EntityQueryFilterBuilderColumnOption) => void;
  onTrailChange: (trail: ColumnSettingsFieldPickerItem[]) => void;
}

function FieldPickerPopover({
  columnPickerLabels,
  dataGridLabels,
  labels,
  maxRelationDepth,
  rootTableName,
  search,
  structure,
  trail,
  onClose,
  onSearchChange,
  onSelect,
  onTrailChange
}: FieldPickerPopoverProps) {
  const pickerState = createEntityQueryFilterFieldPickerState(
    structure,
    rootTableName,
    trail as any,
    search,
    columnPickerLabels
  );
  const pathOptions = createEntityQueryFilterFieldPickerPathOptions(
    structure,
    rootTableName,
    columnPickerLabels,
    maxRelationDepth
  );
  const pathItems = [
    { label: pickerState?.rootLabel ?? rootTableName, path: "" },
    ...trail.map((trailItem) => ({
      label: trailItem.label,
      path: trailItem.path
    }))
  ];
  const openReference = (field: ColumnSettingsFieldPickerItem) => {
    const relationItem = field as ColumnSettingsFieldPickerItem & {
      joinDirection?: string;
      tableName?: string;
    };
    const nextTableName = relationItem.tableName ?? field.referenceTableName;

    if (!nextTableName) {
      return;
    }

    onTrailChange([
      ...trail,
      {
        ...field,
        tableName: nextTableName
      } as ColumnSettingsFieldPickerItem
    ]);
    onSearchChange("");
  };

  return (
    <div className="titanic-query-filter-builder__field-picker">
      <div className="titanic-query-filter-builder__field-picker-head">
        <strong>{labels.openFieldPicker}</strong>
        <FilterIconButton disabled={false} icon="remove" label={labels.remove} onClick={onClose} />
      </div>
      <ColumnSettingsFieldPickerSchema
        availableColumns={[]}
        emptyText={dataGridLabels.noAvailableColumns}
        isFieldVisible={() => false}
        items={pickerState?.items ?? []}
        labels={dataGridLabels}
        pathItems={pathItems}
        pathOptions={pathOptions}
        searchValue={search}
        selectedPath={trail[trail.length - 1]?.path ?? ""}
        onAddAvailableColumn={() => undefined}
        onAddField={(field) => {
          onSelect(createEntityQueryFilterBuilderColumnFromPickerItem(
            structure,
            rootTableName,
            trail as any,
            field,
            columnPickerLabels
          ));
        }}
        onOpenReference={openReference}
        onPathChange={() => undefined}
        onPathItemClick={(index) => {
          onTrailChange(index <= 0 ? [] : trail.slice(0, index));
          onSearchChange("");
        }}
        onSearchChange={onSearchChange}
      />
    </div>
  );
}

interface FilterValueInputProps {
  column: EntityQueryFilterBuilderColumnOption | null;
  disabled: boolean;
  labels: EntityQueryFilterBuilderLabels;
  locale?: string;
  operator: ConditionOperator;
  value: unknown;
  onChange: (value: unknown) => void;
}

function FilterValueInput({ column, disabled, labels, locale, operator, value, onChange }: FilterValueInputProps) {
  const valueMode = getEntityQueryFilterOperatorValueMode(operator);

  if (valueMode === "none") {
    return <span className="titanic-query-filter-builder__value-placeholder" aria-hidden="true" />;
  }

  if (column?.kind === EntityColumnKind.Boolean && valueMode === "single") {
    return (
      <label className="titanic-query-filter-builder__value">
        <span className="titanic-query-filter-builder__sr-only">{labels.value}</span>
        <select disabled={disabled} value={value === true ? "true" : "false"} onChange={(event) => onChange(event.target.value === "true")}>
          <option value="true">{labels.booleanTrue}</option>
          <option value="false">{labels.booleanFalse}</option>
        </select>
      </label>
    );
  }

  const placeholder = valueMode === "multiple" ? labels.valueListPlaceholder : labels.valuePlaceholder;

  if (valueMode === "single") {
    switch (column?.kind) {
      case EntityColumnKind.Number:
        return (
          <div className="titanic-query-filter-builder__value">
            <span className="titanic-query-filter-builder__sr-only">{labels.value}</span>
            <NumberInput
              className="titanic-query-filter-builder__value-control"
              disabled={disabled}
              value={toNumberInputValue(value)}
              onChange={onChange}
            />
          </div>
        );
      case EntityColumnKind.Date:
        return (
          <div className="titanic-query-filter-builder__value">
            <span className="titanic-query-filter-builder__sr-only">{labels.value}</span>
            <DateInput
              className="titanic-query-filter-builder__value-control"
              disabled={disabled}
              locale={locale}
              placeholder={placeholder}
              renderFrame={false}
              value={toNullableString(value)}
              onChange={onChange}
            />
          </div>
        );
      case EntityColumnKind.DateTime:
        return (
          <div className="titanic-query-filter-builder__value">
            <span className="titanic-query-filter-builder__sr-only">{labels.value}</span>
            <DateTimeInput
              className="titanic-query-filter-builder__value-control"
              disabled={disabled}
              locale={locale}
              placeholder={placeholder}
              renderFrame={false}
              value={toNullableString(value)}
              onChange={onChange}
            />
          </div>
        );
      case EntityColumnKind.Time:
        return (
          <div className="titanic-query-filter-builder__value">
            <span className="titanic-query-filter-builder__sr-only">{labels.value}</span>
            <TimeInput
              className="titanic-query-filter-builder__value-control"
              disabled={disabled}
              locale={locale}
              placeholder={placeholder}
              renderFrame={false}
              value={toNullableString(value)}
              onChange={onChange}
            />
          </div>
        );
      case EntityColumnKind.Lookup:
        return (
          <FilterLookupValueInput
            column={column}
            disabled={disabled}
            labels={labels}
            locale={locale}
            value={value}
            onChange={onChange}
          />
        );
      default:
        break;
    }
  }

  return (
    <label className="titanic-query-filter-builder__value">
      <span className="titanic-query-filter-builder__sr-only">{labels.value}</span>
      <input
        disabled={disabled}
        placeholder={placeholder}
        type={getInputType(column?.kind)}
        value={formatEntityQueryFilterBuilderInputValue(value)}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange(parseEntityQueryFilterBuilderInputValue(event.target.value, operator, column));
        }}
      />
    </label>
  );
}

function FilterLookupValueInput({
  column,
  disabled,
  labels,
  locale,
  value,
  onChange
}: {
  column: EntityQueryFilterBuilderColumnOption;
  disabled: boolean;
  labels: EntityQueryFilterBuilderLabels;
  locale?: string;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const [searchText, setSearchText] = useState("");
  const lookup = useEntityLookupOptions(column.column, {
    enabled: !disabled && Boolean(column.column.lookup || column.column.options?.length),
    searchText
  });

  return (
    <div className="titanic-query-filter-builder__value">
      <span className="titanic-query-filter-builder__sr-only">{labels.value}</span>
      <LookupInput
        className="titanic-query-filter-builder__value-control"
        disabled={disabled}
        error={lookup.error}
        hasMore={lookup.hasMore}
        items={lookup.options}
        locale={locale}
        loading={lookup.loading}
        loadingMore={lookup.loadingMore}
        mode={column.column.lookup?.mode ?? column.column.lookupMode ?? "lookup"}
        renderFrame={false}
        value={toLookupInputValue(value)}
        onChange={(nextValue) => onChange(nextValue)}
        onLoadMore={() => {
          void lookup.loadMore();
        }}
        onOpen={(nextSearchText) => {
          setSearchText(nextSearchText);
          void lookup.reload({ searchText: nextSearchText, value: toLookupInputValue(value) });
        }}
        onSearchChange={(nextSearchText) => {
          setSearchText(nextSearchText);
        }}
      />
    </div>
  );
}

type FilterIconButtonKind = "condition" | "group" | "clear" | "remove" | "enabled" | "disabled";

function FilterIconButton({
  active = false,
  disabled,
  icon,
  label,
  onClick
}: {
  active?: boolean;
  disabled: boolean;
  icon: FilterIconButtonKind;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className={joinClassNames(
        "titanic-query-filter-builder__icon-button",
        `titanic-query-filter-builder__icon-button_${icon}`,
        active && "titanic-query-filter-builder__icon-button_active"
      )}
      disabled={disabled}
      title={label}
      type="button"
      onClick={onClick}
    >
      <span aria-hidden="true" className="titanic-query-filter-builder__icon-glyph" />
    </button>
  );
}

function FilterToggleButton({
  active,
  disabled,
  label,
  text,
  onClick
}: {
  active: boolean;
  disabled: boolean;
  label: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={joinClassNames(
        "titanic-query-filter-builder__icon-button",
        "titanic-query-filter-builder__icon-button_text",
        active && "titanic-query-filter-builder__icon-button_active"
      )}
      disabled={disabled}
      title={label}
      type="button"
      onClick={onClick}
    >
      <span aria-hidden="true">{text}</span>
      <span className="titanic-query-filter-builder__sr-only">{label}</span>
    </button>
  );
}

function FilterGroupIcon() {
  return (
    <span className="titanic-query-filter-builder__group-icon" aria-hidden="true">
      <span />
    </span>
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
  const nextValue = value === EntityLogicalOperation.And
    ? EntityLogicalOperation.Or
    : EntityLogicalOperation.And;

  return (
    <button
      className="titanic-query-filter-builder__logical"
      disabled={disabled}
      title={labels.toggleLogicalOperation}
      type="button"
      onClick={() => onChange(nextValue)}
    >
      {value === EntityLogicalOperation.And ? labels.and : labels.or}
    </button>
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

function toNullableString(value: unknown): string | null {
  return value == null || value === "" ? null : String(value);
}

function toNumberInputValue(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (value == null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toLookupInputValue(value: unknown): LookupInputValue {
  return typeof value === "string" || typeof value === "number" ? value : null;
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
