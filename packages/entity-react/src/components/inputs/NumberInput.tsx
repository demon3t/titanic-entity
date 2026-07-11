import { useId } from "react";
import { InputFieldFrame } from "./InputFieldFrame";
import type { BaseInputFieldProps } from "./models/BaseInputField";

export interface NumberInputProps extends BaseInputFieldProps<number | null, "number"> {
  id?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  onChange: (value: number | null) => void;
}

export function NumberInput({
  id,
  name,
  value,
  disabled,
  className,
  editable = true,
  required = false,
  title,
  validationError,
  visible = true,
  onChange
}: NumberInputProps) {
  const fallbackId = useId();
  const resolvedId = id ?? fallbackId;
  const resolvedName = name ?? id ?? fallbackId.replace(/:/g, "");
  const readOnly = Boolean(disabled) || !editable;
  const errorId = validationError ? `${resolvedId}-error` : undefined;

  if (!visible) {
    return null;
  }

  return (
    <InputFieldFrame
      control={(
        <input
          aria-errormessage={errorId}
          aria-invalid={Boolean(validationError)}
          className={className}
          disabled={readOnly}
          id={resolvedId}
          name={resolvedName}
          required={required}
          type="number"
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))}
        />
      )}
      errorId={errorId}
      htmlFor={resolvedId}
      required={required}
      title={title}
      validationError={validationError}
    />
  );
}
