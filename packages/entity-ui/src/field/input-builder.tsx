import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { getColumnKey, type ResolvedEntityColumnSchema } from "@titanic-entity/entity-core";
import { useUiField } from "@titanic-entity/entity-base";
import { Titanic, useEntityLookupOptions } from "@titanic-entity/entity-react";
import { DateInput, type DateInputProps } from "../dateInput";
import { DateTimeInput, type DateTimeInputProps } from "../dateTimeInput";
import { EntityJsonEditor, type EntityJsonEditorProps } from "../jsonEditor/json-editor";
import { LookupInput, type LookupInputMode, type LookupInputProps, type LookupInputValue } from "../lookupInput";
import { TimeInput, type TimeInputProps } from "../timeInput";
import type { EntityFieldProps } from "./field-props";
import { InputResolver } from "./input-resolver";

const CONTROL_CLASS_NAME = "titanic-field__control";
const LOOKUP_INPUT_PAGE_SIZE = 15;
const LOOKUP_INPUT_SEARCH_DELAY_MS = 1500;
const LOOKUP_INPUT_MIN_SEARCH_LENGTH = 3;

export interface InputBuilderProps {
  column: ResolvedEntityColumnSchema;
  fieldId: string;
  keyName: string;
  value: unknown;
  displayValue?: string;
  validationError?: string | null;
  readOnly: boolean;
  manualCommitDelayMs: number;
  onChange: NonNullable<EntityFieldProps["onChange"]>;
}

export function InputBuilder(props: InputBuilderProps) {
  const resolution = InputResolver.resolve(props.column);

  switch (resolution.inputKind) {
    case "text":
      return <DeferredTextAreaControl {...props} />;
    case "number":
      return <DeferredNumberControl {...props} />;
    case "boolean":
      return <BooleanControl {...props} />;
    case "date":
      return <DateControl {...props} />;
    case "dateTime":
      return <DateTimeControl {...props} />;
    case "time":
      return <TimeControl {...props} />;
    case "color":
      return <ColorControl {...props} />;
    case "lookup":
      return <LookupControl {...props} />;
    case "json":
      return <JsonControl {...props} />;
    default:
      return <DeferredStringControl {...props} />;
  }
}

function JsonControl({ column, fieldId, keyName, value, readOnly, onChange }: InputBuilderProps) {
  const JsonEditorComponent = useUiField<EntityJsonEditorProps>("EntityJsonEditor", EntityJsonEditor);

  return (
    <JsonEditorComponent
      id={fieldId}
      name={keyName}
      disabled={readOnly}
      required={column.required}
      value={value as string}
      onChange={(nextValue) => onChange(keyName, nextValue)}
      {...column.jsonEditor}
    />
  );
}

function DeferredStringControl({ column, fieldId, keyName, value, validationError, readOnly, manualCommitDelayMs, onChange }: InputBuilderProps) {
  const { draft, setDraft, commitNow, handleBlur, handleFocus } = useDeferredManualCommit({
    value: toStringDraft(value),
    delayMs: manualCommitDelayMs,
    onCommit: (nextValue) => onChange(keyName, nextValue)
  });

  return (
    <input
      {...getCommonControlProps(column, fieldId, readOnly, validationError)}
      type="text"
      maxLength={column.maxLength}
      value={draft}
      onBlur={handleBlur}
      onChange={(event) => setDraft(event.target.value)}
      onFocus={handleFocus}
      onKeyDown={(event) => commitOnEnter(event, commitNow)}
    />
  );
}

function DeferredTextAreaControl({ column, fieldId, keyName, value, validationError, readOnly, manualCommitDelayMs, onChange }: InputBuilderProps) {
  const { draft, setDraft, handleBlur, handleFocus } = useDeferredManualCommit({
    value: toStringDraft(value),
    delayMs: manualCommitDelayMs,
    onCommit: (nextValue) => onChange(keyName, nextValue)
  });

  return (
    <textarea
      {...getCommonControlProps(column, fieldId, readOnly, validationError)}
      maxLength={column.maxLength}
      value={draft}
      onBlur={handleBlur}
      onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setDraft(event.target.value)}
      onFocus={handleFocus}
    />
  );
}

function DeferredNumberControl({ column, fieldId, keyName, value, validationError, readOnly, manualCommitDelayMs, onChange }: InputBuilderProps) {
  const { draft, setDraft, commitNow, handleBlur, handleFocus } = useDeferredManualCommit({
    value: toNumberDraft(value),
    delayMs: manualCommitDelayMs,
    onCommit: (nextValue) => onChange(keyName, parseNumberDraft(nextValue))
  });

  return (
    <input
      {...getCommonControlProps(column, fieldId, readOnly, validationError)}
      type="number"
      value={draft}
      onBlur={handleBlur}
      onChange={(event) => setDraft(event.target.value)}
      onFocus={handleFocus}
      onKeyDown={(event) => commitOnEnter(event, commitNow)}
    />
  );
}

function BooleanControl({ fieldId, keyName, value, validationError, readOnly, onChange }: InputBuilderProps) {
  return (
    <input
      {...getValidationControlProps(fieldId, validationError)}
      id={fieldId}
      name={keyName}
      disabled={readOnly}
      type="checkbox"
      className="titanic-field__checkbox"
      checked={Boolean(value)}
      onChange={(event) => onChange(keyName, event.target.checked)}
    />
  );
}

function DateControl({ column, fieldId, keyName, value, validationError, readOnly, onChange }: InputBuilderProps) {
  const DateInputComponent = useUiField<DateInputProps>("DateInput", DateInput);

  return (
    <DateInputComponent
      {...getCommonControlProps(column, fieldId, readOnly, validationError)}
      renderFrame={false}
      validationError={validationError}
      value={formatDate(value)}
      onChange={(nextValue) => onChange(keyName, nextValue)}
    />
  );
}

function DateTimeControl({ column, fieldId, keyName, value, validationError, readOnly, onChange }: InputBuilderProps) {
  const DateTimeInputComponent = useUiField<DateTimeInputProps>("DateTimeInput", DateTimeInput);

  return (
    <DateTimeInputComponent
      {...getCommonControlProps(column, fieldId, readOnly, validationError)}
      renderFrame={false}
      validationError={validationError}
      value={formatDateTime(value)}
      onChange={(nextValue) => onChange(keyName, nextValue)}
    />
  );
}

function TimeControl({ column, fieldId, keyName, value, validationError, readOnly, onChange }: InputBuilderProps) {
  const TimeInputComponent = useUiField<TimeInputProps>("TimeInput", TimeInput);

  return (
    <TimeInputComponent
      {...getCommonControlProps(column, fieldId, readOnly, validationError)}
      renderFrame={false}
      validationError={validationError}
      value={formatTime(value)}
      onChange={(nextValue) => onChange(keyName, formatTimeChangeValue(nextValue))}
    />
  );
}

function ColorControl({ column, fieldId, keyName, value, validationError, readOnly, onChange }: InputBuilderProps) {
  return (
    <input
      {...getCommonControlProps(column, fieldId, readOnly, validationError)}
      type="color"
      value={String(value || "#1f6feb")}
      onChange={(event) => onChange(keyName, event.target.value)}
    />
  );
}

function LookupControl({ column, displayValue: loadedDisplayValue, fieldId, keyName, value, validationError, readOnly, onChange }: InputBuilderProps) {
  const LookupInputComponent = useUiField<LookupInputProps>("LookupInput", LookupInput);
  const [searchText, setSearchText] = useState("");
  const pageSize = getLookupPageSize(column);
  const lookupOptions = useEntityLookupOptions(column, { enabled: false, rowCount: pageSize, searchText });
  const lookupValue = toLookupInputValue(value);
  const normalizedValue = normalizeLookupInputValue(lookupValue);
  const selectedOption = lookupOptions.options.find((option) => String(option.value) === normalizedValue);
  const resolvedDisplayValue = selectedOption?.displayValue ?? getReferenceDisplayValue(value) ?? loadedDisplayValue;
  const displayValue = resolvedDisplayValue ?? "";
  const loadedLookupValueRef = useRef<string | null>(null);

  useEffect(() => {
    if (!normalizedValue || lookupValue == null) {
      loadedLookupValueRef.current = null;
      return;
    }

    if (resolvedDisplayValue !== undefined || selectedOption || loadedLookupValueRef.current === normalizedValue) {
      return;
    }

    loadedLookupValueRef.current = normalizedValue;
    void lookupOptions.reload({ rowCount: 1, searchText: "", skip: 0, value: lookupValue });
  }, [lookupOptions.reload, lookupValue, normalizedValue, resolvedDisplayValue, selectedOption]);

  const reloadCurrent = useCallback(() => {
    void lookupOptions.reload({ rowCount: pageSize, searchText, skip: 0 });
  }, [lookupOptions.reload, pageSize, searchText]);

  const handleSearchChange = useCallback(async (nextSearchText: string) => {
    setSearchText(nextSearchText);
    await lookupOptions.reload({ rowCount: pageSize, searchText: nextSearchText, skip: 0 });
  }, [lookupOptions.reload, pageSize]);

  const handleLoadMore = useCallback(() => {
    if (lookupOptions.loading || lookupOptions.loadingMore || !lookupOptions.hasMore) {
      return;
    }

    void lookupOptions.loadMore();
  }, [lookupOptions.hasMore, lookupOptions.loadMore, lookupOptions.loading, lookupOptions.loadingMore]);

  const handleChange = useCallback((nextValue: LookupInputValue) => {
    onChange(keyName, nextValue ?? null);
  }, [keyName, onChange]);

  return (
    <LookupInputComponent
      {...getLookupControlProps(column, fieldId, readOnly, validationError)}
      className={CONTROL_CLASS_NAME}
      renderFrame={false}
      validationError={validationError}
      mode={resolveLookupInputMode(column)}
      value={lookupValue}
      displayValue={displayValue}
      items={lookupOptions.options}
      loading={lookupOptions.loading}
      loadingMore={lookupOptions.loadingMore}
      hasMore={lookupOptions.hasMore}
      error={lookupOptions.error}
      searchDelayMs={getLookupSearchDelayMs(column)}
      minSearchLength={getLookupMinSearchLength(column)}
      emptyText={column.placeholder ?? "Не выбрано"}
      onOpen={reloadCurrent}
      onSearchChange={handleSearchChange}
      onLoadMore={handleLoadMore}
      onChange={handleChange}
    />
  );
}

function resolveLookupInputMode(column: ResolvedEntityColumnSchema): LookupInputMode {
  return column.lookupMode ?? column.lookup?.mode ?? "enum";
}

function getLookupPageSize(column: ResolvedEntityColumnSchema): number {
  const rowCount = column.lookup?.rowCount;
  return typeof rowCount === "number" && Number.isFinite(rowCount) && rowCount > 0 ? Math.floor(rowCount) : LOOKUP_INPUT_PAGE_SIZE;
}

function getLookupSearchDelayMs(column: ResolvedEntityColumnSchema): number {
  return normalizeLookupNonNegativeNumber(column.lookup?.searchDelayMs, LOOKUP_INPUT_SEARCH_DELAY_MS);
}

function getLookupMinSearchLength(column: ResolvedEntityColumnSchema): number {
  return normalizeLookupNonNegativeNumber(column.lookup?.minSearchLength, LOOKUP_INPUT_MIN_SEARCH_LENGTH);
}

function normalizeLookupNonNegativeNumber(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return fallback;
  }

  return Math.floor(value);
}

function toLookupInputValue(value: unknown): LookupInputValue {
  if (value === null || value === undefined || typeof value === "string" || typeof value === "number") {
    return value ?? null;
  }

  if (typeof value === "object" && "value" in value) {
    const rawValue = (value as { value?: unknown }).value;
    return typeof rawValue === "string" || typeof rawValue === "number" ? rawValue : null;
  }

  return String(value);
}

function getReferenceDisplayValue(value: unknown): string | undefined {
  if (!value || typeof value !== "object" || !("displayValue" in value)) {
    return undefined;
  }

  const displayValue = (value as { displayValue?: unknown }).displayValue;
  return displayValue == null ? undefined : String(displayValue);
}

function normalizeLookupInputValue(value: LookupInputValue): string {
  return value == null ? "" : String(value);
}

interface DeferredManualCommitOptions<TDraft> {
  value: TDraft;
  delayMs: number;
  onCommit: (value: TDraft) => void;
}

function useDeferredManualCommit<TDraft>({ value, delayMs, onCommit }: DeferredManualCommitOptions<TDraft>) {
  const [draft, setDraftState] = useState(value);
  const committedRef = useRef(value);
  const draftRef = useRef(value);
  const focusedRef = useRef(false);
  const onCommitRef = useRef(onCommit);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current == null) {
      return;
    }

    clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const commitNow = useCallback(() => {
    clearTimer();

    const nextDraft = draftRef.current;
    if (Object.is(nextDraft, committedRef.current)) {
      return;
    }

    committedRef.current = nextDraft;
    onCommitRef.current(nextDraft);
  }, [clearTimer]);

  const scheduleCommit = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(commitNow, delayMs);
  }, [clearTimer, commitNow, delayMs]);

  const setDraft = useCallback((nextDraft: TDraft) => {
    draftRef.current = nextDraft;
    setDraftState(nextDraft);
    scheduleCommit();
  }, [scheduleCommit]);

  const handleFocus = useCallback(() => {
    focusedRef.current = true;
  }, []);

  const handleBlur = useCallback(() => {
    focusedRef.current = false;
    commitNow();
  }, [commitNow]);

  useEffect(() => {
    onCommitRef.current = onCommit;
  }, [onCommit]);

  useEffect(() => {
    committedRef.current = value;

    if (focusedRef.current) {
      return;
    }

    clearTimer();
    draftRef.current = value;
    setDraftState(value);
  }, [clearTimer, value]);

  useEffect(() => clearTimer, [clearTimer]);

  return {
    draft,
    setDraft,
    commitNow,
    handleBlur,
    handleFocus
  };
}

function getCommonControlProps(column: ResolvedEntityColumnSchema, fieldId: string, readOnly: boolean, validationError?: string | null) {
  return {
    id: fieldId,
    name: getColumnKey(column),
    disabled: readOnly,
    required: column.required,
    placeholder: column.placeholder,
    className: CONTROL_CLASS_NAME,
    ...getValidationControlProps(fieldId, validationError)
  };
}

function getLookupControlProps(column: ResolvedEntityColumnSchema, fieldId: string, readOnly: boolean, validationError?: string | null) {
  return {
    id: fieldId,
    name: getColumnKey(column),
    disabled: readOnly,
    required: column.required,
    placeholder: column.placeholder,
    ...getValidationControlProps(fieldId, validationError)
  };
}

function getValidationControlProps(fieldId: string, validationError?: string | null) {
  return validationError
    ? {
        "aria-errormessage": `${fieldId}-error`,
        "aria-invalid": true
      }
    : {};
}

function toStringDraft(value: unknown): string {
  return value == null ? "" : String(value);
}

function toNumberDraft(value: unknown): string {
  return value == null || value === "" ? "" : String(value);
}

function parseNumberDraft(value: string): number | null {
  const normalizedValue = value.trim();
  if (!normalizedValue) {
    return null;
  }

  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function commitOnEnter(event: KeyboardEvent<HTMLInputElement>, commitNow: () => void): void {
  if (event.key === "Enter" && !event.nativeEvent.isComposing) {
    commitNow();
  }
}

function formatDate(value: unknown): string {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 10);
}

function formatDateTime(value: unknown): string {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 16);
}

export function formatTime(value: unknown): string {
  if (value == null || value === "") {
    return "";
  }

  const normalizedValue = String(value).trim();

  if (!normalizedValue) {
    return "";
  }

  const directTime = /^(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/.exec(normalizedValue);
  const embeddedTime = /(?:^|[T\s])(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?(?:$|[Z+\-\s])/.exec(normalizedValue);
  const timeParts = directTime ?? embeddedTime;

  if (!timeParts) {
    return normalizedValue;
  }

  const hour = Number(timeParts[1]);
  const minute = Number(timeParts[2]);

  if (!isValidTimePart(hour, 23) || !isValidTimePart(minute, 59)) {
    return normalizedValue;
  }

  return `${padTimePart(hour)}:${padTimePart(minute)}`;
}

export function formatTimeChangeValue(value: string | null | undefined): string {
  return value ?? "";
}

function isValidTimePart(value: number, max: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= max;
}

function padTimePart(value: number): string {
  return String(value).padStart(2, "0");
}

Titanic.define<InputBuilderProps>("Titanic.UI.InputBuilder", InputBuilder);
