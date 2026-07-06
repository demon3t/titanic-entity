import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { entityCommonIcons, entityDateInputIcons } from "@titanic/entity-resources";
import { ResourceSvgIcon } from "../icons/ResourceSvgIcon";

export interface DateInputLabels {
  clear?: string;
  days?: string;
  month?: string;
  nextMonth?: string;
  placeholder?: string;
  previousMonth?: string;
  selectedDate?: string;
  today?: string;
  weekdays?: readonly string[];
  year?: string;
}

export interface DateInputProps {
  id?: string;
  name?: string;
  value?: string | null;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  locale?: string;
  labels?: DateInputLabels;
  placeholder?: string;
  rootClassName?: string;
  onChange: (value: string | null) => void;
}

interface CalendarDay {
  date: Date;
  inCurrentMonth: boolean;
  isoDate: string;
}

type CalendarMode = "day" | "month" | "year";

const defaultLabels: Required<Omit<DateInputLabels, "weekdays">> = {
  clear: "Clear",
  days: "Days",
  month: "Month",
  nextMonth: "Next month",
  placeholder: "Select date",
  previousMonth: "Previous month",
  selectedDate: "Selected date",
  today: "Today",
  year: "Year"
};

export function DateInput({
  id,
  name,
  value,
  disabled = false,
  required = false,
  className = "",
  locale,
  labels,
  placeholder,
  rootClassName = "",
  onChange
}: DateInputProps) {
  const fallbackId = useId();
  const resolvedId = id ?? fallbackId;
  const resolvedName = name ?? id ?? fallbackId.replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const normalizedValue = normalizeDateValue(value);
  const selectedDate = parseIsoDate(normalizedValue);
  const currentLocale = locale ?? getBrowserLocale();
  const resolvedLabels = { ...defaultLabels, ...labels };
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => selectedDate ?? new Date());
  const [calendarMode, setCalendarMode] = useState<CalendarMode>("day");
  const displayValue = selectedDate
    ? formatDisplayDate(selectedDate, currentLocale)
    : "";
  const [inputDraft, setInputDraft] = useState(displayValue);
  const [manualDraftActive, setManualDraftActive] = useState(false);
  const parsedDraftDate = parseManualDate(inputDraft, currentLocale);
  const draftHasText = inputDraft.trim().length > 0;
  const draftInvalid = manualDraftActive && draftHasText && !parsedDraftDate;
  const calendarDays = useMemo(() => createCalendarDays(viewDate), [viewDate]);
  const monthOptions = useMemo(() => createMonthOptions(currentLocale), [currentLocale]);
  const yearRangeStart = useMemo(() => getYearRangeStart(viewDate.getFullYear()), [viewDate]);
  const yearOptions = useMemo(() => createYearOptions(yearRangeStart), [yearRangeStart]);
  const weekdayLabels = useMemo(
    () => labels?.weekdays ?? createWeekdayLabels(currentLocale),
    [currentLocale, labels?.weekdays]
  );
  const todayIsoDate = formatIsoDate(new Date());
  const rootClasses = ["titanic-date", rootClassName].filter(Boolean).join(" ");
  const controlClasses = [
    "titanic-date__control",
    draftInvalid ? "titanic-date__control_invalid" : "",
    disabled ? "titanic-date__control_disabled" : "",
    className
  ].filter(Boolean).join(" ");

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
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        finishManualInput();
      }
    };

    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        finishManualInput();
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer, true);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, inputDraft, manualDraftActive, normalizedValue]);

  const changeVisiblePeriod = (offset: number) => {
    setViewDate((currentDate) => {
      if (calendarMode === "year") {
        return new Date(currentDate.getFullYear() + offset * 16, currentDate.getMonth(), 1);
      }

      if (calendarMode === "month") {
        return new Date(currentDate.getFullYear() + offset, currentDate.getMonth(), 1);
      }

      return new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    });
  };

  const openDayMode = () => setCalendarMode("day");
  const openMonthMode = () => setCalendarMode("month");
  const openYearMode = () => setCalendarMode("year");

  const selectVisibleMonth = (month: number) => {
    setViewDate((currentDate) => new Date(currentDate.getFullYear(), month, 1));
    setCalendarMode("day");
  };

  const selectVisibleYear = (year: number) => {
    setViewDate((currentDate) => new Date(year, currentDate.getMonth(), 1));
    setCalendarMode("day");
  };

  const selectDate = (nextDate: string) => {
    const nextDateValue = parseIsoDate(nextDate);

    setManualDraftActive(false);
    setInputDraft(nextDateValue ? formatDisplayDate(nextDateValue, currentLocale) : "");
    onChange(nextDate);
    setOpen(false);
  };

  const selectToday = () => {
    selectDate(todayIsoDate);
  };

  const clearDate = () => {
    setInputDraft("");
    setManualDraftActive(false);
    onChange(null);
    setOpen(false);
  };

  const handleManualChange = (nextText: string) => {
    setInputDraft(nextText);
    setManualDraftActive(true);

    const nextDate = parseManualDate(nextText, currentLocale);

    if (nextDate) {
      onChange(formatIsoDate(nextDate));
      return;
    }

    if (!nextText.trim() && !required) {
      onChange(null);
    }
  };

  const finishManualInput = () => {
    const nextDate = parseManualDate(inputDraft, currentLocale);

    if (nextDate) {
      const nextValue = formatIsoDate(nextDate);

      setInputDraft(formatDisplayDate(nextDate, currentLocale));
      setManualDraftActive(false);
      setViewDate(nextDate);
      onChange(nextValue);
      return;
    }

    if (!inputDraft.trim()) {
      setManualDraftActive(false);
      if (!required) {
        onChange(null);
      }
    }
  };

  const handleInputBlur = () => {
    window.setTimeout(() => {
      if (rootRef.current?.contains(document.activeElement)) {
        return;
      }

      finishManualInput();
    }, 0);
  };

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      finishManualInput();
      setOpen(false);
    }
  };

  return (
    <div className={rootClasses} ref={rootRef}>
      <input id={`${resolvedId}-value`} name={resolvedName} readOnly type="hidden" value={normalizedValue} />
      <div className={controlClasses}>
        <input
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-invalid={draftInvalid}
          className="titanic-date__input"
          disabled={disabled}
          id={resolvedId}
          placeholder={placeholder || resolvedLabels.placeholder}
          value={inputDraft}
          onBlur={handleInputBlur}
          onChange={(event) => handleManualChange(event.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleInputKeyDown}
        />
        <button
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label={placeholder || resolvedLabels.placeholder}
          className="titanic-date__calendar-button"
          disabled={disabled}
          type="button"
          onClick={() => setOpen((currentValue) => !currentValue)}
        >
          <span className="titanic-date__icon" aria-hidden="true">
            <ResourceSvgIcon icon={entityDateInputIcons.calendar} />
          </span>
        </button>
      </div>

      {open ? (
        <div className="titanic-date__popover" role="dialog" aria-modal="false" aria-labelledby={`${resolvedId}-month`}>
          <div className="titanic-date__header">
            <button
              aria-label={resolvedLabels.previousMonth}
              className="titanic-date__nav-button"
              type="button"
              onClick={() => changeVisiblePeriod(-1)}
            >
              <ResourceSvgIcon icon={entityCommonIcons.chevronLeft} />
            </button>
            <div className="titanic-date__period" id={`${resolvedId}-month`}>
              {calendarMode === "day" ? (
                <>
                  <button className="titanic-date__period-button" type="button" onClick={openMonthMode}>
                    {monthOptions[viewDate.getMonth()]?.label ?? resolvedLabels.month}
                  </button>
                  <button className="titanic-date__period-button" type="button" onClick={openYearMode}>
                    {viewDate.getFullYear()}
                  </button>
                </>
              ) : null}

              {calendarMode === "month" ? (
                <>
                  <button className="titanic-date__period-button" type="button" onClick={openDayMode}>
                    {resolvedLabels.days}
                  </button>
                  <button className="titanic-date__period-button" type="button" onClick={openYearMode}>
                    {viewDate.getFullYear()}
                  </button>
                </>
              ) : null}

              {calendarMode === "year" ? (
                <>
                  <button className="titanic-date__period-button" type="button" onClick={openDayMode}>
                    {resolvedLabels.days}
                  </button>
                  <button className="titanic-date__period-button" type="button" onClick={openMonthMode}>
                    {monthOptions[viewDate.getMonth()]?.label ?? resolvedLabels.month}
                  </button>
                </>
              ) : null}
            </div>
            <button
              aria-label={resolvedLabels.nextMonth}
              className="titanic-date__nav-button"
              type="button"
              onClick={() => changeVisiblePeriod(1)}
            >
              <ResourceSvgIcon icon={entityCommonIcons.chevronRight} />
            </button>
          </div>

          {calendarMode === "day" ? (
            <>
              <div className="titanic-date__weekdays" aria-hidden="true">
                {weekdayLabels.map((weekday) => <span key={weekday}>{weekday}</span>)}
              </div>

              <div className="titanic-date__days">
                {calendarDays.map((day) => {
                  const active = day.isoDate === normalizedValue;
                  const today = day.isoDate === todayIsoDate;
                  const dayClassName = [
                    "titanic-date__day",
                    day.inCurrentMonth ? "" : "titanic-date__day_muted",
                    today ? "titanic-date__day_today" : "",
                    active ? "titanic-date__day_active" : ""
                  ].filter(Boolean).join(" ");

                  return (
                    <button
                      aria-label={formatFullDate(day.date, currentLocale)}
                      aria-pressed={active}
                      className={dayClassName}
                      key={day.isoDate}
                      title={active ? resolvedLabels.selectedDate : undefined}
                      type="button"
                      onClick={() => selectDate(day.isoDate)}
                    >
                      {day.date.getDate()}
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}

          {calendarMode === "month" ? (
            <div className="titanic-date__months">
              {monthOptions.map((month) => {
                const active = month.value === viewDate.getMonth();

                return (
                  <button
                    aria-pressed={active}
                    className={active ? "titanic-date__period-option titanic-date__period-option_active" : "titanic-date__period-option"}
                    key={month.value}
                    type="button"
                    onClick={() => selectVisibleMonth(month.value)}
                  >
                    {month.label}
                  </button>
                );
              })}
            </div>
          ) : null}

          {calendarMode === "year" ? (
            <div className="titanic-date__years">
              {yearOptions.map((year) => {
                const active = year === viewDate.getFullYear();

                return (
                  <button
                    aria-pressed={active}
                    className={active ? "titanic-date__period-option titanic-date__period-option_active" : "titanic-date__period-option"}
                    key={year}
                    type="button"
                    onClick={() => selectVisibleYear(year)}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="titanic-date__actions">
            <button type="button" onClick={selectToday}>{resolvedLabels.today}</button>
            <button type="button" disabled={!normalizedValue || required} onClick={clearDate}>{resolvedLabels.clear}</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function createCalendarDays(viewDate: Date): CalendarDay[] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(year, month, 1 - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + index);

    return {
      date,
      inCurrentMonth: date.getMonth() === month,
      isoDate: formatIsoDate(date)
    };
  });
}

function createWeekdayLabels(locale: string): string[] {
  const monday = new Date(2024, 0, 1);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index);
    return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date);
  });
}

function createMonthOptions(locale: string): Array<{ value: number; label: string }> {
  return Array.from({ length: 12 }, (_, month) => ({
    value: month,
    label: capitalizeFirstLetter(new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date(2024, month, 1)))
  }));
}

function createYearOptions(rangeStart: number): number[] {
  return Array.from({ length: 16 }, (_, index) => rangeStart + index)
    .filter((year) => year >= 1 && year <= 9999);
}

function getYearRangeStart(year: number): number {
  return Math.max(1, Math.floor((year - 1) / 16) * 16 + 1);
}

function normalizeDateValue(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  const normalizedValue = String(value).slice(0, 10);
  return parseIsoDate(normalizedValue) ? normalizedValue : "";
}

function parseManualDate(value: string, locale: string): Date | null {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  const isoDate = parseIsoDate(normalizedValue);
  if (isoDate) {
    return isoDate;
  }

  const parts = normalizedValue.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (!parts) {
    return null;
  }

  const firstPart = Number(parts[1]);
  const secondPart = Number(parts[2]);
  const year = Number(parts[3]);
  const monthFirst = resolveMonthFirstDate(locale, firstPart, secondPart);
  const month = monthFirst ? firstPart : secondPart;
  const day = monthFirst ? secondPart : firstPart;

  return createValidDate(year, month, day);
}

function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return createValidDate(year, month, day);
}

function createValidDate(year: number, month: number, day: number): Date | null {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return date;
}

function resolveMonthFirstDate(locale: string, firstPart: number, secondPart: number): boolean {
  if (firstPart > 12 && secondPart <= 12) {
    return false;
  }

  if (secondPart > 12 && firstPart <= 12) {
    return true;
  }

  return /^en-US\b/i.test(locale);
}

function formatDisplayDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function formatIsoDate(date: Date): string {
  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate())
  ].join("-");
}

function formatFullDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(date);
}

function getBrowserLocale(): string {
  return typeof navigator === "undefined" ? "en-US" : navigator.language;
}

function padDatePart(value: number): string {
  return String(value).padStart(2, "0");
}

function capitalizeFirstLetter(value: string): string {
  return value ? value[0].toLocaleUpperCase() + value.slice(1) : value;
}
