/** Configuration for {@link EntityApiClient}. */
export interface ApiClientOptions {
  /** Optional application base URL, without a trailing slash. */
  baseUrl?: string;

  /** Relative or absolute path to the Entity API manager endpoint. */
  apiPath: string;

  /** Lazy factory for auth and context headers added to every request. */
  getHeaders?: () => Record<string, string> | Promise<Record<string, string>>;

  /** Custom `fetch` implementation used for tests, SSR, or polyfills. */
  fetchImpl?: typeof fetch;
}
