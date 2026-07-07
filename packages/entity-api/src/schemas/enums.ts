export * from "./apiEnums";

import { entityApiEnumSchemas } from "./apiEnums";

/** Complete list of schemas exposed by the `entity-api` package. */
export const entityApiSchemas = [
  ...entityApiEnumSchemas
] as const;

/** Backward-compatible alias for `entityApiSchemas`. */
export const entityReactApiSchemas = entityApiSchemas;
