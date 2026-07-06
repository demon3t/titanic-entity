import { useEffect, useMemo, useRef, useState } from "react";
import type {
  EntityJsonEditorLabels,
  EntityJsonEditorMode,
  EntityJsonEditorOptions,
  EntityJsonObject,
  EntityJsonRequiredField,
  EntityJsonValue,
  EntityJsonValueKind
} from "@titanic-entity/entity-core";

export type {
  EntityJsonEditorLabels,
  EntityJsonEditorMode,
  EntityJsonEditorOptions,
  EntityJsonRequiredField,
  EntityJsonValue,
  EntityJsonValueKind
} from "@titanic-entity/entity-core";

export interface EntityJsonEditorProps extends EntityJsonEditorOptions {
  id?: string;
  name?: string;
  value?: string | EntityJsonValue | null;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  onChange?: (value: string) => void;
  onValidityChange?: (valid: boolean, error: string | null) => void;
}

const defaultLabels: EntityJsonEditorLabels = {
  textMode: "Text",
  fieldsMode: "Fields",
  addField: "Add field",
  addItem: "Add item",
  removeField: "Remove",
  requiredField: "Required",
  fieldName: "Name",
  fieldType: "Type",
  value: "Value",
  invalidJson: "Invalid JSON",
  emptyObject: "No fields",
  stringType: "String",
  numberType: "Number",
  booleanType: "Boolean",
  nullType: "Null",
  objectType: "Object",
  arrayType: "Array"
};

const typeOptions: readonly EntityJsonValueKind[] = ["string", "number", "boolean", "null", "object", "array"];

export function EntityJsonEditor({
  id,
  name,
  value,
  disabled = false,
  required = false,
  className = "",
  defaultMode = "text",
  minRows = 10,
  requiredFields = [],
  labels,
  onChange,
  onValidityChange
}: EntityJsonEditorProps) {
  const resolvedLabels = useMemo(() => ({ ...defaultLabels, ...labels }), [labels]);
  const requiredFieldMap = useMemo(() => createRequiredFieldMap(requiredFields), [requiredFields]);
  const requiredFingerprint = useMemo(() => JSON.stringify(requiredFields), [requiredFields]);
  const lastEmittedRef = useRef<string | null>(null);
  const [mode, setMode] = useState<EntityJsonEditorMode>(defaultMode);
  const [documentValue, setDocumentValue] = useState<EntityJsonValue>(() =>
    normalizeJsonValue(parseIncomingValue(value).value, requiredFields)
  );
  const [textDraft, setTextDraft] = useState(() => formatJson(documentValue));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const parsed = parseIncomingValue(value);
    const normalized = normalizeJsonValue(parsed.value, requiredFields);
    const serialized = serializeJson(normalized);

    if (lastEmittedRef.current === serialized) {
      return;
    }

    setDocumentValue(normalized);
    setTextDraft(parsed.error ? String(value ?? "") : formatJson(normalized));
    setError(parsed.error);
    onValidityChange?.(!parsed.error, parsed.error);
  }, [onValidityChange, requiredFields, requiredFingerprint, value]);

  const emitValue = (nextValue: EntityJsonValue, updateText: boolean) => {
    const normalized = normalizeJsonValue(nextValue, requiredFields);
    const serialized = serializeJson(normalized);

    lastEmittedRef.current = serialized;
    setDocumentValue(normalized);
    setError(null);
    onValidityChange?.(true, null);
    onChange?.(serialized);

    if (updateText) {
      setTextDraft(formatJson(normalized));
    }
  };

  const handleTextChange = (nextText: string) => {
    setTextDraft(nextText);

    const parsed = parseTextValue(nextText);
    if (parsed.error) {
      setError(parsed.error);
      onValidityChange?.(false, parsed.error);
      return;
    }

    emitValue(parsed.value, false);
  };

  const handleTextBlur = () => {
    const parsed = parseTextValue(textDraft);
    if (parsed.error) {
      setError(parsed.error);
      onValidityChange?.(false, parsed.error);
      return;
    }

    emitValue(parsed.value, true);
  };

  const switchMode = (nextMode: EntityJsonEditorMode) => {
    if (nextMode === mode) {
      return;
    }

    if (mode === "text") {
      const parsed = parseTextValue(textDraft);
      if (parsed.error) {
        setError(parsed.error);
        onValidityChange?.(false, parsed.error);
        return;
      }

      emitValue(parsed.value, nextMode === "text");
    }

    if (nextMode === "text") {
      setTextDraft(formatJson(documentValue));
    }

    setMode(nextMode);
  };

  const updateDocument = (updater: (current: EntityJsonValue) => EntityJsonValue) => {
    emitValue(updater(documentValue), true);
  };

  const rootClassName = ["titanic-json-editor", className].filter(Boolean).join(" ");

  return (
    <div className={rootClassName}>
      <div className="titanic-json-editor__toolbar" role="tablist" aria-label={name ?? id}>
        <button
          aria-selected={mode === "text"}
          className={mode === "text" ? "titanic-json-editor__mode titanic-json-editor__mode_active" : "titanic-json-editor__mode"}
          disabled={disabled}
          role="tab"
          type="button"
          onClick={() => switchMode("text")}
        >
          {resolvedLabels.textMode}
        </button>
        <button
          aria-selected={mode === "fields"}
          className={mode === "fields" ? "titanic-json-editor__mode titanic-json-editor__mode_active" : "titanic-json-editor__mode"}
          disabled={disabled}
          role="tab"
          type="button"
          onClick={() => switchMode("fields")}
        >
          {resolvedLabels.fieldsMode}
        </button>
      </div>

      {mode === "text" ? (
        <textarea
          className="titanic-json-editor__textarea"
          disabled={disabled}
          id={id}
          name={name}
          required={required}
          rows={minRows}
          spellCheck={false}
          value={textDraft}
          onBlur={handleTextBlur}
          onChange={(event) => handleTextChange(event.target.value)}
        />
      ) : (
        <JsonFieldsTree
          disabled={disabled}
          labels={resolvedLabels}
          path={[]}
          requiredFieldMap={requiredFieldMap}
          value={ensureEditableContainer(documentValue)}
          onChange={updateDocument}
        />
      )}

      {error ? <p className="titanic-json-editor__error">{resolvedLabels.invalidJson}: {error}</p> : null}
    </div>
  );
}

function JsonFieldsTree({
  disabled,
  labels,
  path,
  requiredFieldMap,
  value,
  onChange
}: {
  disabled: boolean;
  labels: EntityJsonEditorLabels;
  path: readonly string[];
  requiredFieldMap: ReadonlyMap<string, EntityJsonRequiredField>;
  value: EntityJsonValue;
  onChange: (updater: (current: EntityJsonValue) => EntityJsonValue) => void;
}) {
  if (Array.isArray(value)) {
    return (
      <div className="titanic-json-editor__fields">
        {value.map((item, index) => (
          <JsonFieldRow
            disabled={disabled}
          key={`${path.join(".")}.${index}`}
          labels={labels}
          parentIsArray={true}
          path={[...path, String(index)]}
          propertyName={String(index)}
            requiredFieldMap={requiredFieldMap}
            value={item}
            onChange={onChange}
          />
        ))}
        <button
          className="titanic-json-editor__add-button"
          disabled={disabled}
          type="button"
          onClick={() => onChange((current) => updateValueAtPath(current, path, (container) => (
            Array.isArray(container) ? [...container, ""] : [""]
          )))}
        >
          + {labels.addItem}
        </button>
      </div>
    );
  }

  if (!isJsonObject(value)) {
    return (
      <JsonPrimitiveInput
        disabled={disabled}
        labels={labels}
        path={path}
        value={value}
        onChange={onChange}
      />
    );
  }

  const entries = Object.entries(value);

  return (
    <div className="titanic-json-editor__fields">
      {entries.length === 0 ? <p className="titanic-json-editor__empty">{labels.emptyObject}</p> : null}
      {entries.map(([key, item]) => (
        <JsonFieldRow
          disabled={disabled}
          key={[...path, key].join(".")}
          labels={labels}
          parentIsArray={false}
          path={[...path, key]}
          propertyName={key}
          requiredFieldMap={requiredFieldMap}
          value={item}
          onChange={onChange}
        />
      ))}
      <button
        className="titanic-json-editor__add-button"
        disabled={disabled}
        type="button"
        onClick={() => onChange((current) => updateValueAtPath(current, path, (container) => addObjectField(container)))}
      >
        + {labels.addField}
      </button>
    </div>
  );
}

function JsonFieldRow({
  disabled,
  labels,
  parentIsArray,
  path,
  propertyName,
  requiredFieldMap,
  value,
  onChange
}: {
  disabled: boolean;
  labels: EntityJsonEditorLabels;
  parentIsArray: boolean;
  path: readonly string[];
  propertyName: string;
  requiredFieldMap: ReadonlyMap<string, EntityJsonRequiredField>;
  value: EntityJsonValue;
  onChange: (updater: (current: EntityJsonValue) => EntityJsonValue) => void;
}) {
  const pathKey = path.join(".");
  const parentPath = path.slice(0, -1);
  const requiredField = requiredFieldMap.get(pathKey);
  const locked = isRequiredOrRequiredParent(pathKey, requiredFieldMap);
  const typeLocked = locked && Boolean(requiredField ? getValueKind(requiredField.defaultValue ?? "") : isJsonObject(value) || Array.isArray(value));
  const valueKind = getValueKind(value);
  const fieldNameId = `titanic-json-field-name-${toDomId(pathKey)}`;
  const typeId = `titanic-json-field-type-${toDomId(pathKey)}`;

  const renameField = (nextName: string) => {
    const normalizedName = nextName.trim();
    if (!normalizedName || normalizedName === propertyName || locked) {
      return;
    }

    onChange((current) => renameObjectField(current, parentPath, propertyName, normalizedName));
  };

  const changeType = (nextType: EntityJsonValueKind) => {
    if (typeLocked) {
      return;
    }

    onChange((current) => updateValueAtPath(current, path, (currentValue) => coerceValueToKind(currentValue, nextType)));
  };

  const removeField = () => {
    if (locked) {
      return;
    }

    onChange((current) => removeValueAtPath(current, path));
  };

  return (
    <article className={locked ? "titanic-json-editor__field titanic-json-editor__field_required" : "titanic-json-editor__field"}>
      <div className="titanic-json-editor__field-header">
        <label className="titanic-json-editor__name-label" htmlFor={fieldNameId}>
          <span>{labels.fieldName}</span>
          <input
            disabled={disabled || locked || parentIsArray}
            id={fieldNameId}
            name={fieldNameId}
            value={propertyName}
            onChange={(event) => renameField(event.target.value)}
          />
        </label>
        <label className="titanic-json-editor__type-label" htmlFor={typeId}>
          <span>{labels.fieldType}</span>
          <select
            disabled={disabled || Boolean(typeLocked)}
            id={typeId}
            name={typeId}
            value={valueKind}
            onChange={(event) => changeType(event.target.value as EntityJsonValueKind)}
          >
            {typeOptions.map((type) => (
              <option key={type} value={type}>{getTypeLabel(type, labels)}</option>
            ))}
          </select>
        </label>
        {locked ? <span className="titanic-json-editor__required-pill">{requiredField?.label ?? labels.requiredField}</span> : null}
        <button
          className="titanic-json-editor__remove-button"
          disabled={disabled || locked}
          type="button"
          onClick={removeField}
        >
          {labels.removeField}
        </button>
      </div>

      {isJsonObject(value) || Array.isArray(value) ? (
        <JsonFieldsTree
          disabled={disabled}
          labels={labels}
          path={path}
          requiredFieldMap={requiredFieldMap}
          value={value}
          onChange={onChange}
        />
      ) : (
        <JsonPrimitiveInput
          disabled={disabled}
          labels={labels}
          path={path}
          value={value}
          onChange={onChange}
        />
      )}
    </article>
  );
}

function JsonPrimitiveInput({
  disabled,
  labels,
  path,
  value,
  onChange
}: {
  disabled: boolean;
  labels: EntityJsonEditorLabels;
  path: readonly string[];
  value: EntityJsonValue;
  onChange: (updater: (current: EntityJsonValue) => EntityJsonValue) => void;
}) {
  const inputId = `titanic-json-field-value-${toDomId(path.join("."))}`;

  if (typeof value === "boolean") {
    return (
      <label className="titanic-json-editor__value-label" htmlFor={inputId}>
        <span>{labels.value}</span>
        <select
          disabled={disabled}
          id={inputId}
          name={inputId}
          value={String(value)}
          onChange={(event) => onChange((current) => updateValueAtPath(current, path, () => event.target.value === "true"))}
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      </label>
    );
  }

  if (value === null) {
    return (
      <label className="titanic-json-editor__value-label" htmlFor={inputId}>
        <span>{labels.value}</span>
        <input disabled id={inputId} name={inputId} value="null" readOnly />
      </label>
    );
  }

  if (typeof value === "number") {
    return (
      <label className="titanic-json-editor__value-label" htmlFor={inputId}>
        <span>{labels.value}</span>
        <input
          disabled={disabled}
          id={inputId}
          name={inputId}
          type="number"
          value={Number.isFinite(value) ? value : 0}
          onChange={(event) => onChange((current) => updateValueAtPath(current, path, () => parseNumberValue(event.target.value)))}
        />
      </label>
    );
  }

  return (
    <label className="titanic-json-editor__value-label" htmlFor={inputId}>
      <span>{labels.value}</span>
      <input
        disabled={disabled}
        id={inputId}
        name={inputId}
        value={String(value ?? "")}
        onChange={(event) => onChange((current) => updateValueAtPath(current, path, () => event.target.value))}
      />
    </label>
  );
}

function parseIncomingValue(value: EntityJsonEditorProps["value"]): { value: EntityJsonValue; error: string | null } {
  if (typeof value === "string") {
    return parseTextValue(value.trim() ? value : "{}");
  }

  if (value === undefined) {
    return { value: {}, error: null };
  }

  return { value: toJsonValue(value), error: null };
}

function parseTextValue(value: string): { value: EntityJsonValue; error: string | null } {
  try {
    return { value: toJsonValue(JSON.parse(value.trim() || "{}")), error: null };
  } catch (error) {
    return { value: {}, error: error instanceof Error ? error.message : String(error) };
  }
}

function normalizeJsonValue(value: EntityJsonValue, requiredFields: readonly EntityJsonRequiredField[]): EntityJsonValue {
  if (requiredFields.length === 0) {
    return value;
  }

  let nextValue: EntityJsonValue = isJsonObject(value) ? cloneJsonValue(value) : {};

  for (const field of requiredFields) {
    const path = splitPath(field.path);
    if (path.length === 0 || hasValueAtPath(nextValue, path)) {
      continue;
    }

    nextValue = setValueAtPath(nextValue, path, cloneJsonValue(field.defaultValue ?? ""));
  }

  return nextValue;
}

function ensureEditableContainer(value: EntityJsonValue): EntityJsonValue {
  return isJsonObject(value) || Array.isArray(value) ? value : {};
}

function serializeJson(value: EntityJsonValue): string {
  return JSON.stringify(value);
}

function formatJson(value: EntityJsonValue): string {
  return JSON.stringify(value, null, 2);
}

function createRequiredFieldMap(fields: readonly EntityJsonRequiredField[]): ReadonlyMap<string, EntityJsonRequiredField> {
  return new Map(fields
    .map((field) => [splitPath(field.path).join("."), field] as const)
    .filter(([path]) => Boolean(path)));
}

function isRequiredOrRequiredParent(path: string, requiredFieldMap: ReadonlyMap<string, EntityJsonRequiredField>): boolean {
  if (!path) {
    return false;
  }

  if (requiredFieldMap.has(path)) {
    return true;
  }

  for (const requiredPath of requiredFieldMap.keys()) {
    if (requiredPath.startsWith(`${path}.`)) {
      return true;
    }
  }

  return false;
}

function splitPath(path: string): string[] {
  return path
    .split(".")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toJsonValue(value: unknown): EntityJsonValue {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value as EntityJsonValue;
  }

  if (Array.isArray(value)) {
    return value.map(toJsonValue);
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, toJsonValue(item)])
    );
  }

  return String(value);
}

function cloneJsonValue<TValue extends EntityJsonValue | undefined>(value: TValue): TValue {
  if (value === undefined) {
    return value;
  }

  return JSON.parse(JSON.stringify(value)) as TValue;
}

function isJsonObject(value: EntityJsonValue): value is EntityJsonObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasValueAtPath(value: EntityJsonValue, path: readonly string[]): boolean {
  let current: EntityJsonValue | undefined = value;

  for (const part of path) {
    if (!isJsonObject(current) && !Array.isArray(current)) {
      return false;
    }

    if (!(part in current)) {
      return false;
    }

    current = (current as Record<string, EntityJsonValue>)[part];
  }

  return true;
}

function setValueAtPath(value: EntityJsonValue, path: readonly string[], nextValue: EntityJsonValue): EntityJsonValue {
  if (path.length === 0) {
    return nextValue;
  }

  const [head, ...tail] = path;
  const container = isJsonObject(value) ? { ...value } : {};

  container[head] = setValueAtPath(container[head] ?? {}, tail, nextValue);
  return container;
}

function updateValueAtPath(
  value: EntityJsonValue,
  path: readonly string[],
  updater: (current: EntityJsonValue) => EntityJsonValue
): EntityJsonValue {
  if (path.length === 0) {
    return updater(value);
  }

  const [head, ...tail] = path;

  if (Array.isArray(value)) {
    const index = Number(head);
    return value.map((item, itemIndex) => itemIndex === index ? updateValueAtPath(item, tail, updater) : item);
  }

  const container = isJsonObject(value) ? { ...value } : {};
  container[head] = updateValueAtPath(container[head] ?? {}, tail, updater);
  return container;
}

function removeValueAtPath(value: EntityJsonValue, path: readonly string[]): EntityJsonValue {
  if (path.length === 0) {
    return {};
  }

  const [head, ...tail] = path;

  if (Array.isArray(value)) {
    const index = Number(head);
    return tail.length === 0
      ? value.filter((_, itemIndex) => itemIndex !== index)
      : value.map((item, itemIndex) => itemIndex === index ? removeValueAtPath(item, tail) : item);
  }

  if (!isJsonObject(value)) {
    return value;
  }

  const container = { ...value };

  if (tail.length === 0) {
    delete container[head];
    return container;
  }

  container[head] = removeValueAtPath(container[head] ?? {}, tail);
  return container;
}

function renameObjectField(value: EntityJsonValue, parentPath: readonly string[], oldName: string, newName: string): EntityJsonValue {
  return updateValueAtPath(value, parentPath, (container) => {
    if (!isJsonObject(container) || Object.prototype.hasOwnProperty.call(container, newName)) {
      return container;
    }

    const nextContainer: EntityJsonObject = {};
    for (const [key, item] of Object.entries(container)) {
      if (key === oldName) {
        nextContainer[newName] = item;
      } else {
        nextContainer[key] = item;
      }
    }

    return nextContainer;
  });
}

function addObjectField(value: EntityJsonValue): EntityJsonValue {
  const container = isJsonObject(value) ? { ...value } : {};
  let index = Object.keys(container).length + 1;
  let key = `field${index}`;

  while (Object.prototype.hasOwnProperty.call(container, key)) {
    index += 1;
    key = `field${index}`;
  }

  container[key] = "";
  return container;
}

function getValueKind(value: EntityJsonValue): EntityJsonValueKind {
  if (Array.isArray(value)) {
    return "array";
  }

  if (isJsonObject(value)) {
    return "object";
  }

  if (value === null) {
    return "null";
  }

  return typeof value as EntityJsonValueKind;
}

function coerceValueToKind(value: EntityJsonValue, kind: EntityJsonValueKind): EntityJsonValue {
  switch (kind) {
    case "number":
      return typeof value === "number" ? value : parseNumberValue(String(value ?? ""));
    case "boolean":
      return typeof value === "boolean" ? value : Boolean(value);
    case "null":
      return null;
    case "object":
      return isJsonObject(value) ? value : {};
    case "array":
      return Array.isArray(value) ? value : [];
    default:
      return typeof value === "string" ? value : String(value ?? "");
  }
}

function parseNumberValue(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getTypeLabel(kind: EntityJsonValueKind, labels: EntityJsonEditorLabels): string {
  switch (kind) {
    case "number":
      return labels.numberType;
    case "boolean":
      return labels.booleanType;
    case "null":
      return labels.nullType;
    case "object":
      return labels.objectType;
    case "array":
      return labels.arrayType;
    default:
      return labels.stringType;
  }
}

function toDomId(value: string): string {
  return value.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "") || "root";
}
