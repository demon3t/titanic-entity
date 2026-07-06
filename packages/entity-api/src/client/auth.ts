export function createBearerAuthHeaders(token: string | null | undefined): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function decodeJwtPayload(token: string): Record<string, unknown> {
  const payload = token.split(".")[1];
  if (!payload) {
    throw new Error("Authentication token is invalid.");
  }

  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const json = decodeURIComponent(Array.from(binary, (char) =>
    `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`).join(""));
  return JSON.parse(json) as Record<string, unknown>;
}

export function getJwtUserId(token: string | null | undefined): string {
  if (!token) {
    throw new Error("Authentication token is missing.");
  }

  const payload = decodeJwtPayload(token);
  const id = payload.nameid
    ?? payload.sub
    ?? payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

  if (typeof id !== "string" || !id) {
    throw new Error("Token does not contain user id.");
  }

  return id;
}
