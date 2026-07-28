import { toApiEntity, toEntityValues, type EntityApiEntity } from "./api";
import { EntityColumn } from "./columns/EntityColumn";
import type { EntityColumnDefinition } from "./models/EntityColumnSchema";
import type { EntitySchema } from "./models/EntitySchema";
import type { EntityValues } from "./models/EntityValues";
import { createEmptyValues, getSaveValues } from "./schema";

export type EntityColumnMap = Record<string, EntityColumn<any>>;
export type EntityDefinitionMethod = (this: any, ...args: any[]) => unknown;
export type EntityDefinitionMethods = Record<string, EntityDefinitionMethod>;

export interface EntityOptions {
  name?: string;
  tableName?: string;
  providerName?: string;
  primaryColumn?: string | EntityColumn<any>;
  displayColumn?: string | EntityColumn<any>;
  title?: string;
  columns?: EntityColumnDefinition[];
}

export interface EntityDefinitionConfig<
  TColumns extends EntityColumnMap,
  TMethods extends EntityDefinitionMethods = {}
> extends Omit<EntityOptions, "columns"> {
  extend?: Entity;
  columns: TColumns;
  methods?: TMethods & ThisType<DefinedEntity<TColumns, TMethods>>;
  metadata?: Record<string, unknown>;
}

export type DefinedEntity<
  TColumns extends EntityColumnMap,
  TMethods extends EntityDefinitionMethods = {}
> = Entity & TColumns & TMethods & {
  readonly $className: string;
  readonly $metadata?: Record<string, unknown>;
  getColumn<TKey extends keyof TColumns & string>(key: TKey): TColumns[TKey] | undefined;
};

export class Entity {
  private readonly options: EntityOptions;
  private resolvedSchema: EntitySchema | undefined;
  private values: EntityValues;
  private initialValuesState: EntityValues;
  private lastValuesState: EntityValues;
  private valuesInitialized: boolean;

  constructor(schema: EntitySchema, values?: EntityValues | EntityApiEntity);
  constructor(options: EntityOptions, values?: EntityValues | EntityApiEntity);
  constructor(options: EntitySchema | EntityOptions, values?: EntityValues | EntityApiEntity) {
    this.options = { ...options };
    this.values = values ? normalizeValues(values) : this.options.columns?.length ? createEmptyValues(this.schema) : {};
    this.initialValuesState = { ...this.values };
    this.lastValuesState = { ...this.values };
    this.valuesInitialized = Boolean(values) || Boolean(this.options.columns?.length);
  }

  static define<
    TColumns extends EntityColumnMap,
    TMethods extends EntityDefinitionMethods = {}
  >(
    className: string,
    config: EntityDefinitionConfig<TColumns, TMethods>
  ): DefinedEntity<TColumns, TMethods> {
    return defineEntity(className, config);
  }

  get name(): string {
    return this.options.name ?? this.options.tableName ?? "";
  }

  get providerName(): string | undefined {
    return this.options.providerName;
  }

  get schema(): EntitySchema {
    this.resolvedSchema ??= {
      tableName: this.options.tableName ?? this.options.name ?? "",
      primaryColumn: getColumnPath(this.options.primaryColumn),
      displayColumn: getColumnPath(this.options.displayColumn),
      title: this.options.title,
      columns: this.options.columns ?? this.getDeclaredColumns()
    };

    return this.resolvedSchema;
  }

  get columns(): EntityColumnMap {
    return this.getDeclaredColumnMap();
  }

  get tableName(): string {
    return this.schema.tableName;
  }

  get isChanged(): boolean {
    this.ensureValuesInitialized();
    return Object.keys(this.values).some((key) => !Object.is(this.values[key], this.initialValuesState[key]));
  }

  get currentValues(): EntityValues {
    return this.toValues();
  }

  get initialValues(): EntityValues {
    this.ensureValuesInitialized();
    return { ...this.initialValuesState };
  }

  get lastValues(): EntityValues {
    this.ensureValuesInitialized();
    return { ...this.lastValuesState };
  }

  getValue<T = unknown>(key: string): T | null {
    this.ensureValuesInitialized();
    return (this.values[key] ?? null) as T | null;
  }

  getColumn<TColumn extends EntityColumn<any> = EntityColumn<any>>(key: string): TColumn | undefined {
    return this.columns[key] as TColumn | undefined;
  }

  setValue(key: string, value: unknown): void {
    this.ensureValuesInitialized();
    this.setValues({ ...this.values, [key]: value });
  }

  setValues(values: EntityValues | EntityApiEntity): void {
    this.ensureValuesInitialized();
    this.lastValuesState = { ...this.values };
    this.values = normalizeValues(values);
  }

  toValues(): EntityValues {
    this.ensureValuesInitialized();
    return { ...this.values };
  }

  toApiEntity(): EntityApiEntity {
    this.ensureValuesInitialized();
    return toApiEntity(this.values);
  }

  acceptChanges(values?: EntityValues | EntityApiEntity): void {
    if (values) {
      this.lastValuesState = { ...this.values };
      this.values = normalizeValues(values);
      this.valuesInitialized = true;
    } else {
      this.ensureValuesInitialized();
    }

    this.initialValuesState = { ...this.values };
  }

  resetChanges(): void {
    this.ensureValuesInitialized();
    this.lastValuesState = { ...this.values };
    this.values = { ...this.initialValuesState };
  }

  getSaveValues(): EntityValues {
    this.ensureValuesInitialized();
    return getSaveValues(this.schema, this.values);
  }

  private ensureValuesInitialized(): void {
    if (this.valuesInitialized) {
      return;
    }

    this.values = createEmptyValues(this.schema);
    this.initialValuesState = { ...this.values };
    this.lastValuesState = { ...this.values };
    this.valuesInitialized = true;
  }

  private getDeclaredColumns(): EntityColumnDefinition[] {
    return Object.values(this.getDeclaredColumnMap());
  }

  private getDeclaredColumnMap(): EntityColumnMap {
    return Object.entries(this).reduce<EntityColumnMap>((columns, [propertyName, value]) => {
      if (value instanceof EntityColumn) {
        columns[value.alias ?? propertyName] = value;
      }

      return columns;
    }, {});
  }
}

export { Entity as EntityModel };

export function defineEntity<
  TColumns extends EntityColumnMap,
  TMethods extends EntityDefinitionMethods = {}
>(
  className: string,
  config: EntityDefinitionConfig<TColumns, TMethods>
): DefinedEntity<TColumns, TMethods> {
  const { extend, columns, methods, metadata, ...options } = config;
  const entity = new Entity({
    ...getExtendedOptions(extend),
    ...options,
    name: options.name ?? options.tableName ?? className
  }) as DefinedEntity<TColumns, TMethods>;

  defineHiddenProperty(entity, "$className", className);

  if (metadata) {
    defineHiddenProperty(entity, "$metadata", metadata);
  }

  for (const [propertyName, column] of Object.entries({
    ...(extend?.columns ?? {}),
    ...columns
  })) {
    defineReadonlyProperty(entity, propertyName, column);
  }

  for (const [methodName, method] of Object.entries(methods ?? {})) {
    if (typeof method !== "function") {
      throw new TypeError(`Entity method "${methodName}" must be a function.`);
    }

    defineReadonlyProperty(entity, methodName, method, false);
  }

  return entity;
}

function normalizeValues(values: EntityValues | EntityApiEntity): EntityValues {
  const first = Object.values(values)[0];
  if (first && typeof first === "object" && "value" in first) {
    return toEntityValues(values as EntityApiEntity);
  }

  return { ...(values as EntityValues) };
}

function getColumnPath(column?: string | EntityColumn<any>): string | undefined {
  return typeof column === "string" ? column : column?.path;
}

function getExtendedOptions(entity: Entity | undefined): EntityOptions {
  if (!entity) {
    return {};
  }

  const schema = entity.schema;
  return {
    name: entity.name,
    tableName: schema.tableName,
    providerName: entity.providerName,
    primaryColumn: schema.primaryColumn,
    displayColumn: schema.displayColumn,
    title: schema.title
  };
}

function defineReadonlyProperty(target: object, propertyName: string, value: unknown, enumerable = true): void {
  Object.defineProperty(target, propertyName, {
    value,
    enumerable,
    configurable: true,
    writable: false
  });
}

function defineHiddenProperty(target: object, propertyName: string, value: unknown): void {
  defineReadonlyProperty(target, propertyName, value, false);
}
