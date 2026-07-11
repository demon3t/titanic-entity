import type { EntityColumnSchema, EntityDisplayValues, EntityValues } from "@titanic-entity/entity-core";

export interface EntityFieldProps {
  column: EntityColumnSchema;
  values: EntityValues;
  displayValues?: EntityDisplayValues;
  validationError?: string | null;
  validationErrors?: Record<string, string | null | undefined>;
  onChange: (key: string, value: unknown) => void;
  disabled?: boolean;
  className?: string;
  manualCommitDelayMs?: number;
}
