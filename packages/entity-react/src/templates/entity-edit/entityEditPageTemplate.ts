// Шаблон страницы редактирования сущности для пакетного переиспользования.
import {
  getColumnKey,
  normalizeEntityColumn,
  type EntityColumnDefinition,
  type EntityColumnSchema,
  type LookupOption
} from "@titanic-entity/entity-core";
import type {
  EntityEditPageAction,
  EntityEditPageAttribute,
  EntityEditPageAttributeLocalization,
  EntityEditPageAttributes,
  EntityEditPageDiffItem,
  EntityEditPageDiffOverride,
  EntityEditPageEntityLocalization,
  EntityEditPageFieldDiffItem,
  EntityEditPageLocalization,
  EntityEditPageMethod,
  EntityEditPageMethodChains,
  EntityEditPageMethods,
  EntityEditPageMixin,
  EntityEditPageRowDiffItem,
  EntityEditPageSectionDiffItem,
  EntityEditPageTemplate,
  NormalizedEntityEditPageTemplate
} from "./models/EntityEditPageTemplate";

export const basePageTemplate: EntityEditPageTemplate = {
  attributes: {},
  methods: {},
  diff: []
};

export function createEntityEditPageTemplate(template: EntityEditPageTemplate): NormalizedEntityEditPageTemplate {
  const resolvedTemplate = resolveEntityEditPageTemplate(template);
  const schema = mergeSchema(resolvedTemplate.entity?.schema, resolvedTemplate.schema);
  const localization = resolvedTemplate.localization;
  const attributes = localizeAttributes(mergeAttributes(resolvedTemplate), localization);
  const methodChains = buildMethodChains(template);
  const methods = getLastMethods(methodChains);
  const inputDiff = localizeDiff(buildEntityEditPageDiff(resolvedTemplate), localization);
  const fieldItems = getFieldDiffItems(inputDiff);
  const tableName = getFirstNonEmpty(resolvedTemplate.tableName, resolvedTemplate.entitySchemaName, schema?.tableName);

  if (!tableName?.trim()) {
    throw new Error("Entity edit page template requires entity, tableName, entitySchemaName, or schema.tableName.");
  }

  const columns: EntityColumnSchema[] = [];
  const columnsByAttribute: Record<string, EntityColumnSchema> = {};

  for (const rawColumn of schema?.columns ?? []) {
    const column = normalizeEntityColumn(rawColumn);
    const columnKey = getColumnKey(column);
    upsertColumn(columns, columnsByAttribute, columnKey, localizeColumn(column, columnKey, localization));
  }

  for (const rawColumn of resolvedTemplate.columns ?? []) {
    const column = normalizeEntityColumn(rawColumn);
    const columnKey = getColumnKey(column);
    upsertColumn(columns, columnsByAttribute, columnKey, localizeColumn(column, columnKey, localization));
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
    methodChains,
    diff,
    title: getFirstDefined(localization?.title, resolvedTemplate.title, schema?.title),
    submitLabel: getFirstDefined(localization?.submitLabel, resolvedTemplate.submitLabel),
    localization,
    schema: {
      tableName,
      primaryColumn: resolvedTemplate.primaryColumn ?? schema?.primaryColumn,
      displayColumn: resolvedTemplate.displayColumn ?? schema?.displayColumn,
      title: getFirstDefined(localization?.title, resolvedTemplate.title, schema?.title),
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
    entity: resolvedOverride.entity ?? resolvedBase.entity,
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
    diff: getTemplateDiffSource(resolvedOverride) ?? getTemplateDiffSource(resolvedBase),
    diffOverrides: [...(resolvedBase.diffOverrides ?? []), ...(resolvedOverride.diffOverrides ?? [])]
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
      ? localizeColumnShape(normalizeEntityColumn(attribute.column), attributeLocalization, entityLocalization)
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

function buildMethodChains(template: EntityEditPageTemplate): EntityEditPageMethodChains {
  const result: EntityEditPageMethodChains = {};
  appendTemplateMethods(result, template);
  return result;
}

function appendTemplateMethods(result: EntityEditPageMethodChains, template: EntityEditPageTemplate): void {
  if (template.base) {
    appendTemplateMethods(result, template.base);
  }

  for (const mixin of template.mixins ?? []) {
    appendMethods(result, mixin.methods);
  }

  appendMethods(result, template.methods);
}

function appendMethods(
  result: EntityEditPageMethodChains,
  methods: EntityEditPageMethods | undefined
): void {
  for (const [name, method] of Object.entries(methods ?? {})) {
    result[name] ??= [];
    result[name].push(method);
  }
}

function getLastMethods(methodChains: EntityEditPageMethodChains): EntityEditPageMethods {
  const result: Record<string, EntityEditPageMethod> = {};

  for (const [name, chain] of Object.entries(methodChains)) {
    const method = chain[chain.length - 1];
    if (method) {
      result[name] = method;
    }
  }

  return result as EntityEditPageMethods;
}

export function buildEntityEditPageDiff(template: EntityEditPageTemplate): EntityEditPageDiffItem[] {
  const result: EntityEditPageDiffItem[] = [];
  const overrides: EntityEditPageDiffOverride[] = [];

  for (const mixin of template.mixins ?? []) {
    result.push(...cloneDiffItems(getMixinDiffSource(mixin) ?? []));
    overrides.push(...(mixin.diffOverrides ?? []));
  }

  result.push(...cloneDiffItems(getTemplateDiffSource(template) ?? []));
  overrides.push(...(template.diffOverrides ?? []));

  return applyEntityEditPageDiffOverrides(result, overrides);
}

export function applyEntityEditPageDiffOverrides(
  items: EntityEditPageDiffItem[],
  overrides: EntityEditPageDiffOverride[] = []
): EntityEditPageDiffItem[] {
  let result = cloneDiffItems(items);

  for (const override of overrides) {
    const targetName = getOverrideTargetName(override);

    if (override.operation === "remove") {
      result = targetName ? removeDiffItem(result, targetName) : result;
      continue;
    }

    if (override.operation === "merge") {
      const patchItem = override.item ?? override.items?.[0];
      const patchTargetName = targetName ?? patchItem?.name;
      result = patchTargetName && patchItem
        ? mergeDiffItemByName(result, patchTargetName, patchItem)
        : result;
      continue;
    }

    const nextItems = cloneDiffItems(override.items ?? (override.item ? [override.item] : []));
    if (nextItems.length === 0) {
      continue;
    }

    if (!targetName) {
      result = override.position === "start" ? [...nextItems, ...result] : [...result, ...nextItems];
      continue;
    }

    const inserted = insertDiffItems(result, targetName, nextItems, override.position ?? "after");
    result = inserted.handled ? inserted.items : result;
  }

  return result;
}

function getTemplateDiffSource(template: EntityEditPageTemplate): EntityEditPageDiffItem[] | undefined {
  return template.diff;
}

function getMixinDiffSource(mixin: EntityEditPageMixin): EntityEditPageDiffItem[] | undefined {
  return mixin.diff;
}

function getOverrideTargetName(override: EntityEditPageDiffOverride): string | undefined {
  return override.targetName ?? override.target ?? override.name;
}

function cloneDiffItems(items: EntityEditPageDiffItem[]): EntityEditPageDiffItem[] {
  return items.map((item) => cloneDiffItem(item));
}

function cloneDiffItem(item: EntityEditPageDiffItem): EntityEditPageDiffItem {
  if (!hasNestedDiffItems(item)) {
    return { ...item };
  }

  return {
    ...item,
    items: item.items ? cloneDiffItems(item.items) : item.items
  };
}

function removeDiffItem(items: EntityEditPageDiffItem[], targetName: string): EntityEditPageDiffItem[] {
  const result: EntityEditPageDiffItem[] = [];

  for (const item of items) {
    if (item.name === targetName) {
      continue;
    }

    result.push(hasNestedDiffItems(item)
      ? { ...item, items: removeDiffItem(item.items ?? [], targetName) }
      : item);
  }

  return result;
}

function insertDiffItems(
  items: EntityEditPageDiffItem[],
  targetName: string,
  nextItems: EntityEditPageDiffItem[],
  position: EntityEditPageDiffOverride["position"]
): { items: EntityEditPageDiffItem[]; handled: boolean } {
  const result: EntityEditPageDiffItem[] = [];
  let handled = false;

  for (const item of items) {
    if (item.name === targetName) {
      if (position === "before") {
        result.push(...nextItems);
      }

      if ((position === "inside" || position === "start" || position === "end") && hasNestedDiffItems(item)) {
        const currentItems = item.items ?? [];
        const childItems = position === "start"
          ? [...nextItems, ...currentItems]
          : [...currentItems, ...nextItems];
        result.push({ ...item, items: childItems });
        handled = true;
        continue;
      }

      result.push(item);

      if (position === "after" || position === undefined) {
        result.push(...nextItems);
      }

      handled = true;
      continue;
    }

    if (hasNestedDiffItems(item) && !handled) {
      const inserted = insertDiffItems(item.items ?? [], targetName, nextItems, position);
      result.push(inserted.handled ? { ...item, items: inserted.items } : item);
      handled = handled || inserted.handled;
      continue;
    }

    result.push(item);
  }

  return { items: result, handled };
}

function mergeDiffItemByName(
  items: EntityEditPageDiffItem[],
  targetName: string,
  patchItem: EntityEditPageDiffItem
): EntityEditPageDiffItem[] {
  return items.map((item) => {
    if (item.name === targetName) {
      return mergeDiffItem(item, patchItem);
    }

    if (!hasNestedDiffItems(item)) {
      return item;
    }

    return {
      ...item,
      items: mergeDiffItemByName(item.items ?? [], targetName, patchItem)
    };
  });
}

function mergeDiffItem(baseItem: EntityEditPageDiffItem, patchItem: EntityEditPageDiffItem): EntityEditPageDiffItem {
  if (!hasNestedDiffItems(baseItem) || !hasNestedDiffItems(patchItem)) {
    return { ...baseItem, ...patchItem };
  }

  return {
    ...baseItem,
    ...patchItem,
    items: mergeDiffItemCollections(baseItem.items ?? [], patchItem.items ?? [])
  };
}

function mergeDiffItemCollections(
  baseItems: EntityEditPageDiffItem[],
  patchItems: EntityEditPageDiffItem[]
): EntityEditPageDiffItem[] {
  const result = cloneDiffItems(baseItems);

  for (const patchItem of patchItems) {
    const itemName = patchItem.name;
    const index = itemName ? result.findIndex((item) => item.name === itemName) : -1;

    if (index >= 0) {
      result[index] = mergeDiffItem(result[index], patchItem);
    } else {
      result.push(cloneDiffItem(patchItem));
    }
  }

  return result;
}

function hasNestedDiffItems(item: EntityEditPageDiffItem): item is EntityEditPageSectionDiffItem | EntityEditPageRowDiffItem {
  return item.type === "section" || item.type === "row";
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
  const itemLocalization = item.name
    ? localization.diff?.[item.name]
    : undefined;

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
  const explicitAttributeColumn = attribute?.column ? normalizeEntityColumn(attribute.column) : undefined;
  const column = {
    ...existingColumn,
    ...attributeColumn,
    ...explicitAttributeColumn,
    ...override
  };

  return {
    ...column,
    path: column.path ?? attributeName,
    alias: column.alias ?? attributeName,
    defaultValue: getFirstDefined(
      override?.defaultValue,
      explicitAttributeColumn?.defaultValue,
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

function getFirstNonEmpty(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => value !== undefined && value.trim().length > 0);
}
