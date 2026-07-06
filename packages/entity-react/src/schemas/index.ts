export * from "./components";
export * from "./entity";
export * from "./enums";
export * from "./fields";
export * from "./grids";
export * from "./templates";
export * from "./ui";

export const entityReactComponentSchemas = [] as const;
export const entityReactEntitySchemas = [] as const;
export const entityReactEnumSchemas = [] as const;
export const entityReactFieldSchemas = [] as const;
export const entityReactGridSchemas = [] as const;
export const entityReactTemplateSchemas = [] as const;
export const entityReactUiSchemas = [] as const;

export const entityReactSchemas = [
  ...entityReactComponentSchemas,
  ...entityReactEntitySchemas,
  ...entityReactEnumSchemas,
  ...entityReactFieldSchemas,
  ...entityReactGridSchemas,
  ...entityReactTemplateSchemas,
  ...entityReactUiSchemas
] as const;
