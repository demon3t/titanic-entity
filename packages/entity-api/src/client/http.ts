/** Generic JSON request options for lightweight HTTP helpers. */
export interface JsonRequestOptions {
  /** HTTP method used for the request. */
  method?: string;

  /** Optional request body that will be JSON-serialized. */
  body?: unknown;

  /** Additional request headers. */
  headers?: Record<string, string>;

  /** Custom `fetch` implementation used for tests, SSR, or polyfills. */
  fetchImpl?: typeof fetch;
}

/**
 * Executes an HTTP request and parses its JSON response.
 *
 * @param url Target request URL.
 * @param options Request options.
 */
export async function fetchJson<T>(url: string, options: JsonRequestOptions = {}): Promise<T> {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis);
  const response = await fetchImpl(url, {
    method: options.method ?? "GET",
    headers: {
      ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
      Accept: "application/json",
      ...options.headers
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = data && typeof data === "object" && "error" in data
      ? String((data as { error?: unknown }).error)
      : `HTTP ${response.status}`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
