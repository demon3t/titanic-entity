import type { EntityFieldKind } from "../enums/EntityFieldKind";
import type { EntityJsonEditorOptions } from "./EntityJsonEditorOptions";
import type { EntityLookupOptionsSource } from "./EntityLookupOptionsSource";
import type { LookupOption } from "./LookupOption";

/**
 * UI-описание одной колонки Entity-сущности.
 */
export interface EntityColumnSchema<TValue = unknown> {
  /** ORM-путь колонки. */
  path: string;

  /** Алиас результата, если он отличается от пути. */
  alias?: string;

  /** Подпись поля или колонки таблицы. */
  label?: string;

  /** Тип UI-компонента поля. */
  kind?: EntityFieldKind;

  /** Признак обязательного поля. */
  required?: boolean;

  /** Признак поля только для чтения. */
  readOnly?: boolean;

  /** Скрывать колонку в форме и таблице. */
  hidden?: boolean;

  /** Placeholder поля ввода. */
  placeholder?: string;

  /** Количество колонок layout grid, занимаемых полем. */
  gridSpan?: number;

  /** Порядок поля внутри настраиваемого layout формы. */
  order?: number;

  /** Максимальная длина текстового значения. */
  maxLength?: number;

  /** Опции lookup/select поля. */
  options?: LookupOption[];

  /** Источник Entity ORM API для lookup/select-опций. */
  lookup?: EntityLookupOptionsSource;

  jsonEditor?: EntityJsonEditorOptions;

  /** Значение по умолчанию для новой сущности. */
  defaultValue?: TValue;
}
