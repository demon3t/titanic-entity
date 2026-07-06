import type { ConditionOperator } from "../enums/ConditionOperator";
import type { EntityLogicalOperation } from "../enums/EntityLogicalOperation";

/**
 * Leaf-фильтр или вложенная группа фильтров ESQ.
 */
export interface ESQFilterJsonModel {
  /** ORM-путь колонки leaf-фильтра. */
  path?: string;

  /** Оператор сравнения leaf-фильтра. */
  comparisonType?: ConditionOperator;

  /** Первое значение фильтра. */
  value?: unknown;

  /** Второе значение фильтра для диапазона. */
  secondValue?: unknown;

  /** Признак включенного фильтра или группы. */
  isEnabled?: boolean;

  /** Инвертировать leaf-фильтр. */
  isNot?: boolean;

  /** Логическая операция между вложенными фильтрами группы. */
  logicalOperation?: EntityLogicalOperation;

  /** Вложенные фильтры. Если заполнены, элемент считается группой. */
  items?: ESQFilterJsonModel[];
}