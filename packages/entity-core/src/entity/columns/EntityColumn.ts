import type { ColumnSubscriber } from "./ColumnSubscriber";

/**
 * Runtime-колонка Entity-модели с отслеживанием изменений.
 */
export abstract class EntityColumn<T> {
  /** Имя колонки или ORM-путь. */
  readonly name: string;

  private readonly subscribers = new Map<string, ColumnSubscriber<T>>();
  private initialValue: T;
  private currentValue: T;
  private previousValue: T;

  /**
   * Создать runtime-колонку.
   */
  protected constructor(name: string, value: T) {
    this.name = name;
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
   * Сериализовать runtime-состояние колонки.
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