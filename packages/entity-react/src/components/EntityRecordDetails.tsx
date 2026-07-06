// Переиспользуемый UI-компонент 'EntityRecordDetails' для пакетной архитектуры.
import type { EntityApiEntity } from "@titanic/entity-api";
import type { EntityRecordDetailsProps } from "./models/EntityRecordDetailsProps";

export type { EntityRecordDetailsField, EntityRecordDetailsProps } from "./models/EntityRecordDetailsProps";

export function EntityRecordDetails({
  title,
  row,
  fields,
  emptyText = "Выберите запись",
  className = "",
  actions
}: EntityRecordDetailsProps) {
  const rootClassName = ["titanic-entity-details", className].filter(Boolean).join(" ");

  return (
    <section className={rootClassName}>
      <header className="titanic-entity-details__header">
        <h2>{title}</h2>
        {actions ? <div className="titanic-entity-details__actions">{actions}</div> : null}
      </header>
      {!row ? <p className="titanic-entity-details__empty">{emptyText}</p> : null}
      {row ? (
        <dl className="titanic-entity-details__grid">
          {fields.map((field) => (
            <div key={field.key} className="titanic-entity-details__field">
              <dt>{field.label}</dt>
              <dd>{field.render ? field.render(row) : formatEntityValue(row, field.key)}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}

function formatEntityValue(row: EntityApiEntity, key: string): string {
  const column = row[key];
  const value = column?.displayValue ?? column?.value;
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "boolean") {
    return value ? "Да" : "Нет";
  }

  return String(value);
}
