import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const sourceRoot = resolve(import.meta.dirname, "../src");
const moduleCache = new Map();
let lastTimeInputProps = null;

const Titanic = {
  UI: {},
  modules: new Map(),
  define(name, schema) {
    const module = name === "Titanic.UI.EntityField" ? createEntityFieldComponent() : schema;
    this.modules.set(name, module);
    return module;
  },
  getReactModule(name) {
    return this.modules.get(name);
  }
};

const EntityColumnKind = {
  0: "String",
  1: "Text",
  2: "Number",
  3: "Boolean",
  4: "Date",
  5: "DateTime",
  6: "Time",
  7: "Lookup",
  8: "Color",
  9: "Json",
  String: 0,
  Text: 1,
  Number: 2,
  Boolean: 3,
  Date: 4,
  DateTime: 5,
  Time: 6,
  Lookup: 7,
  Color: 8,
  Json: 9
};

const EntityFieldKind = EntityColumnKind;

const legacyKindMap = {
  string: EntityColumnKind.String,
  text: EntityColumnKind.Text,
  number: EntityColumnKind.Number,
  boolean: EntityColumnKind.Boolean,
  date: EntityColumnKind.Date,
  datetime: EntityColumnKind.DateTime,
  dateTime: EntityColumnKind.DateTime,
  time: EntityColumnKind.Time,
  lookup: EntityColumnKind.Lookup,
  color: EntityColumnKind.Color,
  json: EntityColumnKind.Json
};

const kindCssNames = {
  [EntityColumnKind.String]: "string",
  [EntityColumnKind.Text]: "text",
  [EntityColumnKind.Number]: "number",
  [EntityColumnKind.Boolean]: "boolean",
  [EntityColumnKind.Date]: "date",
  [EntityColumnKind.DateTime]: "datetime",
  [EntityColumnKind.Time]: "time",
  [EntityColumnKind.Lookup]: "lookup",
  [EntityColumnKind.Color]: "color",
  [EntityColumnKind.Json]: "json"
};

function coerceEntityColumnKind(kind) {
  if (kind == null) {
    return undefined;
  }

  if (typeof kind === "number") {
    return typeof EntityColumnKind[kind] === "string" ? kind : undefined;
  }

  const enumValue = EntityColumnKind[kind];

  if (typeof enumValue === "number") {
    return enumValue;
  }

  const normalizedKind = String(kind).trim();

  return legacyKindMap[normalizedKind] ?? legacyKindMap[normalizedKind.toLowerCase()];
}

function getEntityColumnKindCssName(kind) {
  return kindCssNames[coerceEntityColumnKind(kind) ?? EntityColumnKind.String];
}

class StringColumn {
  constructor(name, value = "", options = {}) {
    this.name = name;
    this.value = value;
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
    this.jsonEditor = options.jsonEditor;
    this.defaultValue = options.defaultValue ?? value;
  }
}

function normalizeEntityColumn(column) {
  return {
    path: column.path ?? column.name,
    alias: column.alias,
    label: column.label,
    kind: coerceEntityColumnKind(column.kind),
    required: column.required,
    readOnly: column.readOnly,
    hidden: column.hidden,
    placeholder: column.placeholder,
    gridSpan: column.gridSpan,
    order: column.order,
    maxLength: column.maxLength,
    options: column.options,
    lookup: column.lookup,
    jsonEditor: column.jsonEditor,
    defaultValue: column.defaultValue
  };
}

function createEntityFieldComponent() {
  return function EntityField(props) {
    const context = getEntityFieldContext();
    const resolvedColumn = normalizeEntityFieldColumn(props.column);

    if (resolvedColumn.hidden) {
      return null;
    }

    const keyName = getEntityFieldColumnKey(resolvedColumn);
    const values = props.values ?? context?.values;

    if (!values) {
      throw new Error("EntityField requires values from props or EntityFieldProvider.");
    }

    const onChange = props.onChange ?? context?.onChange;

    if (typeof onChange !== "function") {
      throw new Error(`EntityField "${keyName}" requires onChange prop or EntityFieldProvider context.`);
    }

    const displayValues = props.displayValues ?? context?.displayValues;
    const validationErrors = props.validationErrors ?? context?.validationErrors;
    const validationError = props.validationError ?? validationErrors?.[keyName] ?? null;
    const fieldId = `titanic-field-${String(keyName).replace(/[^a-zA-Z0-9_-]/g, "-")}`;
    const kind = coerceEntityColumnKind(resolvedColumn.kind) ?? EntityColumnKind.String;
    const InputBuilder = Titanic.getReactModule("Titanic.UI.InputBuilder");

    return React.createElement(
      "div",
      {
        className: [
          "titanic-field",
          `titanic-field_${getEntityColumnKindCssName(kind)}`,
          validationError ? "titanic-field_error" : "",
          props.className
        ].filter(Boolean).join(" "),
        style: getEntityFieldGridSpanStyle(resolvedColumn)
      },
      React.createElement(
        "label",
        {
          className: "titanic-field__label",
          htmlFor: fieldId
        },
        resolvedColumn.label ?? keyName,
        resolvedColumn.required
          ? React.createElement("span", { "aria-hidden": true, className: "titanic-field__required" }, "*")
          : null
      ),
      React.createElement(InputBuilder, {
        column: resolvedColumn,
        displayValue: displayValues?.[keyName],
        fieldId,
        keyName,
        manualCommitDelayMs: props.manualCommitDelayMs ?? context?.manualCommitDelayMs ?? 700,
        onChange,
        readOnly: Boolean(props.disabled ?? context?.disabled ?? resolvedColumn.readOnly),
        validationError,
        value: getEntityFieldValue(values, keyName, resolvedColumn.defaultValue)
      }),
      validationError
        ? React.createElement("div", { className: "titanic-field__error", id: `${fieldId}-error` }, validationError)
        : null
    );
  };
}

function getEntityFieldContext() {
  const useEntityFieldContext = Titanic.UI.useEntityFieldContext;
  return typeof useEntityFieldContext === "function" ? useEntityFieldContext() : null;
}

function normalizeEntityFieldColumn(column) {
  const normalizedColumn = column ?? {};

  return {
    ...normalizedColumn,
    defaultValue: normalizedColumn.defaultValue,
    hidden: Boolean(normalizedColumn.hidden),
    kind: coerceEntityColumnKind(normalizedColumn.kind) ?? EntityColumnKind.String,
    label: normalizedColumn.label,
    path: normalizedColumn.path ?? normalizedColumn.alias ?? normalizedColumn.name ?? "",
    readOnly: Boolean(normalizedColumn.readOnly),
    required: Boolean(normalizedColumn.required),
    width: normalizedColumn.width
  };
}

function getEntityFieldColumnKey(column) {
  return column?.alias || column?.path || "";
}

function getEntityFieldValue(values, key, defaultValue) {
  return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : defaultValue ?? "";
}

function getEntityFieldGridSpanStyle(column) {
  const gridSpan = column?.width?.gridSpan;

  if (typeof gridSpan !== "number" || !Number.isFinite(gridSpan) || gridSpan <= 0) {
    return undefined;
  }

  return {
    "--titanic-grid-span": String(gridSpan)
  };
}

const mockDateInputModule = {
  DateInput: (props) => React.createElement("input", { value: props.value ?? "", readOnly: true })
};

const mockDateTimeInputModule = {
  DateTimeInput: (props) => React.createElement("input", { value: props.value ?? "", readOnly: true })
};

const mockJsonEditorModule = {
  EntityJsonEditor: (props) => React.createElement("textarea", { value: props.value ?? "", readOnly: true })
};

const mockLookupInputModule = {
  LookupInput: (props) => React.createElement("input", { value: props.displayValue ?? props.value ?? "", readOnly: true })
};

const mockTimeInputModule = {
  TimeInput: (props) => {
    lastTimeInputProps = props;

    return React.createElement("input", {
      className: "mock-time-input",
      value: props.value ?? "",
      readOnly: true
    });
  }
};

const mocks = {
  "@titanic-entity/entity-base": {
    defineComponentSchema: (schema) => schema,
    defineFieldSchema: (schema) => schema,
    useUiField: (_name, fallback) => fallback
  },
  "@titanic-entity/entity-core": {
    EntityColumnKind,
    EntityFieldKind,
    StringColumn,
    coerceEntityColumnKind,
    getColumnKey: (column) => column.key ?? column.name ?? column.path,
    getEntityColumnKindCssName,
    normalizeEntityColumn
  },
  "@titanic-entity/entity-react": {
    Titanic,
    useEntityLookupOptions: () => ({
      error: null,
      loading: false,
      options: [],
      reload: () => Promise.resolve()
    })
  },
  "@titanic-entity/entity-react/model": {
    entityReactComponentNames: {
      EntityField: "EntityField"
    },
    entityReactFieldNames: {
      EntityField: "EntityField"
    }
  },
  "../button/button": {
    Button: ({ children, unstyled: _unstyled, ...props }) => React.createElement("button", props, children)
  },
  "../dateInput": mockDateInputModule,
  "../dateInput/date-input": mockDateInputModule,
  "../dateTimeInput": mockDateTimeInputModule,
  "../dateTimeInput/date-time-input": mockDateTimeInputModule,
  "../jsonEditor/json-editor": mockJsonEditorModule,
  "../lookupInput": mockLookupInputModule,
  "../timeInput": mockTimeInputModule,
  "../timeInput/time-input": mockTimeInputModule,
  "./icons": {},
  "./lcz": {}
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

  const wrapper = new Function("require", "exports", "module", "__filename", "__dirname", "Titanic", compiled);
  wrapper(localRequire, module.exports, module, filePath, dirname(filePath), Titanic);

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

  const resolvedPath = candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile());

  if (!resolvedPath) {
    throw new Error(`Cannot resolve source module: ${modulePath}`);
  }

  return resolvedPath;
}

test("InputResolver maps EntityColumnKind.Time to time input", () => {
  const { InputResolver } = loadSourceModule("field/input-resolver.ts");

  assert.deepEqual(InputResolver.resolve({ path: "preferredContactTime", kind: EntityColumnKind.Time }), {
    fieldKind: EntityColumnKind.Time,
    inputKind: "time"
  });
});

test("EntityField renders TimeInput for time fields from context values", () => {
  const { EntityField } = loadSourceModule("field/index.ts");
  const { EntityFieldProvider } = loadSourceModule("field/field-context.tsx");
  lastTimeInputProps = null;

  const markup = renderToStaticMarkup(
    React.createElement(
      EntityFieldProvider,
      {
        value: {
          values: { preferredContactTime: "09:30" },
          onChange() {}
        }
      },
      React.createElement(EntityField, {
        column: new StringColumn("preferredContactTime", "", {
          label: "Preferred contact time",
          kind: EntityColumnKind.Time
        })
      })
    )
  );

  assert.match(markup, /titanic-field_time/);
  assert.match(markup, /mock-time-input/);
  assert.match(markup, /value="09:30"/);
  assert.equal(lastTimeInputProps.renderFrame, false);
  assert.equal(lastTimeInputProps.value, "09:30");
});

test("formatTime normalizes empty, time-only, and datetime-like values", () => {
  const { formatTime } = loadSourceModule("field/input-builder.tsx");

  assert.equal(formatTime(null), "");
  assert.equal(formatTime(undefined), "");
  assert.equal(formatTime(""), "");
  assert.equal(formatTime("09:30"), "09:30");
  assert.equal(formatTime("2026-07-13T10:00"), "10:00");
  assert.equal(formatTime("2026-07-13 7:05:00"), "07:05");
});

test("time onChange keeps selected time and clears to empty string", () => {
  const { EntityField } = loadSourceModule("field/index.ts");
  const { EntityFieldProvider } = loadSourceModule("field/field-context.tsx");
  const changes = [];
  lastTimeInputProps = null;

  renderToStaticMarkup(
    React.createElement(
      EntityFieldProvider,
      {
        value: {
          values: { preferredContactTime: "09:30" },
          onChange: (key, value) => changes.push([key, value])
        }
      },
      React.createElement(EntityField, {
        column: new StringColumn("preferredContactTime", "", {
          label: "Preferred contact time",
          kind: EntityColumnKind.Time
        })
      })
    )
  );

  lastTimeInputProps.onChange("10:15");
  lastTimeInputProps.onChange(null);

  assert.deepEqual(changes, [
    ["preferredContactTime", "10:15"],
    ["preferredContactTime", ""]
  ]);
});
