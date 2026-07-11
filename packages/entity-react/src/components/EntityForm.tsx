import type { FormEvent } from "react";
import { getColumnKey } from "@titanic-entity/entity-core";
import type { EntityFormProps } from "./models/EntityFormProps";
import { EntityField } from "./fields/EntityField";
import type { EntityFieldProps } from "./fields/models/EntityFieldProps";
import { EntityGrid } from "./layout/EntityGrid";
import type { EntityGridProps } from "./layout/models/EntityGridProps";
import { useEntityFormState } from "../headless/entityFormState";
import { useUiComponent } from "../react/UiPackageProvider";

export type { EntityFormProps } from "./models/EntityFormProps";

/**
 * Renders a schema-driven form for creating and editing Entity records.
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
  const { values, getValues, setValue } = useEntityFormState({ schema, value, onChange });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit?.(getValues());
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
            onChange={setValue}
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
