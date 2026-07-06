import type { EntityOrderDirection } from "../enums/EntityOrderDirection";

/**
 * Сортировка ESQ-запроса.
 */
export interface ESQOrderJsonModel {
  /** ORM-путь колонки сортировки. */
  path: string;

  /**
   * Направление сортировки.
   * `0` - сортировка ASC, `1` - сортировка DESC.
   */
  direction?: EntityOrderDirection;

  /**
   * Legacy-признак сортировки по убыванию.
   * Используется только для совместимости со старыми запросами.
   */
  desc?: boolean;
}
