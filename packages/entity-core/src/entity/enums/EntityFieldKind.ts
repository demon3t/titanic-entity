/**
 * Тип UI-поля для отображения колонки сущности.
 */
export enum EntityFieldKind {
  /** Однострочное текстовое поле. */
  String = "string",

  /** Многострочное текстовое поле. */
  Text = "text",

  /** Числовое поле. */
  Number = "number",

  /** Логический флаг в виде флажка. */
  Boolean = "boolean",

  /** Поле даты. */
  Date = "date",

  /** Поле даты и времени. */
  DateTime = "datetime",

  /** Lookup/select поле. */
  Lookup = "lookup",

  /** Поле выбора цвета. */
  Color = "color",

  Json = "json"
}
