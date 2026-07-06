export * from "./apiEnums";

import { entityApiEnumSchemas } from "./apiEnums";

export const entityApiSchemas = [
  ...entityApiEnumSchemas
] as const;

export const entityReactApiSchemas = entityApiSchemas;
