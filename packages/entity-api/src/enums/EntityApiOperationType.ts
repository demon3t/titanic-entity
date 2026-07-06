/**
 * Тип операции, которую нужно выполнить через единый endpoint Entity API.
 */
export enum EntityApiOperationType {
  /** Операция не задана или не распознана. */
  Unknown = 0,

  /** Прочитать сущности через Entity Schema Query. */
  Select = 1,

  /** Создать или обновить сущность через Entity.Save(). */
  Save = 2,

  /** Удалить сущности по обязательному фильтру. */
  Delete = 3
}