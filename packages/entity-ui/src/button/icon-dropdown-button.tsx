import { Titanic } from "@titanic-entity/entity-react";
import { useEffect, useRef, useState } from "react";
import { ResourceSvgIcon } from "../resourceSvgIcon/resource-svg-icon";
import { Button } from "./button";
import type { IconDropdownButtonProps, IconDropdownOption } from "./index";

export const IconDropdownButton = Titanic.define<IconDropdownButtonProps>("Titanic.UI.IconDropdownButton", function IconDropdownButton({
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
  options = [],
  selectedLabelClassName,
  tooltipClassName,
  triggerClassName = "titanic-icon-dropdown__trigger",
  value,
  onChange
}: IconDropdownButtonProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selectedOption = options.find((option) => option.value === value) ?? options[0];
  const triggerLabelClassName = selectedLabelClassName ?? (!selectedOption?.icon ? "titanic-icon-dropdown__value" : undefined);
  const triggerLabel = selectedLabelClassName
    ? selectedOption?.label
    : selectedOption?.icon ? undefined : label;

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

  const selectOption = (option: IconDropdownOption) => {
    onChange(option.value);
    setOpen(false);
  };

  return (
    <div className={["titanic-icon-dropdown", className].filter(Boolean).join(" ")} ref={rootRef}>
      {labelClassName ? <span className={labelClassName}>{label}</span> : null}
      <Button
        unstyled
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={label}
        className={triggerClassName}
        disabled={disabled}
        title={triggerLabel ?? selectedOption?.label ?? label}
        type="button"
        onClick={() => {
          if (!disabled) {
            setOpen((current) => !current);
          }
        }}
      >
        <ResourceSvgIcon className={iconClassName} icon={selectedOption?.icon} />
        {triggerLabelClassName && triggerLabel ? <span className={triggerLabelClassName}>{triggerLabel}</span> : null}
        {chevronClassName ? <span aria-hidden="true" className={chevronClassName}>{chevron ?? "v"}</span> : null}
        {tooltipClassName && selectedOption ? (
          <span className={tooltipClassName} role="tooltip">{triggerLabel ?? selectedOption.label}</span>
        ) : null}
      </Button>
      {open ? (
        <div aria-label={label} className={menuClassName} role="listbox">
          {options.map((option) => {
            const active = option.value === value;
            return (
              <Button
                unstyled
                aria-selected={active}
                className={active ? `${optionClassName} ${optionActiveClassName}` : optionClassName}
                key={option.value}
                role="option"
                type="button"
                onClick={() => selectOption(option)}
              >
                <ResourceSvgIcon className={iconClassName} icon={option.icon} />
                <span>{option.label}</span>
              </Button>
            );
          })}
        </div>
      ) : null}
      {errorText ? <small className={errorClassName}>{errorText}</small> : null}
    </div>
  );
});
