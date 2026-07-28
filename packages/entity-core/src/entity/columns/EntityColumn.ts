import {
  coerceEntityColumnKind,
  EntityColumnKind,
  type EntityColumnKindInput
} from "../enums/EntityColumnKind";
import type { EntityJsonEditorOptions } from "../models/EntityJsonEditorOptions";
import type { EntityLookupInputMode, EntityLookupOptionsSource } from "../models/EntityLookupOptionsSource";
import type { LookupOption } from "../models/LookupOption";
import type { ColumnSubscriber } from "./ColumnSubscriber";

export interface EntityColumnOptions<TValue = unknown> {
  path?: string;
  alias?: string;
  label?: string;
  kind?: EntityColumnKindInput;
  required?: boolean;
  readOnly?: boolean;
  hidden?: boolean;
  placeholder?: string;
  gridSpan?: number;
  order?: number;
  maxLength?: number;
  options?: LookupOption[];
  lookup?: EntityLookupOptionsSource;
  lookupMode?: EntityLookupInputMode;
  jsonEditor?: EntityJsonEditorOptions;
  defaultValue?: TValue;
}

/**
 * Активная колонка Entity-модели с отслеживанием изменений.
 */
export abstract class EntityColumn<T> {
  /** Имя колонки или ORM-путь. */
  readonly name: string;
  readonly path: string;
  readonly alias?: string;
  readonly label?: string;
  readonly kind: EntityColumnKind;
  readonly required?: boolean;
  readonly readOnly?: boolean;
  readonly hidden?: boolean;
  readonly placeholder?: string;
  readonly gridSpan?: number;
  readonly order?: number;
  readonly maxLength?: number;
  readonly options?: LookupOption[];
  readonly lookup?: EntityLookupOptionsSource;
  readonly lookupMode?: EntityLookupInputMode;
  readonly jsonEditor?: EntityJsonEditorOptions;
  readonly defaultValue?: T;

  private readonly subscribers = new Map<string, ColumnSubscriber<T>>();
  private initialValue: T;
  private currentValue: T;
  private previousValue: T;

  /**
   * Создать активную колонку.
   */
  protected constructor(name: string, value: T, options: EntityColumnOptions<T> = {}) {
    this.name = name;
    this.path = options.path ?? name;
    this.alias = options.alias;
    this.label = options.label;
    this.kind = coerceEntityColumnKind(options.kind) ?? EntityColumnKind.String;
    this.required = options.required;
    this.readOnly = options.readOnly;
    this.hidden = options.hidden;
    this.placeholder = options.placeholder;
    this.gridSpan = options.gridSpan;
    this.order = options.order;
    this.maxLength = options.maxLength;
    this.options = options.options;
    this.lookup = options.lookup;
    this.lookupMode = options.lookupMode;
    this.jsonEditor = options.jsonEditor;
    this.defaultValue = options.defaultValue ?? value;
    this.initialValue = value;
    this.currentValue = value;
    this.previousValue = value;
  }

  /** Текущее значение колонки. */
  get value(): T {
    return this.currentValue;
  }

  set value(value: T | null | undefined) {
    this.set(value);
  }

  /** Предыдущее значение колонки. */
  get oldValue(): T {
    return this.previousValue;
  }

  /** Исходное значение после загрузки или acceptChanges. */
  get initValue(): T {
    return this.initialValue;
  }

  /** Признак изменения относительно исходного значения. */
  get isChanged(): boolean {
    return this.currentValue !== this.initialValue;
  }

  /**
   * Установить новое значение колонки.
   */
  set(value: T | null | undefined): void {
    const nextValue = this.cast(value);
    const oldValue = this.currentValue;
    if (Object.is(oldValue, nextValue)) {
      return;
    }

    this.previousValue = oldValue;
    this.currentValue = nextValue;
    for (const subscriber of this.subscribers.values()) {
      subscriber(nextValue, oldValue, this.initialValue);
    }
  }

  /**
   * Зафиксировать текущее значение как исходное.
   */
  acceptChanges(): void {
    this.initialValue = this.currentValue;
    this.previousValue = this.currentValue;
  }

  /**
   * Подписаться на изменения колонки.
   */
  subscribe(key: string, subscriber: ColumnSubscriber<T>): void {
    this.subscribers.set(key, subscriber);
  }

  /**
   * Отписаться от изменений колонки.
   */
  unsubscribe(key: string): void {
    this.subscribers.delete(key);
  }

  /**
   * Сериализовать состояние колонки.
   */
  toJSON(): { value: T; oldValue: T; initValue: T } {
    return {
      value: this.currentValue,
      oldValue: this.previousValue,
      initValue: this.initialValue
    };
  }

  /**
   * Привести входное значение к типу колонки.
   */
  protected abstract cast(value: T | null | undefined): T;
}
