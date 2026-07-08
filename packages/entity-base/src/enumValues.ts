import type { UiPackageEnumValues } from "./types";
import { Titanic } from "./Titanic";

export function toEnumValues(values: Record<string, string | number>): UiPackageEnumValues {
  return Titanic.Package.toEnumValues(values);
}
