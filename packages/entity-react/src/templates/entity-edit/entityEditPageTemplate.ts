// Шаблон страницы редактирования сущности для пакетного переиспользования.
import { getColumnKey, type EntityColumnSchema, type LookupOption } from "@titanic/entity-core";
import type {
  EntityEditPageAction,
  EntityEditPageAttribute,
  EntityEditPageAttributeLocalization,
  EntityEditPageAttributes,
  EntityEditPageDiffItem,
  EntityEditPageEntityLocalization,
  EntityEditPageFieldDiffItem,
  EntityEditPageLocalization,
  EntityEditPageMethods,
  EntityEditPageTemplate,
  NormalizedEntityEditPageTemplate
} from "./models/EntityEditPageTemplate";

export function createEntityEditPageTemplate(template: EntityEditPageTemplate): NormalizedEntityEditPageTemplate {
  const resolvedTemplate = resolveEntityEditPageTemplate(template);
  const localization = resolvedTemplate.localization;
  const attributes = localizeAttributes(mergeAttributes(resolvedTemplate), localization);
  const methods = mergeMethods(resolvedTemplate);
  const inputDiff = localizeDiff(resolvedTemplate.diff ?? [], localization);
  const fieldItems = getFieldDiffItems(inputDiff);
  const tableName = resolvedTemplate.schema?.tableName ?? resolvedTemplate.tableName ?? resolvedTemplate.entitySchemaName;

  if (!tableName?.trim()) {
    throw new Error("Entity edit page template requires tableName, entitySchemaName, or schema.tableName.");
  }

  const columns: EntityColumnSchema[] = [];
  const columnsByAttribute: Record<string, EntityColumnSchema> = {};

  for (const column of resolvedTemplate.schema?.columns ?? []) {
    upsertColumn(columns, columnsByAttribute, getColumnKey(column), localizeColumn(column, getColumnKey(column), localization));
  }

  for (const column of resolvedTemplate.columns ?? []) {
    upsertColumn(columns, columnsByAttribute, getColumnKey(column), localizeColumn(column, getColumnKey(column), localization));
  }

  for (const [attributeName, attribute] of Object.entries(attributes)) {
    if (isPageOnlyAttribute(attribute) || (!attribute.column && !attribute.path)) {
      continue;
    }

    upsertColumn(columns, columnsByAttribute, attributeName, createColumnFromAttribute(attributeName, attribute));
  }

  for (const fieldItem of fieldItems) {
    const existingColumn = columnsByAttribute[fieldItem.attribute];
    const attribute = attributes[fieldItem.attribute];

    if (isPageOnlyAttribute(attribute) && !existingColumn && !fieldItem.column) {
      continue;
    }

    const column = createColumnFromAttribute(
      fieldItem.attribute,
      attribute,
      fieldItem.column,
      existingColumn
    );

    upsertColumn(columns, columnsByAttribute, fieldItem.attribute, column);
  }

  for (const column of columns) {
    const key = getColumnKey(column);
    attributes[key] ??= { column };
  }

  const diff = inputDiff.length > 0
    ? inputDiff
    : columns.map((column) => ({ type: "field", attribute: getColumnKey(column) } satisfies EntityEditPageFieldDiffItem));

  return {
    attributes,
    methods,
    diff,
    title: getFirstDefined(localization?.title, resolvedTemplate.title, resolvedTemplate.schema?.title),
    submitLabel: getFirstDefined(localization?.submitLabel, resolvedTemplate.submitLabel),
    localization,
    schema: {
      tableName,
      primaryColumn: resolvedTemplate.primaryColumn ?? resolvedTemplate.schema?.primaryColumn,
      displayColumn: resolvedTemplate.displayColumn ?? resolvedTemplate.schema?.displayColumn,
      title: getFirstDefined(localization?.title, resolvedTemplate.title, resolvedTemplate.schema?.title),
      columns
    },
    columnsByAttribute
  };
}

export function extendEntityEditPageTemplate(
  base: EntityEditPageTemplate,
  override: EntityEditPageTemplate = {}
): EntityEditPageTemplate {
  const resolvedBase = resolveEntityEditPageTemplate(base);
  const resolvedOverride = override.base
    ? extendEntityEditPageTemplate(resolveEntityEditPageTemplate(override.base), { ...override, base: undefined })
    : override;

  return {
    schema: mergeSchema(resolvedBase.schema, resolvedOverride.schema),
    tableName: resolvedOverride.tableName ?? resolvedBase.tableName,
    entitySchemaName: resolvedOverride.entitySchemaName ?? resolvedBase.entitySchemaName,
    primaryColumn: resolvedOverride.primaryColumn ?? resolvedBase.primaryColumn,
    displayColumn: resolvedOverride.displayColumn ?? resolvedBase.displayColumn,
    title: resolvedOverride.title ?? resolvedBase.title,
    submitLabel: resolvedOverride.submitLabel ?? resolvedBase.submitLabel,
    localization: mergeLocalization(resolvedBase.localization, resolvedOverride.localization),
    columns: [...(resolvedBase.columns ?? []), ...(resolvedOverride.columns ?? [])],
    attributes: {
      ...resolvedBase.attributes,
      ...resolvedOverride.attributes
    },
    methods: {
      ...resolvedBase.methods,
      ...resolvedOverride.methods
    },
    mixins: [...(resolvedBase.mixins ?? []), ...(resolvedOverride.mixins ?? [])],
    diff: resolvedOverride.diff ?? resolvedBase.diff
  };
}

function resolveEntityEditPageTemplate(template: EntityEditPageTemplate): EntityEditPageTemplate {
  if (!template.base) {
    return template;
  }

  return extendEntityEditPageTemplate(template.base, { ...template, base: undefined });
}

function mergeSchema(
  baseSchema: EntityEditPageTemplate["schema"],
  overrideSchema: EntityEditPageTemplate["schema"]
): EntityEditPageTemplate["schema"] {
  if (!baseSchema && !overrideSchema) {
    return undefined;
  }

  return {
    ...baseSchema,
    ...overrideSchema,
    columns: [...(baseSchema?.columns ?? []), ...(overrideSchema?.columns ?? [])],
    tableName: overrideSchema?.tableName ?? baseSchema?.tableName ?? ""
  };
}

function mergeLocalization(
  baseLocalization: EntityEditPageLocalization | undefined,
  overrideLocalization: EntityEditPageLocalization | undefined
): EntityEditPageLocalization | undefined {
  if (!baseLocalization && !overrideLocalization) {
    return undefined;
  }

  return {
    ...baseLocalization,
    ...overrideLocalization,
    attributes: mergeNamedObjects(baseLocalization?.attributes, overrideLocalization?.attributes),
    entities: mergeNamedObjects(baseLocalization?.entities, overrideLocalization?.entities),
    diff: mergeNamedObjects(baseLocalization?.diff, overrideLocalization?.diff),
    actions: mergeNamedObjects(baseLocalization?.actions, overrideLocalization?.actions)
  };
}

function mergeNamedObjects<TValue extends object>(
  baseItems: Record<string, TValue> | undefined,
  overrideItems: Record<string, TValue> | undefined
): Record<string, TValue> | undefined {
  if (!baseItems && !overrideItems) {
    return undefined;
  }

  const result: Record<string, TValue> = {};

  for (const [key, value] of Object.entries(baseItems ?? {})) {
    result[key] = { ...value };
  }

  for (const [key, value] of Object.entries(overrideItems ?? {})) {
    result[key] = { ...((result[key] ?? {}) as TValue), ...value };
  }

  return result;
}

function mergeAttributes(template: EntityEditPageTemplate): EntityEditPageAttributes {
  const result: EntityEditPageAttributes = {};

  for (const mixin of template.mixins ?? []) {
    Object.assign(result, mixin.attributes);
  }

  Object.assign(result, template.attributes);
  return result;
}

function localizeAttributes(
  attributes: EntityEditPageAttributes,
  localization: EntityEditPageLocalization | undefined
): EntityEditPageAttributes {
  if (!localization) {
    return attributes;
  }

  return Object.fromEntries(
    Object.entries(attributes).map(([attributeName, attribute]) => [
      attributeName,
      localizeAttribute(attributeName, attribute, localization)
    ])
  );
}

function localizeAttribute(
  attributeName: string,
  attribute: EntityEditPageAttribute,
  localization: EntityEditPageLocalization
): EntityEditPageAttribute {
  const attributeLocalization = localization.attributes?.[attributeName];
  const entityLocalization = getEntityLocalization(attributeName, attributeLocalization, localization);

  if (!attributeLocalization && !entityLocalization) {
    return attribute;
  }

  return {
    ...localizeColumnShape(attribute, attributeLocalization, entityLocalization),
    column: attribute.column
      ? localizeColumnShape(attribute.column, attributeLocalization, entityLocalization)
      : attribute.column
  };
}

function localizeColumn(
  column: EntityColumnSchema,
  attributeName: string,
  localization: EntityEditPageLocalization | undefined
): EntityColumnSchema {
  if (!localization) {
    return column;
  }

  const columnKey = getColumnKey(column);
  const attributeLocalization =
    localization.attributes?.[attributeName] ??
    localization.attributes?.[columnKey] ??
    localization.attributes?.[column.path];
  const entityLocalization = getEntityLocalization(attributeName, attributeLocalization, localization);

  return localizeColumnShape(column, attributeLocalization, entityLocalization);
}

function localizeColumnShape<TColumn extends Partial<EntityColumnSchema>>(
  column: TColumn,
  attributeLocalization: EntityEditPageAttributeLocalization | undefined,
  entityLocalization: EntityEditPageEntityLocalization | undefined
): TColumn {
  const localizedOptions = localizeLookupOptions(column.options, attributeLocalization, entityLocalization);

  return {
    ...column,
    ...(attributeLocalization?.label !== undefined ? { label: attributeLocalization.label } : {}),
    ...(attributeLocalization?.placeholder !== undefined ? { placeholder: attributeLocalization.placeholder } : {}),
    ...(localizedOptions !== undefined ? { options: localizedOptions } : {})
  };
}

function getEntityLocalization(
  attributeName: string,
  attributeLocalization: EntityEditPageAttributeLocalization | undefined,
  localization: EntityEditPageLocalization
): EntityEditPageEntityLocalization | undefined {
  const entityName = attributeLocalization?.entity ?? attributeName;
  return localization.entities?.[entityName];
}

function localizeLookupOptions(
  options: LookupOption[] | undefined,
  attributeLocalization: EntityEditPageAttributeLocalization | undefined,
  entityLocalization: EntityEditPageEntityLocalization | undefined
): LookupOption[] | undefined {
  const optionLocalization =
    attributeLocalization?.options ??
    entityLocalization?.options ??
    entityLocalization?.displayValues;

  if (optionLocalization === undefined) {
    return options;
  }

  if (Array.isArray(optionLocalization)) {
    return optionLocalization;
  }

  return localizeOptionsByValue(options, optionLocalization);
}

function localizeOptionsByValue(
  options: LookupOption[] | undefined,
  optionLocalization: Record<string, string>
): LookupOption[] {
  if (!options?.length) {
    return Object.entries(optionLocalization).map(([value, displayValue]) => ({ value, displayValue }));
  }

  return options.map((option) => ({
    ...option,
    displayValue: optionLocalization[String(option.value)] ?? option.displayValue
  }));
}

function mergeMethods(template: EntityEditPageTemplate): EntityEditPageMethods {
  const result: EntityEditPageMethods = {};

  for (const mixin of template.mixins ?? []) {
    Object.assign(result, mixin.methods);
  }

  Object.assign(result, template.methods);
  return result;
}

function localizeDiff(
  diff: EntityEditPageDiffItem[],
  localization: EntityEditPageLocalization | undefined
): EntityEditPageDiffItem[] {
  if (!localization) {
    return diff;
  }

  return diff.map((item) => localizeDiffItem(item, localization));
}

function localizeDiffItem(
  item: EntityEditPageDiffItem,
  localization: EntityEditPageLocalization
): EntityEditPageDiffItem {
  const itemLocalization = item.name ? localization.diff?.[item.name] : undefined;

  switch (item.type) {
    case "section":
      return {
        ...item,
        title: getFirstDefined(itemLocalization?.title, item.title),
        items: item.items ? localizeDiff(item.items, localization) : item.items
      };
    case "row":
      return {
        ...item,
        items: item.items ? localizeDiff(item.items, localization) : item.items
      };
    case "text":
      return {
        ...item,
        text: getFirstDefined(itemLocalization?.text, item.text)
      };
    case "actions":
      return {
        ...item,
        actions: item.actions.map((action) => localizeAction(action, localization))
      };
    default:
      return item;
  }
}

function localizeAction(
  action: EntityEditPageAction,
  localization: EntityEditPageLocalization
): EntityEditPageAction {
  const actionLocalization = action.name ? localization.actions?.[action.name] : undefined;

  if (actionLocalization?.label === undefined) {
    return action;
  }

  return {
    ...action,
    label: actionLocalization.label
  };
}

function getFieldDiffItems(diff: EntityEditPageDiffItem[]): EntityEditPageFieldDiffItem[] {
  const result: EntityEditPageFieldDiffItem[] = [];

  for (const item of diff) {
    if (item.type === "field") {
      result.push(item);
      continue;
    }

    if (item.type === "section" || item.type === "row") {
      result.push(...(item.attributes ?? []).map((attribute) => ({ type: "field", attribute } satisfies EntityEditPageFieldDiffItem)));
      result.push(...getFieldDiffItems(item.items ?? []));
    }
  }

  return result;
}

function createColumnFromAttribute(
  attributeName: string,
  attribute?: EntityEditPageAttribute,
  override?: Partial<EntityColumnSchema>,
  existingColumn?: EntityColumnSchema
): EntityColumnSchema {
  const attributeColumn = getAttributeColumnShape(attribute);
  const column = {
    ...existingColumn,
    ...attributeColumn,
    ...attribute?.column,
    ...override
  };

  return {
    ...column,
    path: column.path ?? attributeName,
    alias: column.alias ?? attributeName,
    defaultValue: getFirstDefined(
      override?.defaultValue,
      attribute?.column?.defaultValue,
      attribute?.defaultValue,
      attribute?.value,
      existingColumn?.defaultValue
    )
  };
}

function getAttributeColumnShape(attribute?: EntityEditPageAttribute): Partial<EntityColumnSchema> {
  if (!attribute) {
    return {};
  }

  const { column: _column, type: _type, value: _value, transient: _transient, ...columnShape } = attribute;
  return columnShape;
}

function isPageOnlyAttribute(attribute: EntityEditPageAttribute | undefined): boolean {
  return Boolean(attribute?.transient || attribute?.type === "page");
}

function upsertColumn(
  columns: EntityColumnSchema[],
  columnsByAttribute: Record<string, EntityColumnSchema>,
  attributeName: string,
  column: EntityColumnSchema
): void {
  const key = getColumnKey(column);
  const index = columns.findIndex((item) => getColumnKey(item) === key);
  const nextColumn = index >= 0 ? { ...columns[index], ...column } : column;

  if (index >= 0) {
    columns[index] = nextColumn;
  } else {
    columns.push(nextColumn);
  }

  columnsByAttribute[attributeName] = nextColumn;
  columnsByAttribute[key] = nextColumn;
}

function getFirstDefined<TValue>(...values: Array<TValue | undefined>): TValue | undefined {
  return values.find((value) => value !== undefined);
}
