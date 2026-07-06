import type { EntitySchema, EntityValues } from "@titanic-entity/entity-core";

/**
 * Props schema-driven Entity-формы.
 */
export interface EntityFormProps {
  /** UI-схема сущности. */
  schema: EntitySchema;

  /** Значения формы. */
  value?: EntityValues;

  /** Отключить поля и submit. */
  disabled?: boolean;

  /** Текст кнопки submit. */
  submitLabel?: string;

  /** Задержка перед фиксацией ручного ввода текста/числа в значения сущности. */
  manualCommitDelayMs?: number;

  /** Обработчик изменения значений. */
  onChange?: (values: EntityValues) => void;

  /** Обработчик submit формы. */
  onSubmit?: (values: EntityValues) => void | Promise<void>;
}
