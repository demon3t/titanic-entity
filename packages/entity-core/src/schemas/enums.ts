export * from "./entityEnums";

import { entityCoreEntityEnumSchemas } from "./entityEnums";

export const entityCoreEnumSchemas = [
  ...entityCoreEntityEnumSchemas
] as const;

export const entityReactEnumSchemas = entityCoreEnumSchemas;
