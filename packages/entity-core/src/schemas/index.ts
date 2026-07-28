export * from "./entityEnums";
export * from "./enums";

import { entityCoreEnumSchemas } from "./enums";

export const entityCoreSchemas = [
  ...entityCoreEnumSchemas
] as const;
