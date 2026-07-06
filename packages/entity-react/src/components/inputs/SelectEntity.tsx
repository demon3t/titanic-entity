// Базовый элемент поля 'SelectEntity' для переиспользования в пакетах.
import { useId } from "react";

export interface SelectEntityItem {
  id: string;
  index?: number;
  title?: string;
}

export interface SelectEntityProps<TItem extends SelectEntityItem = SelectEntityItem> {
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

export function SelectEntity<TItem extends SelectEntityItem = SelectEntityItem>({
  id,
  name,
  value,
  items,
  disabled,
  emptyText,
  className,
  getId = (item) => item.id,
  getLabel = defaultEntityLabel,
  onChange
}: SelectEntityProps<TItem>) {
  const fallbackId = useId();
  const resolvedId = id ?? fallbackId;
  const resolvedName = name ?? id ?? fallbackId.replace(/:/g, "");

  return (
    <select className={className} disabled={disabled} id={resolvedId} name={resolvedName} value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">{emptyText}</option>
      {items.map((item) => {
        const id = getId(item);
        return <option key={id} value={id}>{getLabel(item)}</option>;
      })}
    </select>
  );
}

function defaultEntityLabel(item: SelectEntityItem): string {
  const title = item.title || item.id;
  return item.index == null ? title : `${item.index}. ${title}`;
}
