/**
 * Настройки HTTP-клиента Entity API.
 */
export interface EntityApiClientOptions {
  /** Базовый URL backend-приложения. */
  baseUrl?: string;

  /** Базовый путь Entity API manager-а. */
  apiPath: string;

  /** Фабрика HTTP-заголовков авторизации и пользовательского контекста. */
  getHeaders?: () => Record<string, string> | Promise<Record<string, string>>;

  /** Альтернативная реализация fetch для тестов или SSR. */
  fetchImpl?: typeof fetch;
}