import { Titanic } from "@titanic-entity/entity-react";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Button } from "../button";
import { InputFieldFrame } from "../inputFieldFrame";
import { getDateInputLabels, getDateInputLocale } from "./date-input-lcz";
import type { DateInputProps } from "./index";

interface CalendarDay {
  active: boolean;
  date: Date;
  inCurrentMonth: boolean;
  isoDate: string;
  label: string;
  title: string;
  today: boolean;
}

interface MonthOption {
  label: string;
  month: number;
}

type CalendarMode = "day" | "month" | "year";

export const DateInput = Titanic.define<DateInputProps>("Titanic.UI.DateInput", function DateInput({
  id,
  name,
  value,
  disabled = false,
  required = false,
  className = "",
  locale,
  labels,
  placeholder,
  renderFrame = true,
  rootClassName = "",
  editable = true,
  title,
  validationError,
  visible = true,
  onChange
}: DateInputProps) {
  const fallbackId = useId();
  const resolvedId = id ?? fallbackId;
  const resolvedName = name ?? resolvedId;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => new Date());
  const [calendarMode, setCalendarMode] = useState<CalendarMode>("day");
  const [inputDraft, setInputDraft] = useState("");
  const [manualDraftActive, setManualDraftActive] = useState(false);
  const normalizedValue = normalizeDateValue(value);
  const selectedDate = parseIsoDate(normalizedValue);
  const currentLocale = getDateInputLocale(locale);
  const resolvedLabels = { ...getDateInputLabels(currentLocale), ...(labels ?? {}) };
  const displayValue = formatDisplayDate(selectedDate, currentLocale);
  const parsedDraftDate = parseManualDate(inputDraft, currentLocale);
  const draftInvalid = manualDraftActive && inputDraft.trim().length > 0 && !parsedDraftDate;
  const readOnly = disabled || !editable;
  const invalid = Boolean(validationError || draftInvalid);
  const errorId = validationError ? `${resolvedId}-error` : undefined;
  const titleId = title ? `${resolvedId}-label` : undefined;
  const todayIsoDate = formatIsoDate(new Date());
  const calendarDays = useMemo(
    () => createCalendarDays(viewDate, normalizedValue, todayIsoDate, currentLocale),
    [currentLocale, normalizedValue, todayIsoDate, viewDate]
  );
  const monthOptions = useMemo(() => createMonthOptions(viewDate, currentLocale), [currentLocale, viewDate]);
  const yearRangeStart = getYearRangeStart(viewDate);
  const yearOptions = useMemo(() => createYearOptions(yearRangeStart), [yearRangeStart]);
  const weekdayLabels = useMemo(
    () => createWeekdayLabels(currentLocale, resolvedLabels.weekdays),
    [currentLocale, resolvedLabels.weekdays]
  );

  const finishManualInput = () => {
    if (!manualDraftActive) {
      return;
    }

    const draft = inputDraft.trim();

    if (!draft) {
      onChange(null);
      setInputDraft("");
      setManualDraftActive(false);
      setOpen(false);
      return;
    }

    const parsedDate = parseManualDate(draft, currentLocale);

    if (parsedDate) {
      const isoDate = formatIsoDate(parsedDate);
      onChange(isoDate);
      setInputDraft(formatDisplayDate(parsedDate, currentLocale));
      setViewDate(parsedDate);
    } else {
      setInputDraft(displayValue);
    }

    setManualDraftActive(false);
  };

  useEffect(() => {
    if (!manualDraftActive) {
      setInputDraft(displayValue);
    }
  }, [displayValue, manualDraftActive]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setViewDate(selectedDate ?? new Date());
    setCalendarMode("day");
  }, [normalizedValue, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        finishManualInput();
        setOpen(false);
      }
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        finishManualInput();
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, inputDraft, manualDraftActive, displayValue, currentLocale]);

  if (!visible) {
    return null;
  }

  const changeVisiblePeriod = (offset: number) => {
    const nextDate = new Date(viewDate);

    if (calendarMode === "year") {
      nextDate.setFullYear(nextDate.getFullYear() + offset * 16);
    } else if (calendarMode === "month") {
      nextDate.setFullYear(nextDate.getFullYear() + offset);
    } else {
      nextDate.setMonth(nextDate.getMonth() + offset);
    }

    setViewDate(nextDate);
  };

  const selectVisibleMonth = (month: number) => {
    const nextDate = new Date(viewDate);
    nextDate.setMonth(month);
    setViewDate(nextDate);
    setCalendarMode("day");
  };

  const selectVisibleYear = (year: number) => {
    const nextDate = new Date(viewDate);
    nextDate.setFullYear(year);
    setViewDate(nextDate);
    setCalendarMode("month");
  };

  const selectDate = (isoDate: string) => {
    const nextDate = parseIsoDate(isoDate);
    onChange(isoDate);
    setInputDraft(formatDisplayDate(nextDate, currentLocale));
    setManualDraftActive(false);
    setOpen(false);
  };

  const clearDate = () => {
    onChange(null);
    setInputDraft("");
    setManualDraftActive(false);
    setOpen(false);
  };

  const toggleOpen = () => {
    if (readOnly) {
      return;
    }

    if (open) {
      finishManualInput();
    }

    setOpen(!open);
  };

  const control = (
    <div className={joinClassNames("titanic-date", rootClassName)} ref={rootRef}>
      <input
        disabled={disabled}
        hidden
        id={`${resolvedId}-native`}
        name={resolvedName}
        readOnly
        type="date"
        value={normalizedValue}
      />
      <div
        aria-invalid={invalid || undefined}
        className={joinClassNames(
          "titanic-date__control",
          !hasClassName(className, "titanic-datetime-input__segment-control") && "titanic-field__control",
          className
        )}
      >
        <input
          aria-describedby={errorId}
          aria-invalid={invalid || undefined}
          aria-label={resolvedLabels.selectedDate}
          aria-labelledby={titleId}
          className={joinClassNames("titanic-date__input", invalid && "titanic-date__input--invalid")}
          disabled={disabled}
          id={resolvedId}
          placeholder={placeholder ?? resolvedLabels.placeholder}
          readOnly={!editable}
          type="text"
          value={inputDraft}
          onBlur={() => {
            window.setTimeout(() => {
              if (!open) {
                finishManualInput();
              }
            }, 0);
          }}
          onChange={(event) => {
            setManualDraftActive(true);
            setInputDraft(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (!readOnly) {
              setOpen(true);
            }
          }}
          onKeyDown={(event: ReactKeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") {
              finishManualInput();
              setOpen(false);
            }
          }}
        />
        <Button
          aria-expanded={open}
          aria-label={resolvedLabels.selectedDate}
          className="titanic-date__trigger"
          disabled={readOnly}
          type="button"
          variant="ghost"
          onClick={toggleOpen}
        >
          <span aria-hidden>Calendar</span>
        </Button>
      </div>

      {open ? (
        <div className="titanic-date-time-popover titanic-date__popover" role="dialog">
          <div className="titanic-date__header">
            <Button
              aria-label={calendarMode === "year"
                ? `${yearRangeStart - 16}-${yearRangeStart - 1}`
                : resolvedLabels.previousMonth}
              className="titanic-date__nav-button"
              type="button"
              variant="ghost"
              onClick={() => changeVisiblePeriod(-1)}
            >
              <span aria-hidden>{"<"}</span>
            </Button>
            <div className="titanic-date__header-title">
              <Button
                className="titanic-date__mode-button"
                type="button"
                variant="ghost"
                onClick={() => setCalendarMode("month")}
              >
                {capitalizeFirstLetter(viewDate.toLocaleDateString(currentLocale, { month: "long" }))}
              </Button>
              <Button
                className="titanic-date__mode-button"
                type="button"
                variant="ghost"
                onClick={() => setCalendarMode("year")}
              >
                {viewDate.getFullYear()}
              </Button>
            </div>
            <Button
              aria-label={calendarMode === "year"
                ? `${yearRangeStart + 16}-${yearRangeStart + 31}`
                : resolvedLabels.nextMonth}
              className="titanic-date__nav-button"
              type="button"
              variant="ghost"
              onClick={() => changeVisiblePeriod(1)}
            >
              <span aria-hidden>{">"}</span>
            </Button>
          </div>

          {calendarMode === "day" ? (
            <div className="titanic-date__calendar" role="grid">
              <div className="titanic-date__weekdays" role="row">
                {weekdayLabels.map((weekday, index) => (
                  <span className="titanic-date__weekday" key={`${weekday}-${index}`} role="columnheader">
                    {weekday}
                  </span>
                ))}
              </div>
              <div className="titanic-date__days">
                {calendarDays.map((day) => (
                  <button
                    aria-pressed={day.active}
                    className={joinClassNames(
                      "titanic-date__day",
                      !day.inCurrentMonth && "titanic-date__day--muted",
                      day.today && "titanic-date__day--today",
                      day.active && "titanic-date__day--active"
                    )}
                    key={day.isoDate}
                    title={day.title}
                    type="button"
                    onClick={() => selectDate(day.isoDate)}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {calendarMode === "month" ? (
            <div className="titanic-date__month-grid">
              {monthOptions.map((option) => (
                <button
                  className={joinClassNames(
                    "titanic-date__month-option",
                    option.month === viewDate.getMonth() && "titanic-date__month-option--active"
                  )}
                  key={option.month}
                  type="button"
                  onClick={() => selectVisibleMonth(option.month)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}

          {calendarMode === "year" ? (
            <div className="titanic-date__year-grid">
              {yearOptions.map((year) => (
                <button
                  className={joinClassNames(
                    "titanic-date__year-option",
                    year === viewDate.getFullYear() && "titanic-date__year-option--active"
                  )}
                  key={year}
                  type="button"
                  onClick={() => selectVisibleYear(year)}
                >
                  {year}
                </button>
              ))}
            </div>
          ) : null}

          <div className="titanic-date__actions">
            <Button
              className="titanic-date__action"
              type="button"
              variant="ghost"
              onClick={() => selectDate(formatIsoDate(new Date()))}
            >
              {resolvedLabels.today}
            </Button>
            <Button
              className="titanic-date__action"
              disabled={!normalizedValue}
              type="button"
              variant="ghost"
              onClick={clearDate}
            >
              {resolvedLabels.clear}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );

  return renderFrame ? (
    <InputFieldFrame
      control={control}
      errorId={errorId}
      htmlFor={resolvedId}
      required={required}
      title={title}
      validationError={validationError}
    />
  ) : control;
});

function createCalendarDays(viewDate: Date, normalizedValue: string, todayIsoDate: string, locale: string): CalendarDay[] {
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    const isoDate = formatIsoDate(date);

    return {
      active: isoDate === normalizedValue,
      date,
      inCurrentMonth: date.getMonth() === viewDate.getMonth(),
      isoDate,
      label: String(date.getDate()),
      title: formatFullDate(date, locale),
      today: isoDate === todayIsoDate
    };
  });
}

function createWeekdayLabels(locale: string, labels?: readonly string[]): readonly string[] {
  if (labels?.length) {
    return labels;
  }

  const baseDate = new Date(2021, 5, 7);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + index);
    return capitalizeFirstLetter(date.toLocaleDateString(locale, { weekday: "short" }));
  });
}

function createMonthOptions(viewDate: Date, locale: string): MonthOption[] {
  return Array.from({ length: 12 }, (_, month) => {
    const date = new Date(viewDate.getFullYear(), month, 1);
    return { month, label: capitalizeFirstLetter(date.toLocaleDateString(locale, { month: "short" })) };
  });
}

function createYearOptions(yearRangeStart: number): number[] {
  return Array.from({ length: 16 }, (_, index) => yearRangeStart + index);
}

function getYearRangeStart(viewDate: Date): number {
  return Math.floor(viewDate.getFullYear() / 16) * 16;
}

function normalizeDateValue(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  const parsedDate = parseIsoDate(value);
  return parsedDate ? formatIsoDate(parsedDate) : "";
}

function parseManualDate(value: string, locale: string): Date | null {
  const draft = value.trim();

  if (!draft) {
    return null;
  }

  const isoMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(draft);
  if (isoMatch) {
    return createValidDate(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
  }

  const dotMatch = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(draft);
  if (dotMatch) {
    return createValidDate(Number(dotMatch[3]), Number(dotMatch[2]) - 1, Number(dotMatch[1]));
  }

  const slashMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(draft);
  if (slashMatch) {
    const first = Number(slashMatch[1]);
    const second = Number(slashMatch[2]);
    const year = Number(slashMatch[3]);
    const dayFirst = locale.toLowerCase().startsWith("ru") || first > 12;
    return createValidDate(year, dayFirst ? second - 1 : first - 1, dayFirst ? first : second);
  }

  const parsedTimestamp = Date.parse(draft);
  if (Number.isNaN(parsedTimestamp)) {
    return null;
  }

  const date = new Date(parsedTimestamp);
  return createValidDate(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseIsoDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? createValidDate(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
}

function createValidDate(year: number, month: number, day: number): Date | null {
  const date = new Date(year, month, day);
  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day ? date : null;
}

function formatDisplayDate(date: Date | null, locale: string): string {
  return date ? date.toLocaleDateString(locale) : "";
}

function formatIsoDate(date: Date): string {
  return [date.getFullYear(), padDatePart(date.getMonth() + 1), padDatePart(date.getDate())].join("-");
}

function formatFullDate(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}

function padDatePart(value: number): string {
  return String(value).padStart(2, "0");
}

function capitalizeFirstLetter(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function hasClassName(className: string | undefined, target: string): boolean {
  return String(className ?? "").split(/\s+/).filter(Boolean).includes(target);
}

function joinClassNames(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}
