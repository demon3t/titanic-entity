// Вспомогательные преобразования значений сущностей для UI и Entity API.
import type { EntityApiColumnValueResponse } from "../models/EntityApiColumnValueResponse";
import type { EntityApiEntity } from "../models/EntityApiEntity";
import type { ESQFilterJsonModel } from "../models/ESQFilterJsonModel";
import type { ESQOrderJsonModel } from "../models/ESQOrderJsonModel";

export type EntityApiColumn<T = unknown> = EntityApiColumnValueResponse<T>;
export type EntityRow = EntityApiEntity;
export type EntityFilter = ESQFilterJsonModel;
export type EntityOrder = ESQOrderJsonModel;

export function getEntityValue<T>(row: EntityRow, key: string): T | null {
  return (row[key]?.value ?? null) as T | null;
}

export function getEntityDisplayValue(row: EntityRow, key: string): string {
  return String(row[key]?.displayValue ?? "");
}

export function sameEntityId(left: string | null | undefined, right: string | null | undefined): boolean {
  return (left ?? "").toLowerCase() === (right ?? "").toLowerCase();
}

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

export function createEntityGuid(): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (char) =>
    (Number(char) ^ Math.floor(Math.random() * 16) >> Number(char) / 4).toString(16));
}
