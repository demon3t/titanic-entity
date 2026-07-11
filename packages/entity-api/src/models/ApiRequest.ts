import type { EntityApiOperationType } from "../enums/EntityApiOperationType";
import type { ESQ } from "./ESQ";

/** Single manager request payload for the Entity API endpoint. */
export interface ApiRequest {
  /** Optional operation name, mainly used inside batch requests. */
  name?: string | null;

  /** Operation type that should be executed by the backend. */
  operation: EntityApiOperationType;

  /** Optional ESQ payload used by select and filter-based delete operations. */
  query?: ESQ | null;

  /** Target table name for save and delete operations. */
  tableName?: string | null;

  /** Optional backend CLR type name for the entity. */
  entityTypeName?: string | null;

  /** Column values for save or equality filters for simple delete operations. */
  values?: Record<string, unknown>;
}
