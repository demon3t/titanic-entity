// Модель обмена данными Entity ORM API для 'EntitySelectRequest'.
import type { ESQFilterJsonModel } from "./ESQFilterJsonModel";
import type { ESQOrderJsonModel } from "./ESQOrderJsonModel";
import type { EntityQueryInput } from "../query";

export interface EntitySelectRequest {
  tableName: string;
  columns?: string[];
  filters?: ESQFilterJsonModel[];
  orders?: ESQOrderJsonModel[];
  rowCount?: number;
  allColumns?: boolean;
  query?: EntityQueryInput;
}
