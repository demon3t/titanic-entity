import type { ReactNode } from "react";
import type {
  Entity,
  EntityColumnDefinition,
  EntityColumnSchema,
  EntityDisplayValues,
  EntitySchema,
  EntityValues,
  LookupOption
} from "@titanic-entity/entity-core";
import type {
  BaseModuleMethod,
  BaseModuleMethodArguments,
  BaseModuleMethodChains,
  BaseModuleMethodThis,
  BaseModuleMethods,
  BaseModuleTemplate,
  NormalizedBaseModuleTemplate
} from "../../base-module";

export type EntityEditPageRenderValue<TValue> = TValue | ((context: EntityEditPageContext) => TValue);
export type EntityEditPagePredicate = boolean | ((context: EntityEditPageContext) => boolean);
export type EntityEditPageAttributes = Record<string, EntityEditPageAttribute>;
export type EntityEditPageMethods = BaseModuleMethods<EntityEditPageContext, EntityEditPageMethodThis, EntityEditPageMethod>;
export type EntityEditPageMethodChains = BaseModuleMethodChains<EntityEditPageContext, EntityEditPageMethodThis, EntityEditPageMethod>;
export type EntityEditPageMethodArguments = BaseModuleMethodArguments;
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
  column?: EntityColumnDefinition<TValue>;

  /** Начальное значение для page-атрибутов и Entity-полей. */
  defaultValue?: TValue;

  /** Алиас для defaultValue, когда атрибут описывает состояние страницы. */
  value?: TValue;

  /** Атрибут только страницы. Он не добавляется в схему сущности автоматически. */
  transient?: boolean;
}

export interface EntityEditPageMixin extends BaseModuleTemplate<
  EntityEditPageContext,
  EntityEditPageMethods,
  EntityEditPageDiffItem[]
> {
  name?: string;
  attributes?: EntityEditPageAttributes;
  diffOverrides?: EntityEditPageDiffOverride[];
}

export interface EntityEditPageTemplate extends BaseModuleTemplate<
  EntityEditPageContext,
  EntityEditPageMethods,
  EntityEditPageDiffItem[]
> {
  /** Родительский шаблон страницы. Дочерние пакеты могут переопределять methods, attributes, mixins и diff. */
  base?: EntityEditPageTemplate;

  /** Готовую схему можно передать напрямую; attributes и diff могут расширить ее. */
  schema?: EntitySchema;
  entity?: Entity;

  /** Имя таблицы Entity. Используется, если schema не передана. */
  tableName?: string;

  /** Алиас tableName в стиле Creatio. */
  entitySchemaName?: string;

  primaryColumn?: string;
  displayColumn?: string;
  title?: string;
  submitLabel?: ReactNode;
  localization?: EntityEditPageLocalization;
  columns?: EntityColumnDefinition[];
  attributes?: EntityEditPageAttributes;
  mixins?: EntityEditPageMixin[];
  diffOverrides?: EntityEditPageDiffOverride[];
}

export interface NormalizedEntityEditPageTemplate extends NormalizedBaseModuleTemplate<
  EntityEditPageContext,
  EntityEditPageMethods,
  EntityEditPageMethodChains,
  EntityEditPageDiffItem[]
> {
  attributes: EntityEditPageAttributes;
  schema: EntitySchema;
  title?: string;
  submitLabel?: ReactNode;
  localization?: EntityEditPageLocalization;
  columnsByAttribute: Record<string, EntityColumnSchema>;
}

export interface EntityEditPageContext {
  entity: Entity;
  template: NormalizedEntityEditPageTemplate;
  schema: EntitySchema;
  attributes: EntityEditPageAttributes;
  methods: EntityEditPageMethods;
  values: EntityValues;
  displayValues: EntityDisplayValues;
  disabled: boolean;
  isDirty: boolean;
  getValue: <TValue = unknown>(key: string) => TValue | undefined;
  setValue: (key: string, value: unknown) => void;
  setValues: (updater: EntityEditPageValuesUpdater) => void;
  submit: () => Promise<void>;
  reset: () => void;
  runMethod: (name: string, ...args: unknown[]) => Promise<unknown>;
}

export interface EntityEditPageMethodScope extends EntityEditPageContext {
  context: EntityEditPageContext;
}

export interface EntityEditPageMethodThis extends BaseModuleMethodThis, EntityEditPageMethodScope {
  /** Reads the current value of a page/entity attribute inside a page method. */
  get: <TValue = unknown>(key: string) => TValue | undefined;

  /** Registered page methods are exposed as bound methods on `this`. */
  [methodName: string]: any;
}

export type EntityEditPageMethod = BaseModuleMethod<EntityEditPageContext, EntityEditPageMethodThis>;

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
  defaultExpanded?: boolean;
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

export type EntityEditPageDiffOverrideOperation = "remove" | "insert" | "merge";
export type EntityEditPageDiffInsertPosition = "before" | "after" | "inside" | "start" | "end";

export interface EntityEditPageDiffOverride {
  operation: EntityEditPageDiffOverrideOperation;
  name?: string;
  target?: string;
  targetName?: string;
  position?: EntityEditPageDiffInsertPosition;
  item?: EntityEditPageDiffItem;
  items?: EntityEditPageDiffItem[];
}

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

export interface EntityEditPageProps<TValues extends EntityValues = EntityValues> {
  template: EntityEditPageTemplate;
  value?: EntityValues & Partial<TValues>;
  displayValues?: EntityDisplayValues;
  recordId?: unknown;
  loadRecord?: boolean;
  clientName?: string;
  disabled?: boolean;
  className?: string;
  top?: EntityEditPageRenderValue<ReactNode>;
  bottom?: EntityEditPageRenderValue<ReactNode>;
  backLabel?: ReactNode;
  cancelLabel?: ReactNode;
  deleteLabel?: ReactNode;
  submitLabel?: ReactNode;
  backDisabled?: boolean;
  cancelDisabled?: boolean;
  deleteDisabled?: boolean;
  submitDisabled?: boolean;
  manualCommitDelayMs?: number;
  onChange?: (values: TValues, context: EntityEditPageContext) => void;
  onBack?: (context: EntityEditPageContext) => void | Promise<void>;
  onCancel?: (context: EntityEditPageContext) => void | Promise<void>;
  onDelete?: (values: TValues, context: EntityEditPageContext) => void | Promise<void>;
  onSubmit?: (values: TValues, context: EntityEditPageContext) => boolean | void | Promise<boolean | void>;
}
