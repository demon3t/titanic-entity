import type { EntityLogicalOperation } from "../enums/EntityLogicalOperation";
import type { ESQFilterJsonModel } from "./ESQFilterJsonModel";

/**
 * Корневая коллекция фильтров ESQ.
 */
export interface ESQFilterCollectionJsonModel {
  /** Признак включенной коллекции фильтров. */
  isEnabled?: boolean;

  /** Логическая операция между прямыми элементами коллекции. */
  logicalOperation?: EntityLogicalOperation;

  /** Leaf-фильтры и вложенные группы. */
  items?: ESQFilterJsonModel[];
}