import { createContext, useContext, type ReactNode } from "react";
import type { EntityDisplayValues, EntityValues } from "@titanic-entity/entity-core";
import { Titanic } from "@titanic-entity/entity-react";
import type { EntityFieldProps } from "./field-props";

export interface EntityFieldContextValue {
  values?: EntityValues;
  displayValues?: EntityDisplayValues;
  validationErrors?: Record<string, string | null | undefined>;
  disabled?: boolean;
  manualCommitDelayMs?: number;
  onChange?: EntityFieldProps["onChange"];
}

export interface EntityFieldProviderProps {
  value: EntityFieldContextValue;
  children: ReactNode;
}

const EntityFieldContext = createContext<EntityFieldContextValue | null>(null);

export function EntityFieldProvider({ value, children }: EntityFieldProviderProps) {
  return (
    <EntityFieldContext.Provider value={value}>
      {children}
    </EntityFieldContext.Provider>
  );
}

export function useEntityFieldContext(): EntityFieldContextValue | null {
  return useContext(EntityFieldContext);
}

const uiNamespace = ((Titanic as any).UI ??= {});
uiNamespace.useEntityFieldContext = useEntityFieldContext;
