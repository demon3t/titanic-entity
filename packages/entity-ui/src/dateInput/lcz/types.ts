export interface DateInputLabels {
  clear?: string;
  days?: string;
  month?: string;
  nextMonth?: string;
  placeholder?: string;
  previousMonth?: string;
  selectedDate?: string;
  today?: string;
  weekdays?: readonly string[];
  year?: string;
}

export type DateInputCulture = "en-US" | "ru-RU";

export type DateInputResolvedLabels = Required<Omit<DateInputLabels, "weekdays">> & {
  weekdays?: readonly string[];
};
