import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties, KeyboardEvent } from "react";
import { EntityFieldKind, getColumnKey, useEntityLookupOptions } from "@titanic/entity-core";
import { useUiField } from "@titanic/entity-base";
import { DateInput, type DateInputProps } from "../inputs/DateInput";
import { EntityJsonEditor, type EntityJsonEditorProps } from "../json/EntityJsonEditor";
import type { EntityFieldProps } from "./models/EntityFieldProps";

export type { EntityFieldProps } from "./models/EntityFieldProps";

const DEFAULT_MANUAL_COMMIT_DELAY_MS = 700;
const CONTROL_CLASS_NAME = "titanic-field__control";

/**
 * Поле формы по схеме. Компонент держит стратегию фиксации рядом с
 * типом контрола: выборочные контролы фиксируются сразу, ручные поля фиксируются
 * при blur или после короткой паузы бездействия.
 */
export function EntityField({
  column,
  values,
  displayValues,
  onChange,
  disabled = false,
  className = "",
  manualCommitDelayMs = DEFAULT_MANUAL_COMMIT_DELAY_MS
}: EntityFieldProps) {
  const resolvedColumn = column;

  if (resolvedColumn.hidden) {
    return null;
  }

  const key = getColumnKey(resolvedColumn);
  const kind = resolvedColumn.kind ?? EntityFieldKind.String;
  const value = getFieldValue(values, key, resolvedColumn.defaultValue);
  const displayValue = displayValues?.[key];
  const fieldId = `titanic-field-${key.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  const readOnly = disabled || Boolean(resolvedColumn.readOnly);

  return (
    <div className={`titanic-field titanic-field_${kind} ${className}`} style={getGridSpanStyle(resolvedColumn.gridSpan ?? 12)}>
      <label className="titanic-field__label" htmlFor={fieldId}>
        {resolvedColumn.label ?? resolvedColumn.path}
        {resolvedColumn.required ? <span className="titanic-field__required">*</span> : null}
      </label>
      <EntityFieldControl
        column={resolvedColumn}
        fieldId={fieldId}
        keyName={key}
        value={value}
        displayValue={displayValue}
        readOnly={readOnly}
        manualCommitDelayMs={manualCommitDelayMs}
        onChange={onChange}
      />
    </div>
  );
}

function getGridSpanStyle(gridSpan: number): CSSProperties {
  return {
    "--titanic-grid-span": gridSpan
  } as CSSProperties;
}

interface EntityFieldControlProps {
  column: EntityFieldProps["column"];
  fieldId: string;
  keyName: string;
  value: unknown;
  displayValue?: string;
  readOnly: boolean;
  manualCommitDelayMs: number;
  onChange: EntityFieldProps["onChange"];
}

function EntityFieldControl(props: EntityFieldControlProps) {
  const kind = props.column.kind ?? EntityFieldKind.String;

  switch (kind) {
    case EntityFieldKind.Text:
      return <DeferredTextAreaControl {...props} />;
    case EntityFieldKind.Number:
      return <DeferredNumberControl {...props} />;
    case EntityFieldKind.Boolean:
      return <BooleanControl {...props} />;
    case EntityFieldKind.Date:
      return <DateControl {...props} />;
    case EntityFieldKind.DateTime:
      return <DateTimeControl {...props} />;
    case EntityFieldKind.Color:
      return <ColorControl {...props} />;
    case EntityFieldKind.Lookup:
      return <LookupControl {...props} />;
    case EntityFieldKind.Json:
      return <JsonControl {...props} />;
    default:
      return <DeferredStringControl {...props} />;
  }
}

function JsonControl({ column, fieldId, keyName, value, readOnly, onChange }: EntityFieldControlProps) {
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

function DeferredStringControl({ column, fieldId, keyName, value, readOnly, manualCommitDelayMs, onChange }: EntityFieldControlProps) {
  const { draft, setDraft, commitNow, handleBlur, handleFocus } = useDeferredManualCommit({
    value: toStringDraft(value),
    delayMs: manualCommitDelayMs,
    onCommit: (nextValue) => onChange(keyName, nextValue)
  });

  return (
    <input
      {...getCommonControlProps(column, fieldId, readOnly)}
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

function DeferredTextAreaControl({ column, fieldId, keyName, value, readOnly, manualCommitDelayMs, onChange }: EntityFieldControlProps) {
  const { draft, setDraft, handleBlur, handleFocus } = useDeferredManualCommit({
    value: toStringDraft(value),
    delayMs: manualCommitDelayMs,
    onCommit: (nextValue) => onChange(keyName, nextValue)
  });

  return (
    <textarea
      {...getCommonControlProps(column, fieldId, readOnly)}
      maxLength={column.maxLength}
      value={draft}
      onBlur={handleBlur}
      onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setDraft(event.target.value)}
      onFocus={handleFocus}
    />
  );
}

function DeferredNumberControl({ column, fieldId, keyName, value, readOnly, manualCommitDelayMs, onChange }: EntityFieldControlProps) {
  const { draft, setDraft, commitNow, handleBlur, handleFocus } = useDeferredManualCommit({
    value: toNumberDraft(value),
    delayMs: manualCommitDelayMs,
    onCommit: (nextValue) => onChange(keyName, parseNumberDraft(nextValue))
  });

  return (
    <input
      {...getCommonControlProps(column, fieldId, readOnly)}
      type="number"
      value={draft}
      onBlur={handleBlur}
      onChange={(event) => setDraft(event.target.value)}
      onFocus={handleFocus}
      onKeyDown={(event) => commitOnEnter(event, commitNow)}
    />
  );
}

function BooleanControl({ fieldId, keyName, value, readOnly, onChange }: EntityFieldControlProps) {
  return (
    <input
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

function DateControl({ column, fieldId, keyName, value, readOnly, onChange }: EntityFieldControlProps) {
  const DateInputComponent = useUiField<DateInputProps>("DateInput", DateInput);

  return (
    <DateInputComponent
      {...getCommonControlProps(column, fieldId, readOnly)}
      value={formatDate(value)}
      onChange={(nextValue) => onChange(keyName, nextValue)}
    />
  );
}

function DateTimeControl({ fieldId, keyName, value, readOnly, onChange }: EntityFieldControlProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const dateValue = formatDate(value);
  const timeValue = formatTime(value);

  useEffect(() => {
    if (!open) {
      return;
    }

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer, true);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const commitDateTime = (nextDate: string, nextTime: string) => {
    if (!nextDate) {
      onChange(keyName, null);
      return;
    }

    onChange(keyName, `${nextDate}T${nextTime || "00:00"}`);
  };

  const handleDateChange = (nextDate: string) => {
    commitDateTime(nextDate, timeValue || getCurrentTime());
  };

  const handleTimeChange = (nextTime: string) => {
    commitDateTime(dateValue || getCurrentDate(), nextTime);
  };

  const handleNow = () => {
    onChange(keyName, getCurrentDateTime());
    setOpen(false);
  };

  const handleClear = () => {
    onChange(keyName, null);
    setOpen(false);
  };

  return (
    <div className="titanic-datetime" ref={wrapperRef}>
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        className="titanic-field__control titanic-datetime__button"
        disabled={readOnly}
        id={fieldId}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className={dateValue ? "titanic-datetime__value" : "titanic-datetime__placeholder"}>
          {dateValue ? formatDateTimeDisplay(dateValue, timeValue) : "Выберите дату и время"}
        </span>
        <span className="titanic-datetime__icon" aria-hidden="true">▾</span>
      </button>

      {open ? (
        <div className="titanic-datetime__popover" role="dialog" aria-label="Выбор даты и времени">
          <div className="titanic-datetime__header">
            <strong>Дата и время</strong>
            <button type="button" onClick={() => setOpen(false)} aria-label="Закрыть">×</button>
          </div>

          <div className="titanic-datetime__grid">
            <label>
              <span>Дата</span>
              <input
                className="titanic-datetime__input"
                disabled={readOnly}
                id={`${fieldId}-date`}
                name={`${keyName}Date`}
                type="date"
                value={dateValue}
                onChange={(event) => handleDateChange(event.target.value)}
              />
            </label>
            <label>
              <span>Время</span>
              <input
                className="titanic-datetime__input"
                disabled={readOnly}
                id={`${fieldId}-time`}
                name={`${keyName}Time`}
                type="time"
                value={timeValue}
                onChange={(event) => handleTimeChange(event.target.value)}
              />
            </label>
          </div>

          <div className="titanic-datetime__actions">
            <button type="button" onClick={handleNow}>Сейчас</button>
            <button type="button" onClick={() => handleDateChange(getCurrentDate())}>Сегодня</button>
            <button type="button" onClick={handleClear}>Очистить</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ColorControl({ column, fieldId, keyName, value, readOnly, onChange }: EntityFieldControlProps) {
  return (
    <input
      {...getCommonControlProps(column, fieldId, readOnly)}
      type="color"
      value={String(value || "#1f6feb")}
      onChange={(event) => onChange(keyName, event.target.value)}
    />
  );
}

function LookupControl({ column, displayValue: loadedDisplayValue, fieldId, keyName, value, readOnly, onChange }: EntityFieldControlProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const lookupOptions = useEntityLookupOptions(column, { enabled: false });
  const { error, loading, options, reload } = lookupOptions;
  const normalizedValue = value == null ? "" : String(value);
  const selectedOption = options.find((option) => String(option.value) === normalizedValue);
  const displayValue = selectedOption?.displayValue ?? loadedDisplayValue ?? (normalizedValue ? normalizedValue : "");

  useEffect(() => {
    if (!open) {
      return;
    }

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer, true);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const openLookup = useCallback(() => {
    if (readOnly) {
      return;
    }

    setOpen(true);
    void reload();
  }, [readOnly, reload]);

  const toggleLookup = useCallback(() => {
    if (open) {
      setOpen(false);
      return;
    }

    openLookup();
  }, [open, openLookup]);

  const selectOption = useCallback((nextValue: string | number | null) => {
    onChange(keyName, nextValue);
    setOpen(false);
  }, [keyName, onChange]);

  return (
    <div className="titanic-lookup" ref={wrapperRef}>
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        className="titanic-field__control titanic-lookup__button"
        disabled={readOnly}
        id={fieldId}
        onClick={toggleLookup}
        type="button"
      >
        <span className={displayValue ? "titanic-lookup__value" : "titanic-lookup__placeholder"}>
          {displayValue || column.placeholder || "Не выбрано"}
        </span>
        <span className="titanic-lookup__icon" aria-hidden="true">▾</span>
      </button>

      {open ? (
        <div className="titanic-lookup__popover" role="listbox" aria-labelledby={fieldId}>
          {loading ? (
            <div className="titanic-lookup__status">Загрузка из Entity ORM API...</div>
          ) : null}
          {error ? (
            <div className="titanic-lookup__error">Не удалось загрузить значения</div>
          ) : null}
          <button
            className={`titanic-lookup__option titanic-lookup__option_clear${normalizedValue ? "" : " titanic-lookup__option_active"}`}
            onClick={() => selectOption(null)}
            role="option"
            aria-selected={!normalizedValue}
            type="button"
          >
            Не выбрано
          </button>
          {options.map((option) => {
            const optionValue = String(option.value);
            const active = optionValue === normalizedValue;

            return (
              <button
                className={`titanic-lookup__option${active ? " titanic-lookup__option_active" : ""}`}
                key={optionValue}
                onClick={() => selectOption(option.value)}
                role="option"
                aria-selected={active}
                type="button"
              >
                {option.displayValue}
              </button>
            );
          })}
          {!loading && options.length === 0 ? (
            <div className="titanic-lookup__status">Значения не найдены</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

interface DeferredManualCommitOptions<TDraft> {
  value: TDraft;
  delayMs: number;
  onCommit: (value: TDraft) => void;
}

/**
 * Ручные текстовые и числовые поля используют локальный черновик, чтобы не
 * переписывать состояние сущности на каждое нажатие. Blur фиксирует сразу, таймер
 * работает как отложенная автосинхронизация, если пользователь оставил поле в фокусе.
 */
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

    // Не перезаписываем черновик, пока пользователь редактирует этот же контрол.
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

function getCommonControlProps(column: EntityFieldProps["column"], fieldId: string, readOnly: boolean) {
  return {
    id: fieldId,
    name: getColumnKey(column),
    disabled: readOnly,
    required: column.required,
    placeholder: column.placeholder,
    className: CONTROL_CLASS_NAME
  };
}

function getFieldValue(values: EntityFieldProps["values"], key: string, defaultValue: unknown): unknown {
  return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : defaultValue ?? "";
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

function formatTime(value: unknown): string {
  return formatDateTime(value).slice(11, 16);
}

function formatDateTimeDisplay(date: string, time: string): string {
  const [year, month, day] = date.split("-");
  const displayDate = year && month && day ? `${day}.${month}.${year}` : date;
  return time ? `${displayDate}, ${time}` : displayDate;
}

function getCurrentDateTime(): string {
  const now = new Date();
  return `${getDatePart(now)}T${getTimePart(now)}`;
}

function getCurrentDate(): string {
  return getDatePart(new Date());
}

function getCurrentTime(): string {
  return getTimePart(new Date());
}

function getDatePart(value: Date): string {
  return [
    value.getFullYear(),
    padDateTimePart(value.getMonth() + 1),
    padDateTimePart(value.getDate())
  ].join("-");
}

function getTimePart(value: Date): string {
  return [
    padDateTimePart(value.getHours()),
    padDateTimePart(value.getMinutes())
  ].join(":");
}

function padDateTimePart(value: number): string {
  return String(value).padStart(2, "0");
}
