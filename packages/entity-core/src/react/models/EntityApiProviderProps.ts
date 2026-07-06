// React-инфраструктура 'EntityApiProviderProps' для подключения Entity API.
import type { ComponentType, ReactNode } from "react";
import type { EntityApiClient } from "@titanic/entity-api";

export type EntityApiClientCollection =
  | ReadonlyMap<string, EntityApiClient>
  | Record<string, EntityApiClient>;

export interface EntityApiAdditionalProvider<TProps extends object = Record<string, unknown>> {
  component: ComponentType<TProps & { children: ReactNode }>;
  props?: TProps;
}

export type EntityApiProviderClient = EntityApiClient & {
  providers?: readonly EntityApiAdditionalProvider[];
  clients?: EntityApiClientCollection;
};

export interface EntityApiProviderProps {
  client: EntityApiProviderClient;
  clients?: EntityApiClientCollection;
  providers?: readonly EntityApiAdditionalProvider[];
  children: ReactNode;
}
