import { useId } from "react";
import { InputFieldFrame } from "./InputFieldFrame";
import type { BaseInputFieldProps } from "./models/BaseInputField";

export interface LookupInputItem {
  id: string;
  index?: number;
  title?: string;
}

export interface LookupInputProps<TItem extends LookupInputItem = LookupInputItem>
  extends Omit<BaseInputFieldProps<string, "lookup">, "value"> {
  id?: string;
  name?: string;
  value: string;
  items: TItem[];
  disabled?: boolean;
  emptyText: string;
  className?: string;
  getId?: (item: TItem) => string;
  getLabel?: (item: TItem) => string;
  onChange: (value: string) => void;
}

export function LookupInput<TItem extends LookupInputItem = LookupInputItem>({
  id,
  name,
  value,
  items,
  disabled,
  emptyText,
  className,
  editable = true,
  getId = (item) => item.id,
  getLabel = defaultEntityLabel,
  required = false,
  title,
  validationError,
  visible = true,
  onChange
}: LookupInputProps<TItem>) {
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
        <select
          aria-errormessage={errorId}
          aria-invalid={Boolean(validationError)}
          className={className}
          disabled={readOnly}
          id={resolvedId}
          name={resolvedName}
          required={required}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">{emptyText}</option>
          {items.map((item) => {
            const id = getId(item);
            return <option key={id} value={id}>{getLabel(item)}</option>;
          })}
        </select>
      )}
      errorId={errorId}
      htmlFor={resolvedId}
      required={required}
      title={title}
      validationError={validationError}
    />
  );
}

function defaultEntityLabel(item: LookupInputItem): string {
  const title = item.title || item.id;
  return item.index == null ? title : `${item.index}. ${title}`;
}
