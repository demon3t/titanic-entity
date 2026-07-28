import { EntityColumnKind, normalizeEntityColumn } from "@titanic-entity/entity-core";
import type { EntityFieldProps } from "./index";

export type InputKind =
  | "string"
  | "text"
  | "number"
  | "boolean"
  | "date"
  | "dateTime"
  | "time"
  | "color"
  | "lookup"
  | "json";

export interface InputResolution {
  fieldKind: EntityColumnKind;
  inputKind: InputKind;
}

export function resolveInput(column: EntityFieldProps["column"]): InputResolution {
  const resolvedColumn = normalizeEntityColumn(column);
  const fieldKind = resolvedColumn.kind ?? EntityColumnKind.String;

  switch (fieldKind) {
    case EntityColumnKind.Text:
      return { fieldKind, inputKind: "text" };
    case EntityColumnKind.Number:
      return { fieldKind, inputKind: "number" };
    case EntityColumnKind.Boolean:
      return { fieldKind, inputKind: "boolean" };
    case EntityColumnKind.Date:
      return { fieldKind, inputKind: "date" };
    case EntityColumnKind.DateTime:
      return { fieldKind, inputKind: "dateTime" };
    case EntityColumnKind.Time:
      return { fieldKind, inputKind: "time" };
    case EntityColumnKind.Color:
      return { fieldKind, inputKind: "color" };
    case EntityColumnKind.Lookup:
      return { fieldKind, inputKind: "lookup" };
    case EntityColumnKind.Json:
      return { fieldKind, inputKind: "json" };
    default:
      return { fieldKind, inputKind: "string" };
  }
}

export const InputResolver = {
  resolve: resolveInput
};
