// HTTP-утилиты для нормализации ответов Entity API.
export interface JsonRequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  fetchImpl?: typeof fetch;
}

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
