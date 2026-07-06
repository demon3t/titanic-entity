import type { EntityApiColumnValueResponse } from "./EntityApiColumnValueResponse";

/**
 * Сущность, полученная из Entity API: alias/column name -> значение колонки.
 */
export type EntityApiEntity = Record<string, EntityApiColumnValueResponse>;