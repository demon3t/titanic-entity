import type { ReactNode } from "react";
import type {
  EntityColumnSchema,
  EntityDisplayValues,
  EntitySchema,
  EntityValues,
  LookupOption
} from "@titanic/entity-core";

export type EntityEditPageRenderValue<TValue> = TValue | ((context: EntityEditPageContext) => TValue);
export type EntityEditPagePredicate = boolean | ((context: EntityEditPageContext) => boolean);
export type EntityEditPageAttributes = Record<string, EntityEditPageAttribute>;
export type EntityEditPageMethods = Record<string, EntityEditPageMethod>;
export type EntityEditPageValuesUpdater = EntityValues | ((values: EntityValues) => EntityValues);
export type EntityEditPageLookupOptionLocalization = Record<string, string> | LookupOption[];
export type EntityEditPageAttributeType = "entity" | "page";

export interface EntityEditPageAttributeLocalization {
  label?: string;
  placeholder?: string;
  entity?: string;
  options?: EntityEditPageLookupOptionLocalization;
}

export interface EntityEditPageEntityLocalization {
  title?: string;
  displayValues?: Record<string, string>;
  options?: EntityEditPageLookupOptionLocalization;
}

export interface EntityEditPageDiffItemLocalization {
  title?: EntityEditPageRenderValue<ReactNode>;
  text?: EntityEditPageRenderValue<ReactNode>;
}

export interface EntityEditPageActionLocalization {
  label?: EntityEditPageRenderValue<ReactNode>;
}

export interface EntityEditPageLocalization {
  culture?: string;
  title?: string;
  submitLabel?: ReactNode;
  attributes?: Record<string, EntityEditPageAttributeLocalization>;
  entities?: Record<string, EntityEditPageEntityLocalization>;
  diff?: Record<string, EntityEditPageDiffItemLocalization>;
  actions?: Record<string, EntityEditPageActionLocalization>;
}

export interface EntityEditPageAttribute<TValue = unknown> extends Partial<Omit<EntityColumnSchema<TValue>, "defaultValue">> {
  /** Источник атрибута. Entity-атрибуты соответствуют ORM-колонкам; page-атрибуты хранят состояние страницы. */
  type?: EntityEditPageAttributeType;

  /** Полная схема колонки для Entity-поля. Если не задана, diff поля может создать ее по имени атрибута. */
  column?: EntityColumnSchema<TValue>;

  /** Начальное значение для page-атрибутов и Entity-полей. */
  defaultValue?: TValue;

  /** Алиас для defaultValue, когда атрибут описывает состояние страницы. */
  value?: TValue;

  /** Атрибут только страницы. Он не добавляется в схему сущности автоматически. */
  transient?: boolean;
}

export interface EntityEditPageMixin {
  name?: string;
  attributes?: EntityEditPageAttributes;
  methods?: EntityEditPageMethods;
}

export interface EntityEditPageTemplate {
  /** Родительский шаблон страницы. Дочерние пакеты могут переопределять methods, attributes, mixins и diff. */
  base?: EntityEditPageTemplate;

  /** Готовую схему можно передать напрямую; attributes и diff могут расширить ее. */
  schema?: EntitySchema;

  /** Имя таблицы Entity. Используется, если schema не передана. */
  tableName?: string;

  /** Алиас tableName в стиле Creatio. */
  entitySchemaName?: string;

  primaryColumn?: string;
  displayColumn?: string;
  title?: string;
  submitLabel?: ReactNode;
  localization?: EntityEditPageLocalization;
  columns?: EntityColumnSchema[];
  attributes?: EntityEditPageAttributes;
  methods?: EntityEditPageMethods;
  mixins?: EntityEditPageMixin[];
  diff?: EntityEditPageDiffItem[];
}

export interface NormalizedEntityEditPageTemplate extends Required<Pick<EntityEditPageTemplate, "attributes" | "methods" | "diff">> {
  schema: EntitySchema;
  title?: string;
  submitLabel?: ReactNode;
  localization?: EntityEditPageLocalization;
  columnsByAttribute: Record<string, EntityColumnSchema>;
}

export interface EntityEditPageContext {
  template: NormalizedEntityEditPageTemplate;
  schema: EntitySchema;
  attributes: EntityEditPageAttributes;
  methods: EntityEditPageMethods;
  values: EntityValues;
  displayValues: EntityDisplayValues;
  disabled: boolean;
  getValue: <TValue = unknown>(key: string) => TValue | undefined;
  setValue: (key: string, value: unknown) => void;
  setValues: (updater: EntityEditPageValuesUpdater) => void;
  submit: () => Promise<void>;
  reset: () => void;
  runMethod: (name: string, ...args: unknown[]) => Promise<unknown>;
}

export type EntityEditPageMethod = (context: EntityEditPageContext, ...args: unknown[]) => unknown | Promise<unknown>;

interface EntityEditPageDiffItemBase {
  name?: string;
  className?: string;
  gridSpan?: number;
  visible?: EntityEditPagePredicate;
}

export interface EntityEditPageFieldDiffItem extends EntityEditPageDiffItemBase {
  type: "field";
  attribute: string;
  column?: Partial<EntityColumnSchema>;
  disabled?: EntityEditPagePredicate;
}

export interface EntityEditPageSectionDiffItem extends EntityEditPageDiffItemBase {
  type: "section";
  title?: EntityEditPageRenderValue<ReactNode>;
  columns?: number;
  gap?: number;
  /** Имена Entity-атрибутов, выводимых внутри блока. Это оставляет diff.json сфокусированным на блоках страницы. */
  attributes?: string[];
  items?: EntityEditPageDiffItem[];
}

export interface EntityEditPageRowDiffItem extends EntityEditPageDiffItemBase {
  type: "row";
  columns?: number;
  gap?: number;
  attributes?: string[];
  items?: EntityEditPageDiffItem[];
}

export interface EntityEditPageTextDiffItem extends EntityEditPageDiffItemBase {
  type: "text";
  text: EntityEditPageRenderValue<ReactNode>;
}

export interface EntityEditPageActionsDiffItem extends EntityEditPageDiffItemBase {
  type: "actions";
  actions: EntityEditPageAction[];
}

export interface EntityEditPageCustomDiffItem extends EntityEditPageDiffItemBase {
  type: "custom";
  render: (context: EntityEditPageContext) => ReactNode;
}

export type EntityEditPageDiffItem =
  | EntityEditPageFieldDiffItem
  | EntityEditPageSectionDiffItem
  | EntityEditPageRowDiffItem
  | EntityEditPageTextDiffItem
  | EntityEditPageActionsDiffItem
  | EntityEditPageCustomDiffItem;

export interface EntityEditPageAction {
  name?: string;
  label: EntityEditPageRenderValue<ReactNode>;
  type?: "button" | "submit" | "reset";
  method?: string;
  args?: unknown[];
  onClick?: EntityEditPageMethod;
  disabled?: EntityEditPagePredicate;
  className?: string;
  variant?: "primary" | "secondary" | "danger";
}

export interface EntityEditPageProps {
  template: EntityEditPageTemplate;
  value?: EntityValues;
  displayValues?: EntityDisplayValues;
  disabled?: boolean;
  className?: string;
  submitLabel?: ReactNode;
  manualCommitDelayMs?: number;
  onChange?: (values: EntityValues, context: EntityEditPageContext) => void;
  onSubmit?: (values: EntityValues, context: EntityEditPageContext) => void | Promise<void>;
}
