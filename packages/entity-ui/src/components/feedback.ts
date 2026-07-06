import { defineComponentSchema } from "@titanic-entity/entity-base";
import { RandomGifLoader, entityReactComponentNames, type RandomGifLoaderProps } from "@titanic-entity/entity-react";

export const randomGifLoaderComponentSchema = defineComponentSchema<RandomGifLoaderProps>({
  kind: "component",
  name: entityReactComponentNames.RandomGifLoader,
  component: RandomGifLoader
});

export const entityUiFeedbackComponentSchemas = [
  randomGifLoaderComponentSchema
] as const;
