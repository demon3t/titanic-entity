import type { EntityColumnDefinition, EntityDisplayValues, EntityValues } from "@titanic-entity/entity-core";

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
