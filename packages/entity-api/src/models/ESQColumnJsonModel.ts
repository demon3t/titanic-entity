import type { EntityAggregationType } from "../enums/EntityAggregationType";

/**
 * Колонка, которую нужно прочитать в ESQ-запросе.
 */
export interface ESQColumnJsonModel {
  /** ORM-путь колонки. */
  path: string;

  /** Алиас результата. */
  alias?: string | null;

  /** Тип агрегатной функции. */
  aggregationType?: EntityAggregationType;
}