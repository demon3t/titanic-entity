import { defineComponentSchema, defineFieldSchema } from "@titanic-entity/entity-base";
import type { EntityColumnDefinition, EntityDisplayValues, EntityValues } from "@titanic-entity/entity-core";
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import { entityReactComponentNames, entityReactFieldNames } from "@titanic-entity/entity-react/model";
import "./field-context";
import "./input-builder";
import "./field";

export interface EntityFieldProps {
  column: EntityColumnDefinition;
  values?: EntityValues;
  displayValues?: EntityDisplayValues;
  validationError?: string | null;
  validationErrors?: Record<string, string | null | undefined>;
  onChange?: (key: string, value: unknown) => void;
  disabled?: boolean;
  className?: string;
  manualCommitDelayMs?: number;
}

export const EntityField = Titanic.getReactModule<DefinedEntityReactComponent<EntityFieldProps>>(
  "Titanic.UI.EntityField"
)!;

export const fieldComponentSchema = defineComponentSchema<EntityFieldProps>({
  kind: "component",
  name: entityReactComponentNames.EntityField,
  component: EntityField
});

export const fieldSchema = defineFieldSchema<EntityFieldProps>({
  kind: "field",
  name: entityReactFieldNames.EntityField,
  component: EntityField
});

export * from "./field-context";
export * from "./input-builder";
export * from "./input-resolver";
