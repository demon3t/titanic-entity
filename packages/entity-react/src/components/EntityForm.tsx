import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { createEmptyValues, getColumnKey } from "@titanic-entity/entity-core";
import type { EntityFormProps } from "./models/EntityFormProps";
import { EntityField } from "./fields/EntityField";
import type { EntityFieldProps } from "./fields/models/EntityFieldProps";
import { EntityGrid } from "./layout/EntityGrid";
import type { EntityGridProps } from "./layout/models/EntityGridProps";
import { useUiComponent } from "@titanic-entity/entity-base";

export type { EntityFormProps } from "./models/EntityFormProps";

/**
 * Форма по схеме для создания и редактирования записей Entity.
 */
export function EntityForm({
  schema,
  value,
  disabled,
  submitLabel = "Сохранить",
  manualCommitDelayMs,
  onChange,
  onSubmit
}: EntityFormProps) {
  const FieldComponent = useUiComponent<EntityFieldProps>("EntityField", EntityField);
  const GridComponent = useUiComponent<EntityGridProps>("EntityGrid", EntityGrid);
  const initialValues = useMemo(() => value ?? createEmptyValues(schema), [schema, value]);
  const [values, setValues] = useState(initialValues);
  const valuesRef = useRef(initialValues);

  useEffect(() => {
    valuesRef.current = initialValues;
    setValues(initialValues);
  }, [initialValues]);

  const handleChange = useCallback((key: string, nextValue: unknown) => {
    // Отложенные фиксации полей могут приходить из таймеров; держим актуальный источник слияния.
    const nextValues = { ...valuesRef.current, [key]: nextValue };
    valuesRef.current = nextValues;
    setValues(nextValues);
    onChange?.(nextValues);
  }, [onChange]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit?.(valuesRef.current);
  };

  return (
    <form className="titanic-form" onSubmit={handleSubmit}>
      {schema.title ? <h2 className="titanic-form__title">{schema.title}</h2> : null}
      <GridComponent>
        {schema.columns.map((column) => (
          <FieldComponent
            key={getColumnKey(column)}
            column={column}
            values={values}
            onChange={handleChange}
            disabled={disabled}
            manualCommitDelayMs={manualCommitDelayMs}
          />
        ))}
      </GridComponent>
      {onSubmit ? (
        <div className="titanic-form__actions">
          <button className="titanic-button" type="submit" disabled={disabled}>
            {submitLabel}
          </button>
        </div>
      ) : null}
    </form>
  );
}
