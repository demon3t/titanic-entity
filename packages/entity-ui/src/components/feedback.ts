import { defineComponentSchema } from "@titanic-entity/entity-base";
import { RandomGifLoader, type RandomGifLoaderProps } from "@titanic-entity/entity-react/components";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";

export const randomGifLoaderComponentSchema = defineComponentSchema<RandomGifLoaderProps>({
  kind: "component",
  name: entityReactComponentNames.RandomGifLoader,
  component: RandomGifLoader
});

export const entityUiFeedbackComponentSchemas = [
  randomGifLoaderComponentSchema
] as const;
