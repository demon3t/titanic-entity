import type { ESQFilterCollectionJsonModel, ESQFilterJsonModel, ESQOrderJsonModel } from "@titanic/entity-api";

/**
 * Источник Entity ORM API для lookup-опций. Backend локализует возвращаемые
 * значения через UserConnection, поэтому UI только преобразует строки API в элементы select.
 */
export interface EntityLookupOptionsSource {
  /** Имя справочной таблицы из метаданных Entity ORM. */
  tableName?: string | null;

  /** Необязательное имя CLR-типа Entity, если tableName не используется. */
  entityTypeName?: string | null;

  /** Колонка, сырое значение которой сохраняет поле. По умолчанию Id. */
  valueColumn?: string;

  /** Колонка, отображаемая пользователю. По умолчанию Name. */
  displayColumn?: string;

  /** Алиас колонки значения в ответе API. */
  valueAlias?: string;

  /** Алиас отображаемой колонки в ответе API. */
  displayAlias?: string;

  /** Необязательные фильтры справочника. */
  filters?: ESQFilterCollectionJsonModel | ESQFilterJsonModel[];

  /** Необязательная сортировка справочника. По умолчанию displayColumn ASC. */
  orders?: ESQOrderJsonModel[];

  /** Максимальное количество запрашиваемых опций. */
  rowCount?: number;

  /** Отключить загрузку через API без удаления метаданных источника. */
  enabled?: boolean;
}
