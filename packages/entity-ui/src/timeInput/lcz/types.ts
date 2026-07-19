export interface TimeInputLabels {
  clear?: string;
  hour?: string;
  minute?: string;
  now?: string;
  placeholder?: string;
  selectedTime?: string;
  title?: string;
}

export type TimeInputCulture = "en-US" | "ru-RU";

export type TimeInputResolvedLabels = Required<TimeInputLabels>;
