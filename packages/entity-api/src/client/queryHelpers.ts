import type { ESQ } from "../models/ESQ";
import type {
  EntityQueryInput,
  EntityQueryJsonProvider
} from "../models/EntityQueryInput";

/** Converts an ESQ builder or raw payload to JSON. */
export function toEntityQueryJson(query: EntityQueryInput): ESQ {
  return isEntityQueryJsonProvider(query) ? query.toJson() : query;
}

/** Checks whether a value can be converted to ESQ JSON via `toJson()`. */
export function isEntityQueryJsonProvider(
  value: EntityQueryInput
): value is EntityQueryJsonProvider {
  return typeof value === "object"
    && value !== null
    && "toJson" in value
    && typeof (value as { toJson?: unknown }).toJson === "function";
}
