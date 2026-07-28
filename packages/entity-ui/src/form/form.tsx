import { defineComponentSchema, useUiComponent } from "@titanic-entity/entity-base";
import { getColumnKey, type EntityDisplayValues, type EntitySchema, type EntityValues } from "@titanic-entity/entity-core";
import { Titanic } from "@titanic-entity/entity-react";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";
import type { FormEvent } from "react";
import { Button, type ButtonProps } from "../button";
import { EntityField, type EntityFieldProps } from "../field";
import { EntityFieldProvider } from "../field/field-context";
import { Grid, type GridProps } from "../grid";
import { useEntityFormState } from "@titanic-entity/entity-react/headless";

/**
 * Props schema-driven Entity-С„РѕСЂРјС‹.
 */
export interface EntityFormProps {
  /** UI-СЃС…РµРјР° СЃСѓС‰РЅРѕСЃС‚Рё. */
  schema: EntitySchema;

  /** Р—РЅР°С‡РµРЅРёСЏ С„РѕСЂРјС‹. */
  value?: EntityValues;

  /** Display labels for lookup/reference values keyed by field name. */
  displayValues?: EntityDisplayValues;

  /** РћС‚РєР»СЋС‡РёС‚СЊ РїРѕР»СЏ Рё submit. */
  disabled?: boolean;

  /** РўРµРєСЃС‚ РєРЅРѕРїРєРё submit. */
  submitLabel?: string;

  /** Р—Р°РґРµСЂР¶РєР° РїРµСЂРµРґ С„РёРєСЃР°С†РёРµР№ СЂСѓС‡РЅРѕРіРѕ РІРІРѕРґР° С‚РµРєСЃС‚Р°/С‡РёСЃР»Р° РІ Р·РЅР°С‡РµРЅРёСЏ СЃСѓС‰РЅРѕСЃС‚Рё. */
  manualCommitDelayMs?: number;

  /** РћР±СЂР°Р±РѕС‚С‡РёРє РёР·РјРµРЅРµРЅРёСЏ Р·РЅР°С‡РµРЅРёР№. */
  onChange?: (values: EntityValues) => void;

  /** РћР±СЂР°Р±РѕС‚С‡РёРє submit С„РѕСЂРјС‹. */
  onSubmit?: (values: EntityValues) => void | Promise<void>;
}

/**
 * Renders a schema-driven form for creating and editing Entity records.
 */
export const EntityForm = Titanic.define<EntityFormProps>("Titanic.UI.EntityForm", function EntityForm({
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
  const GridComponent = useUiComponent<GridProps>("Grid", Grid);
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
});

export const formComponentSchema = defineComponentSchema<EntityFormProps>({
  kind: "component",
  name: entityReactComponentNames.EntityForm,
  component: EntityForm
});
