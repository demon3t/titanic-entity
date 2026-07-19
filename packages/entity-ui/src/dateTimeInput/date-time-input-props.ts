import type { DateInputLabels } from "../dateInput";
import type { BaseInputFieldProps } from "../inputFieldFrame/base-input-field";
import type { TimeInputLabels } from "../timeInput";

export interface DateTimeInputProps extends BaseInputFieldProps<string | null, "dateTime"> {
  id?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  locale?: string;
  dateLabels?: DateInputLabels;
  timeLabels?: TimeInputLabels;
  placeholder?: string;
  datePlaceholder?: string;
  timePlaceholder?: string;
  renderFrame?: boolean;
  rootClassName?: string;
  minuteStep?: number;
  onChange: (value: string | null) => void;
}
