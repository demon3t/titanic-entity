import type { EntityApiEntity } from "@titanic/entity-api";
import type { EntitySchema } from "@titanic/entity-core";

/**
 * Props schema-driven таблицы Entity API результатов.
 */
export interface EntityTableProps {
  /** UI-схема сущности. */
  schema: EntitySchema;

  /** Строки таблицы в формате Entity API. */
  rows: EntityApiEntity[];

  /** Показывать состояние загрузки. */
  loading?: boolean;

  /** Текст пустого состояния. */
  emptyText?: string;

  /** Обработчик клика по строке. */
  onRowClick?: (row: EntityApiEntity) => void;
}
