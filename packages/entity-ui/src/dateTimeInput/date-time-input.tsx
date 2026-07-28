import { Titanic } from "@titanic-entity/entity-react";
import { useId } from "react";
import { DateInput } from "../dateInput";
import { InputFieldFrame } from "../inputFieldFrame";
import { TimeInput } from "../timeInput";
import type { DateTimeInputProps } from "./index";

export const DateTimeInput = Titanic.define<DateTimeInputProps>(
  "Titanic.UI.DateTimeInput",
  function DateTimeInput({
    id,
    name,
    value,
    disabled = false,
    required = false,
    className = "",
    locale,
    dateLabels,
    timeLabels,
    placeholder,
    datePlaceholder,
    timePlaceholder,
    renderFrame = true,
    rootClassName = "",
    minuteStep,
    editable = true,
    title,
    validationError,
    visible = true,
    onChange
  }: DateTimeInputProps) {
    const fallbackId = useId();
    const resolvedId = id ?? fallbackId;
    const resolvedName = name ?? id ?? fallbackId.replace(/:/g, "");
    const normalizedValue = normalizeDateTimeValue(value);
    const dateValue = normalizedValue ? normalizedValue.slice(0, 10) : "";
    const timeValue = normalizedValue ? normalizedValue.slice(11, 16) : "";
    const readOnly = disabled || !editable;
    const invalid = Boolean(validationError);
    const errorId = validationError ? `${resolvedId}-error` : undefined;
    const rootClasses = joinClassNames(
      "titanic-datetime-input",
      invalid && "titanic-datetime-input_invalid",
      rootClassName
    );
    const controlClasses = joinClassNames(
      !hasClassName(className, "titanic-field__control") && "titanic-field__control",
      "titanic-datetime-input__control",
      invalid && "titanic-datetime-input__control_invalid",
      readOnly && "titanic-datetime-input__control_disabled",
      className
    );

    if (!visible) {
      return null;
    }

    const handleDateChange = (nextDate: string | null) => {
      if (!nextDate) {
        onChange(null);
        return;
      }

      onChange(`${nextDate}T${timeValue || getCurrentTime()}`);
    };

    const handleTimeChange = (nextTime: string | null) => {
      if (!nextTime) {
        onChange(dateValue ? `${dateValue}T00:00` : null);
        return;
      }

      onChange(`${dateValue || getCurrentDate()}T${nextTime}`);
    };

    const control = (
      <div className={rootClasses}>
        <input id={`${resolvedId}-value`} name={resolvedName} readOnly type="hidden" value={normalizedValue} />
        <div
          aria-errormessage={errorId}
          aria-invalid={invalid || undefined}
          className={controlClasses}
        >
          <DateInput
            id={resolvedId}
            name={`${resolvedName}Date`}
            disabled={readOnly}
            required={required}
            editable={editable}
            visible={visible}
            value={dateValue}
            locale={locale}
            labels={dateLabels}
            placeholder={datePlaceholder ?? placeholder}
            renderFrame={false}
            rootClassName="titanic-datetime-input__date"
            className="titanic-datetime-input__segment-control titanic-datetime-input__date-control"
            validationError={validationError}
            onChange={handleDateChange}
          />
          <span aria-hidden className="titanic-datetime-input__separator" />
          <TimeInput
            id={`${resolvedId}-time`}
            name={`${resolvedName}Time`}
            disabled={readOnly}
            required={required}
            editable={editable}
            visible={visible}
            value={timeValue}
            locale={locale}
            labels={timeLabels}
            placeholder={timePlaceholder}
            renderFrame={false}
            rootClassName="titanic-datetime-input__time"
            className="titanic-datetime-input__segment-control titanic-datetime-input__time-control"
            minuteStep={minuteStep}
            onChange={handleTimeChange}
          />
        </div>
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
  }
);

function normalizeDateTimeValue(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  const match = /^(\d{4}-\d{2}-\d{2})(?:[T\s](\d{1,2}:\d{2})(?::\d{2}(?:\.\d+)?)?)?/.exec(String(value).trim());

  if (!match) {
    return "";
  }

  const date = parseIsoDate(match[1]) ? match[1] : "";
  const time = normalizeTimePart(match[2] ?? "00:00");
  return date && time ? `${date}T${time}` : "";
}

function normalizeTimePart(value: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);

  if (!match) {
    return "";
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return "";
  }

  return `${padPart(hour)}:${padPart(minute)}`;
}

function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

function getCurrentDate(): string {
  const now = new Date();
  return [now.getFullYear(), padPart(now.getMonth() + 1), padPart(now.getDate())].join("-");
}

function getCurrentTime(): string {
  const now = new Date();
  return `${padPart(now.getHours())}:${padPart(now.getMinutes())}`;
}

function padPart(value: number): string {
  return String(value).padStart(2, "0");
}

function hasClassName(className: string, targetClassName: string): boolean {
  return className.split(/\s+/).includes(targetClassName);
}

function joinClassNames(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}
