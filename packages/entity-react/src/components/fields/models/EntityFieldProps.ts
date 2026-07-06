import type { EntityColumnSchema, EntityDisplayValues, EntityValues } from "@titanic/entity-core";

/**
 * Props компонента одного поля Entity-формы.
 */
export interface EntityFieldProps {
  /** Описание колонки. */
  column: EntityColumnSchema;

  /** Текущие значения формы. */
  values: EntityValues;

  /** Display values, загруженные из Entity ORM API. */
  displayValues?: EntityDisplayValues;

  /** Обработчик изменения значения. */
  onChange: (key: string, value: unknown) => void;

  /** Отключить поле. */
  disabled?: boolean;

  /** Дополнительный CSS class. */
  className?: string;

  /** Задержка перед фиксацией ручного ввода текста/числа в значения сущности. */
  manualCommitDelayMs?: number;
}
