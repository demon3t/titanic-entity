import type { EntityApiOperationType } from "../enums/EntityApiOperationType";
import type { ESQJsonModel } from "./ESQJsonModel";

/**
 * Единая HTTP-модель операции Entity API.
 */
export interface EntityApiRequest {
  /** Имя операции внутри batch-запроса. */
  name?: string | null;

  /** Тип выполняемой операции. */
  operation: EntityApiOperationType;

  /** ESQ-модель для Select/Delete по фильтру. */
  query?: ESQJsonModel | null;

  /** Имя таблицы для Save/Delete. */
  tableName?: string | null;

  /** Имя CLR-типа сущности для Save/Delete. */
  entityTypeName?: string | null;

  /** Значения колонок или простые equality-фильтры Delete. */
  values?: Record<string, unknown>;
}