import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createEmptyValues, type EntitySchema, type EntityValues } from "@titanic-entity/entity-core";

export type EntityFormValuesUpdater = EntityValues | ((values: EntityValues) => EntityValues);

/**
 * Configures state management for a schema-driven entity form.
 */
export interface EntityFormStateOptions {
  /** Entity schema used to create empty form values. */
  schema: EntitySchema;

  /** Controlled values used as the form state source. */
  value?: EntityValues;

  /** Called after a field or the whole values object changes. */
  onChange?: (values: EntityValues) => void;
}

/**
 * Headless state API consumed by EntityForm and custom form renderers.
 */
export interface EntityFormState {
  /** Current form values for rendering. */
  values: EntityValues;

  /** Returns the latest form values, including delayed field commits. */
  getValues: () => EntityValues;

  /** Updates a single form value by key. */
  setValue: (key: string, value: unknown) => void;

  /** Updates the whole values object or derives it from the current values. */
  setValues: (updater: EntityFormValuesUpdater) => void;
}

/**
 * Creates a headless state controller for schema-driven entity forms.
 */
export function useEntityFormState({ schema, value, onChange }: EntityFormStateOptions): EntityFormState {
  const initialValues = useMemo(() => value ?? createEmptyValues(schema), [schema, value]);
  const [values, setValuesState] = useState(initialValues);
  const valuesRef = useRef(initialValues);

  useEffect(() => {
    valuesRef.current = initialValues;
    setValuesState(initialValues);
  }, [initialValues]);

  const getValues = useCallback(() => valuesRef.current, []);

  const setValues = useCallback((updater: EntityFormValuesUpdater) => {
    const nextValues = typeof updater === "function" ? updater(valuesRef.current) : updater;

    valuesRef.current = nextValues;
    setValuesState(nextValues);
    onChange?.(nextValues);
  }, [onChange]);

  const setValue = useCallback((key: string, nextValue: unknown) => {
    setValues((currentValues) => ({ ...currentValues, [key]: nextValue }));
  }, [setValues]);

  return {
    values,
    getValues,
    setValue,
    setValues
  };
}
