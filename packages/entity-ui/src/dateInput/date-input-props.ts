import type { BaseInputFieldProps } from "../inputFieldFrame/base-input-field";
import type { DateInputLabels } from "./lcz";

export interface DateInputProps extends BaseInputFieldProps<string | null, "date"> {
  id?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  locale?: string;
  labels?: DateInputLabels;
  placeholder?: string;
  renderFrame?: boolean;
  rootClassName?: string;
  onChange: (value: string | null) => void;
}
