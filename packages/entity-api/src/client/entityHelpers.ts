import type { ApiColumnValueResponse } from "../models/ApiColumnValueResponse";
import type { ApiEntity } from "../models/ApiEntity";
import type { ESQFilter } from "../models/ESQFilter";
import type { ESQOrder } from "../models/ESQOrder";

/** Short alias for {@link ApiColumnValueResponse}. */
export type ApiColumn<T = unknown> = ApiColumnValueResponse<T>;

/** Short alias for {@link ApiEntity}. */
export type ApiEntityRow = ApiEntity;

/** Legacy alias for {@link ApiColumn}. */
export type EntityApiColumn<T = unknown> = ApiColumn<T>;

/** Legacy alias for {@link ApiEntityRow}. */
export type EntityRow = ApiEntityRow;

/** Short alias for {@link ESQFilter}. */
export type EntityFilter = ESQFilter;

/** Short alias for {@link ESQOrder}. */
export type EntityOrder = ESQOrder;

/**
 * Reads the raw value of a column from an Entity API row.
 *
 * @param row Entity row returned by the API.
 * @param key Column alias or path.
 */
export function getEntityValue<T>(row: EntityRow, key: string): T | null {
  return (row[key]?.value ?? null) as T | null;
}

/**
 * Reads the display value of a column from an Entity API row.
 *
 * @param row Entity row returned by the API.
 * @param key Column alias or path.
 */
export function getEntityDisplayValue(row: EntityRow, key: string): string {
  return String(row[key]?.displayValue ?? "");
}

/**
 * Compares two entity identifiers using case-insensitive semantics.
 *
 * @param left First identifier.
 * @param right Second identifier.
 */
export function sameEntityId(left: string | null | undefined, right: string | null | undefined): boolean {
  return (left ?? "").toLowerCase() === (right ?? "").toLowerCase();
}

/**
 * Normalizes and validates a user profile key before persistence.
 *
 * @param key Raw profile key.
 */
export function normalizeEntityProfileKey(key: string): string {
  const value = key.trim();
  if (!value) {
    throw new Error("Profile key is required.");
  }

  if (value.length > 256) {
    throw new Error("Profile key is too long.");
  }

  return value;
}

/** Creates a GUID-like identifier suitable for client-side entity creation. */
export function createEntityGuid(): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (char) =>
    (Number(char) ^ Math.floor(Math.random() * 16) >> Number(char) / 4).toString(16));
}
