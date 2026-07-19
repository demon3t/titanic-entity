import { defineComponentSchema } from "@titanic-entity/entity-base";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";
import type { FormEvent } from "react";
import { getColumnKey } from "@titanic-entity/entity-core";
import type { EntityFormProps } from "./form-props";
import { Button, type ButtonProps } from "../button";
import { EntityField } from "../field";
import { EntityFieldProvider } from "../field/field-context";
import type { EntityFieldProps } from "../field/field-props";
import { EntityGrid } from "../grid";
import type { EntityGridProps } from "../grid/grid-props";
import { useUiComponent } from "@titanic-entity/entity-base";
import { useEntityFormState } from "@titanic-entity/entity-react/headless";

export type { EntityFormProps } from "./form-props";

/**
 * Renders a schema-driven form for creating and editing Entity records.
 */
export function EntityForm({
  schema,
  value,
  displayValues,
  disabled,
  submitLabel = "Сохранить",
  manualCommitDelayMs,
  onChange,
  onSubmit
}: EntityFormProps) {
  const ButtonComponent = useUiComponent<ButtonProps>("Button", Button);
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
      <EntityFieldProvider value={{ values, displayValues, onChange: setValue, disabled, manualCommitDelayMs }}>
        <GridComponent>
          {schema.columns.map((column) => (
            <FieldComponent
              key={getColumnKey(column)}
              column={column}
              displayValues={displayValues}
              values={values}
              onChange={setValue}
              disabled={disabled}
              manualCommitDelayMs={manualCommitDelayMs}
            />
          ))}
        </GridComponent>
      </EntityFieldProvider>
      {onSubmit ? (
        <div className="titanic-form__actions">
          <ButtonComponent type="submit" disabled={disabled}>
            {submitLabel}
          </ButtonComponent>
        </div>
      ) : null}
    </form>
  );
}

export const formComponentSchema = defineComponentSchema<EntityFormProps>({
  kind: "component",
  name: entityReactComponentNames.EntityForm,
  component: EntityForm
});
