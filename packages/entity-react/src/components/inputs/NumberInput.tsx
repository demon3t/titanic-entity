// Базовый элемент поля 'NumberInput' для переиспользования в пакетах.
import { useId } from "react";

export interface NumberInputProps {
  id?: string;
  name?: string;
  value?: number | null;
  disabled?: boolean;
  className?: string;
  onChange: (value: number | null) => void;
}

export function NumberInput({ id, name, value, disabled, className, onChange }: NumberInputProps) {
  const fallbackId = useId();
  const resolvedId = id ?? fallbackId;
  const resolvedName = name ?? id ?? fallbackId.replace(/:/g, "");

  return (
    <input
      className={className}
      disabled={disabled}
      id={resolvedId}
      name={resolvedName}
      type="number"
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))}
    />
  );
}
