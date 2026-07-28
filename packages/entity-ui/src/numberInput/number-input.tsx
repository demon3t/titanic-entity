import { Titanic } from "@titanic-entity/entity-react";
import { useId, type ChangeEvent } from "react";
import { InputFieldFrame } from "../inputFieldFrame";
import type { NumberInputProps } from "./index";

export const NumberInput = Titanic.define<NumberInputProps>("Titanic.UI.NumberInput", function NumberInput({
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

  if (!visible) {
    return null;
  }

  const resolvedId = id ?? fallbackId;
  const resolvedName = name ?? id ?? fallbackId.replace(/:/g, "");
  const readOnly = Boolean(disabled) || !editable;
  const errorId = validationError ? `${resolvedId}-error` : undefined;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value === "" ? null : Number(event.target.value));
  };

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
          onChange={handleChange}
        />
      )}
      errorId={errorId}
      htmlFor={resolvedId}
      required={required}
      title={title}
      validationError={validationError}
    />
  );
});
