import type { EntityColumnDefinition } from "./EntityColumnSchema";

/**
 * UI-описание Entity-сущности для форм, таблиц и ESQ-запросов.
 */
export interface EntitySchema {
  /** Имя таблицы Entity ORM. */
  tableName: string;

  /** ORM-путь primary key колонки. */
  primaryColumn?: string;

  /** ORM-путь display-колонки. */
  displayColumn?: string;

  /** Заголовок формы или раздела. */
  title?: string;

  /** Колонки сущности. */
  columns: EntityColumnDefinition[];
}
