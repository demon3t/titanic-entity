import type { BaseInputFieldProps } from "../inputFieldFrame/base-input-field";
import type { TimeInputLabels } from "./lcz";

export interface TimeInputProps extends BaseInputFieldProps<string | null, "time"> {
  id?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  locale?: string;
  labels?: TimeInputLabels;
  placeholder?: string;
  renderFrame?: boolean;
  rootClassName?: string;
  minuteStep?: number;
  onChange: (value: string | null) => void;
}
