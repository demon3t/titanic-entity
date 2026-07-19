import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const sourceRoot = resolve(import.meta.dirname, "../src");
const apiSourceRoot = resolve(import.meta.dirname, "../../entity-api/src");
const moduleCache = new Map();

const mocks = {
  "../../dataGrid/data-grid-settings": {}
};

function loadSourceModule(relativePath) {
  const filePath = resolveSourcePath(resolve(sourceRoot, relativePath));
  const cachedModule = moduleCache.get(filePath);

  if (cachedModule) {
    return cachedModule.exports;
  }

  const module = { exports: {} };
  moduleCache.set(filePath, module);

  const compiled = ts.transpileModule(readFileSync(filePath, "utf8"), {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022
    },
    fileName: filePath
  }).outputText;

  const localRequire = (specifier) => {
    if (mocks[specifier]) {
      return mocks[specifier];
    }

    if (specifier.startsWith(".")) {
      return loadResolvedSourceModule(resolve(dirname(filePath), specifier));
    }

    return require(specifier);
  };

  const wrapper = new Function("require", "exports", "module", "__filename", "__dirname", compiled);
  wrapper(localRequire, module.exports, module, filePath, dirname(filePath));

  return module.exports;
}

function loadResolvedSourceModule(modulePath) {
  return loadSourceModule(resolveSourcePath(modulePath).slice(sourceRoot.length + 1));
}

function resolveSourcePath(modulePath) {
  const candidates = [
    modulePath,
    `${modulePath}.ts`,
    `${modulePath}.tsx`,
    resolve(modulePath, "index.ts"),
    resolve(modulePath, "index.tsx")
  ];

  const resolvedPath = candidates.find((candidate) => existsSync(candidate));

  if (!resolvedPath) {
    throw new Error(`Cannot resolve source module: ${modulePath}`);
  }

  return resolvedPath;
}

const {
  addColumnToEditorSettings,
  getEditorGridRowCount,
  normalizeColumnSettingsForEditorMode
} = loadSourceModule("dataGridSettingsModalPage/model/columnSettingsEditorModel.ts");
const {
  createAvailableColumnPathOptions,
  createFieldPickerPathOptions,
  createFieldPickerState,
  filterAvailableColumnSettings,
  filterAvailableColumnSettingsByPath
} = loadSourceModule("dataGridSettingsModalPage/model/columnSettingsFieldPickerModel.ts");

const makeColumn = (key) => ({ key, path: key, label: key });
const makeSetting = (key, span, visible = true, order) => ({
  id: `${key}-id`,
  key,
  path: key,
  visible,
  span,
  width: span * 42,
  ...(order == null ? {} : { order })
});
const getVisible = (settings) => settings.filter((setting) => setting.visible);
const getByKey = (settings, key) => settings.find((setting) => setting.key === key);
const makeStructureColumn = (propertyName, overrides = {}) => ({
  propertyName,
  columnName: propertyName,
  dataValueType: "string",
  isNullable: true,
  isPrimary: false,
  isDisplay: false,
  isReference: false,
  ...overrides
});

const makeStructure = () => ({
  entities: [
    {
      tableName: "Orders",
      entityTypeName: "OrdersEntity",
      columns: [
        makeStructureColumn("Number"),
        makeStructureColumn("Customer", {
          isReference: true,
          referenceTableName: "Customers"
        })
      ]
    },
    {
      tableName: "Customers",
      entityTypeName: "CustomersEntity",
      columns: [
        makeStructureColumn("Name"),
        makeStructureColumn("City", {
          isReference: true,
          referenceTableName: "Cities"
        })
      ]
    },
    {
      tableName: "Cities",
      entityTypeName: "CitiesEntity",
      columns: [
        makeStructureColumn("Title")
      ]
    }
  ]
});

test("field picker creates selectable reference path options", () => {
  const structure = makeStructure();
  const options = createFieldPickerPathOptions(structure, "Orders", undefined);

  assert.deepEqual(options.map((option) => option.path), ["", "Customer", "Customer.City"]);
  assert.equal(options[0].label, "Orders");
  assert.equal(options[1].trail[0].tableName, "Customers");

  const customerState = createFieldPickerState(structure, "Orders", options[1].trail, "", undefined);

  assert.deepEqual(customerState.items.map((item) => item.path), ["Customer.Name", "Customer.City"]);
});

test("records page forwards field picker structure to the data grid", () => {
  const source = readFileSync(resolve(sourceRoot, "recordsPage/records-page.tsx"), "utf8");

  assert.match(source, /columnPickerLabels\?: EntityDataGridColumnPickerLabels;/);
  assert.match(source, /structure\?: EntityApiManagerStructureResponse \| null;/);
  assert.match(source, /columnPickerLabels=\{columnPickerLabels\}/);
  assert.match(source, /structure=\{structure\}/);
});

test("available column filtering keeps every setting passed by the editor", () => {
  const columns = ["a", "b"].map(makeColumn);
  const settings = [
    makeSetting("a", 4, true, 0),
    makeSetting("b", 4, false, 1)
  ];
  const columnByKey = new Map(columns.map((column) => [column.key, column]));
  const result = filterAvailableColumnSettings(settings, columnByKey, "");

  assert.deepEqual(result.map((setting) => setting.key), ["a", "b"]);
});

test("fallback field picker creates selectable path options from available columns", () => {
  const columns = [
    { key: "number", path: "Number", label: "Number" },
    { key: "customerName", path: "Customer.Name", label: "Customer name" },
    { key: "customerCityTitle", path: "Customer.City.Title", label: "City title" }
  ];
  const settings = [
    { ...makeSetting("number", 4, true, 0), path: "Number" },
    { ...makeSetting("customerName", 4, false, 1), path: "Customer.Name" },
    { ...makeSetting("customerCityTitle", 4, false, 2), path: "Customer.City.Title" }
  ];
  const columnByKey = new Map(columns.map((column) => [column.key, column]));
  const options = createAvailableColumnPathOptions(settings, columnByKey, "Orders");

  assert.deepEqual(options.map((option) => option.path), ["", "Customer", "Customer.City"]);
  assert.equal(options[0].label, "Orders");
  assert.deepEqual(options[2].trail.map((item) => item.path), ["Customer", "Customer.City"]);
});

test("fallback field picker filters by selected path and keeps all settings at the root", () => {
  const columns = [
    { key: "number", path: "Number", label: "Number" },
    { key: "customerName", path: "Customer.Name", label: "Customer name" },
    { key: "customerCityTitle", path: "Customer.City.Title", label: "City title" }
  ];
  const settings = [
    { ...makeSetting("number", 4, true, 0), path: "Number" },
    { ...makeSetting("customerName", 4, false, 1), path: "Customer.Name" },
    { ...makeSetting("customerCityTitle", 4, false, 2), path: "Customer.City.Title" }
  ];
  const columnByKey = new Map(columns.map((column) => [column.key, column]));

  const rootResult = filterAvailableColumnSettingsByPath(settings, columnByKey, "");
  const customerResult = filterAvailableColumnSettingsByPath(settings, columnByKey, "Customer");
  const cityResult = filterAvailableColumnSettingsByPath(settings, columnByKey, "Customer.City");

  assert.deepEqual(rootResult.map((setting) => setting.key), ["number", "customerName", "customerCityTitle"]);
  assert.deepEqual(customerResult.map((setting) => setting.key), ["customerName", "customerCityTitle"]);
  assert.deepEqual(cityResult.map((setting) => setting.key), ["customerCityTitle"]);
});

test("list add uses four cells when space is available", () => {
  const columns = ["a", "b"].map(makeColumn);
  const settings = [makeSetting("a", 4, true, 0), makeSetting("b", 2, false)];
  const result = addColumnToEditorSettings(columns, settings, "b", 12, "list");

  assert.deepEqual(getVisible(result).map((setting) => setting.key), ["a", "b"]);
  assert.equal(getByKey(result, "b").span, 4);
  assert.equal(getEditorGridRowCount(getVisible(result), 12), 1);
});

test("list add shrinks the previous column when the row is full", () => {
  const columns = ["a", "b", "c"].map(makeColumn);
  const settings = [
    makeSetting("a", 4, true, 0),
    makeSetting("b", 4, true, 1),
    makeSetting("c", 4, false)
  ];
  const result = addColumnToEditorSettings(columns, settings, "c", 8, "list");

  assert.deepEqual(getVisible(result).map((setting) => setting.key), ["a", "b", "c"]);
  assert.equal(getByKey(result, "a").span, 4);
  assert.equal(getByKey(result, "b").span, 3);
  assert.equal(getByKey(result, "c").span, 1);
  assert.equal(getVisible(result).reduce((total, setting) => total + setting.span, 0), 8);
  assert.equal(getEditorGridRowCount(getVisible(result), 8), 1);
});

test("list normalization hides columns from overflow rows and keeps settings available", () => {
  const columns = ["a", "b", "c"].map(makeColumn);
  const settings = [
    makeSetting("a", 6, true, 0),
    makeSetting("b", 6, true, 1),
    makeSetting("c", 6, true, 2)
  ];
  const result = normalizeColumnSettingsForEditorMode(columns, settings, 12, "list");

  assert.deepEqual(getVisible(result).map((setting) => setting.key), ["a", "b"]);
  assert.equal(getByKey(result, "c").visible, false);
  assert.equal(result.length, 3);
  assert.equal(getEditorGridRowCount(getVisible(result), 12), 1);
});

test("list add keeps every setting when a full one-cell row has to make room", () => {
  const columns = ["a", "b", "c", "d", "e"].map(makeColumn);
  const settings = [
    makeSetting("a", 1, true, 0),
    makeSetting("b", 1, true, 1),
    makeSetting("c", 1, true, 2),
    makeSetting("d", 1, true, 3),
    makeSetting("e", 4, false)
  ];
  const result = addColumnToEditorSettings(columns, settings, "e", 4, "list");

  assert.equal(result.length, 5);
  assert.equal(getByKey(result, "e").visible, true);
  assert.equal(getByKey(result, "e").span, 1);
  assert.equal(getVisible(result).length, 4);
  assert.equal(result.filter((setting) => !setting.visible).length, 1);
  assert.equal(getEditorGridRowCount(getVisible(result), 4), 1);
});

test("tile add uses remaining cells in the current row", () => {
  const columns = ["a", "b"].map(makeColumn);
  const settings = [makeSetting("a", 6, true, 0), makeSetting("b", 4, false)];
  const result = addColumnToEditorSettings(columns, settings, "b", 10, "tile");

  assert.deepEqual(getVisible(result).map((setting) => setting.key), ["a", "b"]);
  assert.equal(getByKey(result, "b").span, 4);
  assert.equal(getEditorGridRowCount(getVisible(result), 10), 1);
});

test("tile add moves to a new row when the current row is full", () => {
  const columns = ["a", "b", "c"].map(makeColumn);
  const settings = [
    makeSetting("a", 4, true, 0),
    makeSetting("b", 4, true, 1),
    makeSetting("c", 4, false)
  ];
  const result = addColumnToEditorSettings(columns, settings, "c", 8, "tile");

  assert.deepEqual(getVisible(result).map((setting) => setting.key), ["a", "b", "c"]);
  assert.equal(getByKey(result, "c").span, 4);
  assert.equal(getEditorGridRowCount(getVisible(result), 8), 2);
});

test("data grid settings modal page components use the define registry", () => {
  const settingsRoot = resolve(sourceRoot, "dataGridSettingsModalPage");
  const componentPaths = [
    "schemas/ColumnSettingsDialogLayout.tsx",
    "schemas/ColumnSettingsFieldPickerSchema.tsx",
    "schemas/ColumnSettingsModeTabs.tsx",
    "schemas/ColumnSettingsVisibleFieldSchema.tsx",
    "schemas/ColumnSettingsVisibleFieldsSchema.tsx",
    "components/EntityDataGridSettingsModalPage.tsx"
  ];

  for (const componentPath of componentPaths) {
    const source = readFileSync(resolve(settingsRoot, componentPath), "utf8");

    assert.match(source, /Titanic\.define/);
    assert.match(source, /Titanic\.getReactModule/);
  }

  const componentNamesSource = readFileSync(resolve(settingsRoot, "schemas/component-names.ts"), "utf8");

  assert.match(componentNamesSource, /EntityDataGridSettingsModalPage: "EntityDataGridSettingsModalPage"/);
  assert.match(
    componentNamesSource,
    /Titanic\.UI\.DataGridSettingsModalPage\.ColumnSettingsFieldPickerPath/
  );
  assert.match(componentNamesSource, /Titanic\.UI\.DataGridSettingsModalPage/);

  const fieldPickerSource = readFileSync(
    resolve(settingsRoot, "schemas/ColumnSettingsFieldPickerSchema.tsx"),
    "utf8"
  );

  assert.doesNotMatch(fieldPickerSource, /field-picker-path-select/);
  assert.doesNotMatch(fieldPickerSource, /<select/);

  const componentsSource = readFileSync(resolve(sourceRoot, "components.ts"), "utf8");
  const rootComponentSchemaSource = readFileSync(resolve(settingsRoot, "component-schema.ts"), "utf8");
  const packageSource = readFileSync(
    resolve(settingsRoot, "EntityDataGridSettingsModalPagePackage.tsx"),
    "utf8"
  );
  const dataGridSource = readFileSync(resolve(sourceRoot, "dataGrid/data-grid.tsx"), "utf8");

  assert.match(rootComponentSchemaSource, /entityDataGridSettingsModalPageComponentSchema/);
  assert.match(rootComponentSchemaSource, /EntityDataGridSettingsModalPage/);
  assert.match(rootComponentSchemaSource, /dataGridSettingsModalPageComponentSchemas/);
  assert.match(componentsSource, /dataGridSettingsModalPageComponentSchemas/);
  assert.match(componentsSource, /\.\.\.dataGridSettingsModalPageComponentSchemas/);
  assert.match(packageSource, /Titanic\.getReactModule/);
  assert.match(packageSource, /columnSettingsDefinedComponentNames\.EntityDataGridSettingsModalPage/);
  assert.doesNotMatch(packageSource, /UI\.renderEntityDataGridSettingsModalPage/);
  assert.match(dataGridSource, /Titanic\.getReactModule<any>\(\s*columnSettingsDefinedComponentNames\.EntityDataGridSettingsModalPage/s);
  assert.doesNotMatch(dataGridSource, /UI\?\.renderEntityDataGridSettingsModalPage/);
});

test("data grid loads and applies saved column settings before default visible columns", () => {
  const source = readFileSync(resolve(sourceRoot, "dataGrid/data-grid.tsx"), "utf8");
  const propsSource = readFileSync(resolve(sourceRoot, "dataGrid/data-grid-props.ts"), "utf8");
  const apiClientSource = readFileSync(resolve(apiSourceRoot, "services/EntityGridColumnSettingsClient.ts"), "utf8");
  const visibleColumnsStart = source.indexOf("visibleColumns:");
  const visibleColumnsEnd = source.indexOf("visibleColumnFingerprint:");
  const resolveKeysStart = source.indexOf("resolveVisibleColumnKeys(this: any): string[]");
  const resolveKeysEnd = source.indexOf("resolveActiveColumnSettings(this: any): any[]");
  const loadStart = source.indexOf("async loadColumnSettings");
  const loadEnd = source.indexOf("async saveDefaultColumnSettings");
  const visibleColumnsSource = source.slice(visibleColumnsStart, visibleColumnsEnd);
  const resolveKeysSource = source.slice(resolveKeysStart, resolveKeysEnd);
  const loadSource = source.slice(loadStart, loadEnd);

  assert.match(propsSource, /getGridColumnSettings: \(options\?: EntityDataGridSettingsLookupOptions\)/);
  assert.match(propsSource, /gridKey\?: string;/);
  assert.match(propsSource, /gridId\?: string;/);
  assert.match(source, /gridKey: \{\}/);
  assert.match(source, /resolvedGridKey:/);
  assert.match(source, /resolveGridKey/);
  assert.match(source, /EntityGridColumnSettingsApiClient/);
  assert.match(source, /resolveColumnSettingsClient/);
  assert.match(source, /new EntityGridColumnSettingsApiClient\(this\.attributes\.client\)/);
  assert.match(source, /getGridColumnSettings: this\.methods\.getGridColumnSettings/);
  assert.match(source, /async getGridColumnSettings/);
  assert.match(source, /const client = this\.methods\.resolveColumnSettingsClient\(\);/);
  assert.match(source, /const gridId = this\.methods\.resolveGridKey\(options\?\.gridKey \?\? options\?\.gridId\);/);
  assert.match(source, /const userId = await this\.methods\.ensureCurrentUserId\(options\?\.userId\);/);
  assert.match(source, /const userId = await this\.methods\.ensureCurrentUserId\(\);/);
  assert.match(source, /client\.getCurrentUser/);
  assert.match(source, /\(Titanic as any\)\.CurrentUser/);
  assert.match(source, /getEntityGridColumnDefaultSettings/);
  assert.match(source, /getEntityGridColumnPersonalSettings/);
  assert.match(source, /const personalSettings =/);
  assert.match(source, /if \(personalSettings\) \{\s*return personalSettings;\s*\}/s);
  assert.match(source, /this\.methods\.getGridColumnSettings\(\{\s*scope: "personal"\s*\}\)/);
  assert.match(source, /span: this\.methods\.normalizeGridSpan\(column\.span \?\? defaultSpan\)/);
  assert.match(source, /span: column\.span \?\? column\.width/);
  assert.match(loadSource, /createDefaultColumnSettings\(\)/);
  assert.match(apiClientSource, /getEntityGridColumnPersonalSettings\?/);
  assert.match(apiClientSource, /async getEntityGridColumnPersonalSettings/);
  assert.match(apiClientSource, /value: isDefault/);

  assert.match(visibleColumnsSource, /const hasExplicitVisibleKeys = Array\.isArray\(this\.attributes\.visibleColumnKeys\);/);
  assert.doesNotMatch(visibleColumnsSource, /defaultVisibleColumnKeys/);
  assert.ok(
    resolveKeysSource.indexOf("this.attributes.activeColumnSettings.length > 0") <
      resolveKeysSource.indexOf("this.attributes.defaultVisibleColumnKeys"),
    "saved column settings must be checked before defaultVisibleColumnKeys"
  );
});

test("data grid sorts by header click and persists personal sort settings", () => {
  const source = readFileSync(resolve(sourceRoot, "dataGrid/data-grid.tsx"), "utf8");
  const modalSource = readFileSync(
    resolve(sourceRoot, "dataGridSettingsModalPage/components/EntityDataGridSettingsModalPage.tsx"),
    "utf8"
  );
  const modalContextSource = readFileSync(
    resolve(sourceRoot, "dataGridSettingsModalPage/model/EntityDataGridSettingsModalPageContext.ts"),
    "utf8"
  );
  const apiClientSource = readFileSync(resolve(apiSourceRoot, "services/EntityGridColumnSettingsClient.ts"), "utf8");
  const createQueryContextStart = source.indexOf("createQueryContext(this: any): Record<string, unknown>");
  const createQueryContextEnd = source.indexOf("buildQuery(this: any): unknown");
  const createQueryFingerprintStart = source.indexOf("createQueryFingerprint(this: any): string");
  const createQueryFingerprintEnd = source.indexOf("resolveStatusText(this: any): string");
  const loadStart = source.indexOf("async loadColumnSettings");
  const loadEnd = source.indexOf("async saveDefaultColumnSettings");
  const savePersonalStart = source.indexOf("async savePersonalColumnSettings");
  const savePersonalEnd = source.indexOf("resolveColumnSettingsRenderer");
  const renderHeaderStart = source.indexOf("renderHeaderCell(this: any, column: any)");
  const renderHeaderEnd = source.indexOf("renderBodyRow(this: any, row: any, rowIndex: number)");
  const renderModalStart = source.indexOf("renderColumnSettingsDialog(this: any)");
  const renderModalEnd = source.indexOf("renderMaybeDiff(this: any");
  const createQueryContextSource = source.slice(createQueryContextStart, createQueryContextEnd);
  const createQueryFingerprintSource = source.slice(createQueryFingerprintStart, createQueryFingerprintEnd);
  const loadSource = source.slice(loadStart, loadEnd);
  const savePersonalSource = source.slice(savePersonalStart, savePersonalEnd);
  const renderHeaderSource = source.slice(renderHeaderStart, renderHeaderEnd);
  const renderModalSource = source.slice(renderModalStart, renderModalEnd);

  assert.match(source, /sortSetting: \{ state: true, default: null \}/);
  assert.match(source, /effectiveOrders:/);
  assert.match(source, /normalizeSortSetting/);
  assert.match(source, /createOrderFromSortSetting/);
  assert.match(source, /resolveEffectiveOrders/);
  assert.match(source, /handleHeaderSortClick/);
  assert.match(createQueryContextSource, /orders: this\.attributes\.effectiveOrders/);
  assert.doesNotMatch(createQueryContextSource, /orders: this\.attributes\.orders/);
  assert.match(createQueryFingerprintSource, /orders: this\.attributes\.effectiveOrders/);
  assert.match(createQueryFingerprintSource, /sort: this\.attributes\.sortSetting/);
  assert.match(loadSource, /dto\.sort/);
  assert.match(loadSource, /setSortSetting/);
  assert.match(modalContextSource, /gridKey\?: string;/);
  assert.match(modalContextSource, /onSave\?: \(/);
  assert.match(modalSource, /onSave,/);
  assert.match(modalSource, /\(onSave \?\? onApply\)\(payload\.settings, mode, payload\.modeSettings\)/);
  assert.match(renderModalSource, /gridKey: this\.attributes\.resolvedGridKey/);
  assert.match(renderModalSource, /onSave: \(settings: any\[\], mode: string, modeSettings: Record<string, any>\) =>\s*this\.methods\.savePersonalColumnSettings\(settings, mode, modeSettings\)/s);
  assert.match(savePersonalSource, /saveEntityGridColumnPersonalSettings/);
  assert.match(savePersonalSource, /Array\.isArray\(settingsOrSortSetting\)/);
  assert.match(savePersonalSource, /setColumnSettingsState/);
  assert.match(savePersonalSource, /notifyVisibleColumnKeysChange/);
  assert.match(savePersonalSource, /isDefault: false/);
  assert.match(savePersonalSource, /sort: nextSort/);
  assert.match(renderHeaderSource, /Titanic\.UI\.Button/);
  assert.match(renderHeaderSource, /titanic-data-grid__sort-header-button/);
  assert.match(renderHeaderSource, /handleHeaderSortClick/);
  assert.match(renderHeaderSource, /titanic-data-grid__sort-header-icon_/);
  assert.match(apiClientSource, /saveEntityGridColumnPersonalSettings/);
  assert.match(apiClientSource, /saveEntityGridColumnSettingsByDefaultState\(request, false\)/);
  assert.match(apiClientSource, /getEntityGridColumnSettingsByDefaultState\(safeGridId, safeUserId, isDefault\)/);
});

test("grid settings api stores columns for the edited mode and scoped default state", () => {
  const apiClientSource = readFileSync(resolve(apiSourceRoot, "services/EntityGridColumnSettingsClient.ts"), "utf8");
  const saveStart = apiClientSource.indexOf("private async saveEntityGridColumnSettingsByDefaultState");
  const saveEnd = apiClientSource.indexOf("function mapEntityGridColumnSettingsRow");
  const payloadStart = apiClientSource.indexOf("function normalizeEntityGridColumnSettingsPayload");
  const payloadEnd = apiClientSource.indexOf("function normalizeEntityGridModeSettings");
  const saveSource = apiClientSource.slice(saveStart, saveEnd);
  const payloadSource = apiClientSource.slice(payloadStart, payloadEnd);

  assert.match(payloadSource, /const activeMode = columnSettingsMode \?\? displayMode;/);
  assert.match(payloadSource, /\[activeMode\]: \{ columns \}/);
  assert.doesNotMatch(payloadSource, /\[displayMode\]: \{ columns \}/);
  assert.match(saveSource, /\[columns\.isDefault\]: isDefault/);
  assert.doesNotMatch(saveSource, /\[columns\.isDefault\]: request\.isDefault \?\? isDefault/);
});
