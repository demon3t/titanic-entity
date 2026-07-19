import type { BaseInputFieldProps } from "../inputFieldFrame/base-input-field";

export type LookupInputMode = "enum" | "lookup";
export type LookupInputValue = string | number | null;

export interface LookupInputItem {
  id?: LookupInputValue;
  value?: LookupInputValue;
  index?: number;
  title?: string;
  displayValue?: string;
}

type LookupInputChangeHandler<TItem extends LookupInputItem> = {
  bivarianceHack(value: LookupInputValue, item?: TItem): void;
}["bivarianceHack"];

export interface LookupInputProps<TItem extends LookupInputItem = LookupInputItem>
  extends Omit<BaseInputFieldProps<LookupInputValue, "lookup">, "value"> {
  id?: string;
  name?: string;
  value: LookupInputValue;
  displayValue?: string;
  items: TItem[];
  mode?: LookupInputMode;
  disabled?: boolean;
  emptyText?: string;
  noResultsText?: string;
  loadingText?: string;
  loadingMoreText?: string;
  errorText?: string;
  className?: string;
  inputClassName?: string;
  renderFrame?: boolean;
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  error?: Error | null;
  searchDelayMs?: number;
  minSearchLength?: number;
  getId?: (item: TItem) => LookupInputValue;
  getLabel?: (item: TItem) => string;
  onChange: LookupInputChangeHandler<TItem>;
  onOpen?: () => void | Promise<void>;
  onSearchChange?: (value: string) => void | Promise<void>;
  onLoadMore?: () => void | Promise<void>;
}
