import { Titanic } from "@titanic-entity/entity-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Button } from "../button";
import { InputFieldFrame } from "../inputFieldFrame";
import { getTimeInputLabels, getTimeInputLocale } from "./time-input-lcz";
import type { TimeInputProps } from "./index";

export const TimeInput = Titanic.define<TimeInputProps>("Titanic.UI.TimeInput", function TimeInput({
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
  minuteStep = 5,
  editable = true,
  title,
  validationError,
  visible = true,
  onChange
}: TimeInputProps) {
  const fallbackId = useId();
  const resolvedId = id ?? fallbackId;
  const resolvedName = name ?? id ?? fallbackId.replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [inputDraft, setInputDraft] = useState("");
  const [manualDraftActive, setManualDraftActive] = useState(false);
  const normalizedValue = normalizeTimeValue(value);
  const currentLocale = getTimeInputLocale(locale);
  const resolvedLabels = { ...getTimeInputLabels(currentLocale), ...(labels ?? {}) };
  const parsedDraftTime = parseManualTime(inputDraft);
  const draftInvalid = manualDraftActive && inputDraft.trim().length > 0 && !parsedDraftTime;
  const readOnly = disabled || !editable;
  const invalid = draftInvalid || Boolean(validationError);
  const errorId = validationError ? `${resolvedId}-error` : undefined;
  const step = normalizeMinuteStep(minuteStep);
  const selectedHour = getHour(normalizedValue);
  const selectedMinute = getMinute(normalizedValue);
  const fallbackHour = selectedHour ?? new Date().getHours();
  const fallbackMinute = selectedMinute ?? roundMinuteToStep(new Date().getMinutes(), step);
  const hourOptions = createHourOptions();
  const minuteOptions = createMinuteOptions(step, selectedMinute);
  const ariaLabel = placeholder || resolvedLabels.placeholder;

  const finishManualInput = () => {
    const nextTime = parseManualTime(inputDraft);

    if (nextTime) {
      setInputDraft(nextTime);
      setManualDraftActive(false);
      onChange(nextTime);
      return;
    }

    if (!inputDraft.trim()) {
      setManualDraftActive(false);
      if (!required) {
        onChange(null);
      }
    }
  };

  useEffect(() => {
    if (!manualDraftActive) {
      setInputDraft(normalizedValue);
    }
  }, [manualDraftActive, normalizedValue]);

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

  if (!visible) {
    return null;
  }

  const commitTime = (nextHour: number, nextMinute: number, closeAfterSelect: boolean) => {
    const nextValue = `${padTimePart(nextHour)}:${padTimePart(nextMinute)}`;
    setInputDraft(nextValue);
    setManualDraftActive(false);
    onChange(nextValue);
    if (closeAfterSelect) {
      setOpen(false);
    }
  };

  const handleNow = () => {
    const nextTime = getCurrentTime();
    setInputDraft(nextTime);
    setManualDraftActive(false);
    onChange(nextTime);
    setOpen(false);
  };

  const handleClear = () => {
    setInputDraft("");
    setManualDraftActive(false);
    onChange(null);
    setOpen(false);
  };

  const control = (
    <div className={joinClassNames("titanic-time", rootClassName)} ref={rootRef}>
      <input id={`${resolvedId}-value`} name={resolvedName} readOnly type="hidden" value={normalizedValue} />
      <div
        aria-errormessage={errorId}
        aria-invalid={invalid || undefined}
        className={joinClassNames(
          !hasClassName(className, "titanic-field__control")
            && !hasClassName(className, "titanic-datetime-input__segment-control")
            && "titanic-field__control",
          "titanic-time__control",
          invalid && "titanic-time__control_invalid",
          readOnly && "titanic-time__control_disabled",
          className
        )}
      >
        <input
          aria-errormessage={errorId}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-invalid={invalid}
          aria-label={ariaLabel}
          className="titanic-time__input"
          disabled={readOnly}
          id={resolvedId}
          inputMode="numeric"
          placeholder={placeholder}
          value={inputDraft}
          onBlur={() => {
            window.setTimeout(() => {
              if (!rootRef.current?.contains(document.activeElement)) {
                finishManualInput();
              }
            }, 0);
          }}
          onChange={(event) => {
            const nextText = event.target.value;
            setInputDraft(nextText);
            setManualDraftActive(true);
            const nextTime = parseManualTime(nextText);

            if (nextTime) {
              onChange(nextTime);
            } else if (!nextText.trim() && !required) {
              onChange(null);
            }
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event: ReactKeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") {
              event.preventDefault();
              finishManualInput();
              setOpen(false);
            }
          }}
        />
        <Button
          unstyled
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label={ariaLabel}
          className="titanic-time__dropdown-button"
          disabled={readOnly}
          type="button"
          onClick={() => setOpen((currentValue) => !currentValue)}
        >
          <span aria-hidden className="titanic-time__icon" />
        </Button>
      </div>

      {open ? (
        <div
          aria-label={resolvedLabels.title}
          aria-modal="false"
          className="titanic-date-time-popover titanic-time__popover"
          role="dialog"
        >
          <div className="titanic-time__columns">
            <div className="titanic-time__column">
              <span className="titanic-time__column-title">{resolvedLabels.hour}</span>
              <div aria-label={resolvedLabels.hour} className="titanic-time__options" role="listbox">
                {hourOptions.map((hour) => {
                  const active = hour === selectedHour;
                  return (
                    <Button
                      unstyled
                      aria-selected={active}
                      className={joinClassNames("titanic-time__option", active && "titanic-time__option_active")}
                      key={hour}
                      role="option"
                      title={active ? resolvedLabels.selectedTime : undefined}
                      type="button"
                      onClick={() => commitTime(hour, fallbackMinute, false)}
                    >
                      {padTimePart(hour)}
                    </Button>
                  );
                })}
              </div>
            </div>
            <div className="titanic-time__column">
              <span className="titanic-time__column-title">{resolvedLabels.minute}</span>
              <div aria-label={resolvedLabels.minute} className="titanic-time__options" role="listbox">
                {minuteOptions.map((minute) => {
                  const active = minute === selectedMinute;
                  return (
                    <Button
                      unstyled
                      aria-selected={active}
                      className={joinClassNames("titanic-time__option", active && "titanic-time__option_active")}
                      key={minute}
                      role="option"
                      title={active ? resolvedLabels.selectedTime : undefined}
                      type="button"
                      onClick={() => commitTime(fallbackHour, minute, true)}
                    >
                      {padTimePart(minute)}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="titanic-time__actions">
            <Button unstyled type="button" onClick={handleNow}>{resolvedLabels.now}</Button>
            <Button unstyled disabled={!normalizedValue || required} type="button" onClick={handleClear}>
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

function normalizeTimeValue(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  const normalizedValue = String(value).trim();
  const embeddedTime = /(?:^|[T\s])(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?(?:$|[Z+\-\s])/.exec(normalizedValue);
  const timeSource = embeddedTime ? `${embeddedTime[1]}:${embeddedTime[2]}` : normalizedValue;
  return parseManualTime(timeSource) ?? "";
}

function parseManualTime(value: string): string | null {
  const normalizedValue = String(value).trim();

  if (!normalizedValue) {
    return null;
  }

  const separatedValue = normalizedValue.replace(/[.\s]+/g, ":");
  const separatedParts = /^(\d{1,2})(?::(\d{1,2}))?$/.exec(separatedValue);
  let hour: number;
  let minute: number;

  if (separatedParts) {
    hour = Number(separatedParts[1]);
    minute = separatedParts[2] == null ? 0 : Number(separatedParts[2]);
  } else {
    const compactParts = /^(\d{3,4})$/.exec(normalizedValue);
    if (!compactParts) {
      return null;
    }

    hour = Number(compactParts[1].slice(0, -2));
    minute = Number(compactParts[1].slice(-2));
  }

  return isValidTimePart(hour, 23) && isValidTimePart(minute, 59)
    ? `${padTimePart(hour)}:${padTimePart(minute)}`
    : null;
}

function isValidTimePart(value: number, max: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= max;
}

function createHourOptions(): number[] {
  return Array.from({ length: 24 }, (_item, hour) => hour);
}

function createMinuteOptions(step: number, selectedMinute: number | null): number[] {
  const values = new Set<number>();

  for (let minute = 0; minute < 60; minute += step) {
    values.add(minute);
  }

  if (selectedMinute != null) {
    values.add(selectedMinute);
  }

  return Array.from(values).sort((first, second) => first - second);
}

function normalizeMinuteStep(value: number): number {
  if (!Number.isFinite(value)) {
    return 5;
  }

  const step = Math.trunc(value);
  return step >= 1 && step <= 30 ? step : 5;
}

function roundMinuteToStep(minute: number, step: number): number {
  return Math.min(60 - step, Math.round(minute / step) * step);
}

function getHour(value: string): number | null {
  return value ? Number(value.slice(0, 2)) : null;
}

function getMinute(value: string): number | null {
  return value ? Number(value.slice(3, 5)) : null;
}

function getCurrentTime(): string {
  const now = new Date();
  return `${padTimePart(now.getHours())}:${padTimePart(now.getMinutes())}`;
}

function padTimePart(value: number): string {
  return String(value).padStart(2, "0");
}

function hasClassName(className: string, targetClassName: string): boolean {
  return className.split(/\s+/).includes(targetClassName);
}

function joinClassNames(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}
