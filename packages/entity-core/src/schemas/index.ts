export * from "./entityEnums";
export * from "./enums";

import { entityCoreEnumSchemas } from "./enums";

export const entityCoreSchemas = [
  ...entityCoreEnumSchemas
] as const;

export const entityReactCoreSchemas = entityCoreSchemas;
export const entityReactEntitySchemas = entityCoreSchemas;
