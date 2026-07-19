import type { TitanicCurrentUser } from "@titanic-entity/entity-base";

export type EntityCurrentUserResult<TCurrentUser extends TitanicCurrentUser = TitanicCurrentUser> =
  TCurrentUser | null | undefined;

export type EntityCurrentUserProvider<TCurrentUser extends TitanicCurrentUser = TitanicCurrentUser> =
  () => EntityCurrentUserResult<TCurrentUser> | Promise<EntityCurrentUserResult<TCurrentUser>>;

/** Configuration for {@link EntityApiClient}. */
export interface ApiClientOptions {
  /** Optional application base URL, without a trailing slash. */
  baseUrl?: string;

  /** Relative or absolute path to the Entity API manager endpoint. */
  apiPath: string;

  /** Lazy factory for auth and context headers added to every request. */
  getHeaders?: () => Record<string, string> | Promise<Record<string, string>>;

  /** Lazy factory used to resolve current-user information for Titanic.CurrentUser. */
  getCurrentUser?: EntityCurrentUserProvider;

  /** Custom `fetch` implementation used for tests, SSR, or polyfills. */
  fetchImpl?: typeof fetch;
}
