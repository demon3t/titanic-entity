import type { ESQColumnJsonModel } from "./ESQColumnJsonModel";
import type { ESQFilterCollectionJsonModel } from "./ESQFilterCollectionJsonModel";
import type { ESQOrderJsonModel } from "./ESQOrderJsonModel";

/**
 * JSON-модель Entity Schema Query для чтения сущностей через HTTP API.
 */
export interface ESQJsonModel {
  /** Имя таблицы сущности. */
  tableName?: string | null;

  /** Имя CLR-типа сущности на backend. */
  entityTypeName?: string | null;

  /** Колонки результата. */
  columns?: ESQColumnJsonModel[];

  /** Фильтры запроса. */
  filters?: ESQFilterCollectionJsonModel;

  /** ORM-пути колонок группировки. */
  groupBy?: string[];

  /** Сортировки запроса. */
  orders?: ESQOrderJsonModel[];

  /** Выбирать только уникальные строки. */
  isDistinct?: boolean;

  /** Выбрать все колонки корневой сущности. */
  allColumns?: boolean;

  /** Количество строк, которое нужно пропустить. */
  skipRowCount?: number | null;

  /** Alias для skipRowCount. */
  skipRow?: number | null;

  /** Максимальное количество строк. */
  rowCount?: number | null;
}