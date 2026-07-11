// React-инфраструктура 'EntityApiProvider' для подключения Entity API.
import { createContext, useContext, useMemo } from "react";
import type { EntityApiClient } from "@titanic-entity/entity-api";
import type {
  EntityApiAdditionalProvider,
  EntityApiClientCollection,
  EntityApiProviderProps
} from "./models/EntityApiProviderProps";

export type {
  EntityApiAdditionalProvider,
  EntityApiClientCollection,
  EntityApiProviderClient,
  EntityApiProviderProps
} from "./models/EntityApiProviderProps";

const EntityApiContext = createContext<EntityApiClient | null>(null);
const EntityApiClientsContext = createContext<ReadonlyMap<string, EntityApiClient> | null>(null);

export function EntityApiProvider({ client, children, clients, providers }: EntityApiProviderProps) {
  const clientMap = useMemo(
    () => createEntityApiClientMap(client, clients),
    [client, clients]
  );
  const configuredChildren = renderAdditionalProviders(children, [
    ...(client.providers ?? []),
    ...(providers ?? [])
  ]);

  return (
    <EntityApiContext.Provider value={client}>
      <EntityApiClientsContext.Provider value={clientMap}>
        {configuredChildren}
      </EntityApiClientsContext.Provider>
    </EntityApiContext.Provider>
  );
}

export function useEntityApiClient(name?: string): EntityApiClient {
  const client = useContext(EntityApiContext);
  const clients = useContext(EntityApiClientsContext);
  if (!client) {
    throw new Error("useEntityApiClient must be used inside EntityApiProvider.");
  }

  if (!name) {
    return client;
  }

  const namedClient = clients?.get(name);
  if (!namedClient) {
    throw new Error(`Entity API client "${name}" is not registered.`);
  }

  return namedClient;
}

export function useOptionalEntityApiClient(name?: string): EntityApiClient | null {
  const client = useContext(EntityApiContext);
  const clients = useContext(EntityApiClientsContext);
  if (!client || !name) {
    return client;
  }

  return clients?.get(name) ?? null;
}

function renderAdditionalProviders(
  children: EntityApiProviderProps["children"],
  providers: readonly EntityApiAdditionalProvider[]
) {
  return providers.reduceRight((content, providerConfig) => {
    const Provider = providerConfig.component;
    return <Provider {...(providerConfig.props ?? {})}>{content}</Provider>;
  }, children);
}

function createEntityApiClientMap(
  client: EntityApiProviderProps["client"],
  propClients: EntityApiClientCollection | undefined
): ReadonlyMap<string, EntityApiClient> {
  const clients = new Map<string, EntityApiClient>([["default", client]]);

  addEntityApiClients(clients, client.clients);
  addEntityApiClients(clients, propClients);

  return clients;
}

function addEntityApiClients(
  target: Map<string, EntityApiClient>,
  clients: EntityApiClientCollection | undefined
): void {
  if (!clients) {
    return;
  }

  if (clients instanceof Map) {
    for (const [name, client] of clients) {
      target.set(name, client);
    }

    return;
  }

  for (const [name, client] of Object.entries(clients)) {
    target.set(name, client);
  }
}
