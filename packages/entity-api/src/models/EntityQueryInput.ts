import type { ESQ } from "./ESQ";

/** ESQ builder-like object that can emit a plain API payload. */
export interface EntityQueryJsonProvider {
  /** Builds an ESQ JSON payload. */
  toJson(): ESQ;
}

/** Supported input for Entity API select queries. */
export type EntityQueryInput = ESQ | EntityQueryJsonProvider;
