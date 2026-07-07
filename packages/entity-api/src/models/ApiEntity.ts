import type { ApiColumnValueResponse } from "./ApiColumnValueResponse";

/** Entity row returned by the Entity API, keyed by alias or column path. */
export type ApiEntity = Record<string, ApiColumnValueResponse>;
