import type { BaseInputFieldProps } from "../inputFieldFrame/base-input-field";

export interface NumberInputProps extends BaseInputFieldProps<number | null, "number"> {
  id?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  onChange: (value: number | null) => void;
}
