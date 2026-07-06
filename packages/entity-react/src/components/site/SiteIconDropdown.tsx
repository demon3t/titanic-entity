// Базовый иконочный dropdown сайта для выбора значения из ресурсных SVG-иконок.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ResourceSvgIcon } from "../icons/ResourceSvgIcon";
import type { ResourceSvgIconResource } from "@titanic-entity/entity-resources";

export interface SiteIconDropdownOption {
  icon: ResourceSvgIconResource;
  label: string;
  value: string;
}

export interface SiteIconDropdownProps {
  chevron?: ReactNode;
  chevronClassName?: string;
  className?: string;
  disabled?: boolean;
  errorClassName?: string;
  errorText?: string | null;
  iconClassName?: string;
  label: string;
  labelClassName?: string;
  menuClassName?: string;
  optionActiveClassName?: string;
  optionClassName?: string;
  options: readonly SiteIconDropdownOption[];
  selectedLabelClassName?: string;
  tooltipClassName?: string;
  triggerClassName?: string;
  value: string;
  onChange: (value: string) => void;
}

export function SiteIconDropdown({
  chevron,
  chevronClassName,
  className = "",
  disabled = false,
  errorClassName = "titanic-icon-dropdown__error",
  errorText,
  iconClassName = "titanic-icon-dropdown__icon",
  label,
  labelClassName,
  menuClassName = "titanic-icon-dropdown__menu",
  optionActiveClassName = "titanic-icon-dropdown__option_active",
  optionClassName = "titanic-icon-dropdown__option",
  options,
  selectedLabelClassName,
  tooltipClassName,
  triggerClassName = "titanic-icon-dropdown__trigger",
  value,
  onChange
}: SiteIconDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selectedOption = options.find((option) => option.value === value) ?? options[0];
  const rootClassName = ["titanic-icon-dropdown", className].filter(Boolean).join(" ");

  useEffect(() => {
    if (!open) {
      return;
    }

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
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

  const selectOption = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <div className={rootClassName} ref={rootRef}>
      {labelClassName ? <span className={labelClassName}>{label}</span> : null}
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={label}
        className={triggerClassName}
        disabled={disabled}
        title={selectedOption?.label ?? label}
        type="button"
        onClick={() => setOpen((currentValue) => !currentValue)}
      >
        <ResourceSvgIcon className={iconClassName} icon={selectedOption?.icon} />
        {selectedLabelClassName && selectedOption ? (
          <span className={selectedLabelClassName}>{selectedOption.label}</span>
        ) : null}
        {chevronClassName ? <span className={chevronClassName} aria-hidden="true">{chevron ?? "v"}</span> : null}
        {tooltipClassName && selectedOption ? (
          <span className={tooltipClassName} role="tooltip">{selectedOption.label}</span>
        ) : null}
      </button>
      {open ? (
        <div className={menuClassName} role="listbox" aria-label={label}>
          {options.map((option) => {
            const active = option.value === value;

            return (
              <button
                aria-selected={active}
                className={active ? `${optionClassName} ${optionActiveClassName}` : optionClassName}
                key={option.value}
                role="option"
                type="button"
                onClick={() => selectOption(option.value)}
              >
                <ResourceSvgIcon className={iconClassName} icon={option.icon} />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
      {errorText ? <small className={errorClassName}>{errorText}</small> : null}
    </div>
  );
}
