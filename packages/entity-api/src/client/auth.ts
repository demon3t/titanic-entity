import { Titanic, type TitanicCurrentUser } from "@titanic-entity/entity-base";
import type {
  EntityCurrentUserProvider,
  EntityCurrentUserResult
} from "../models/ApiClientOptions";

export interface EntityAuthorization<TCurrentUser extends TitanicCurrentUser = TitanicCurrentUser> {
  getCurrentUser: EntityCurrentUserProvider<TCurrentUser>;
}

/**
 * Resolves current-user information through an authorization contract and stores it on Titanic.CurrentUser.
 *
 * @param authorization Current-user provider or authorization service.
 */
export async function resolveCurrentUser<TCurrentUser extends TitanicCurrentUser = TitanicCurrentUser>(
  authorization: EntityAuthorization<TCurrentUser> | EntityCurrentUserProvider<TCurrentUser>
): Promise<EntityCurrentUserResult<TCurrentUser>> {
  const currentUser = typeof authorization === "function"
    ? await authorization()
    : await authorization.getCurrentUser();

  return Titanic.setCurrentUser(currentUser);
}

/**
 * Creates a bearer authorization header map for the provided token.
 *
 * @param token JWT access token, if available.
 */
export function createBearerAuthHeaders(token: string | null | undefined): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Decodes a JWT payload into a plain object.
 *
 * @param token JWT token in `header.payload.signature` form.
 */
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

/**
 * Extracts the user identifier from a JWT token payload.
 *
 * @param token JWT access token.
 */
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
