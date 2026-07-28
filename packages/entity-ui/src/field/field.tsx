import { Titanic } from "@titanic-entity/entity-react";
import { getColumnKey, normalizeEntityColumn } from "@titanic-entity/entity-core";
import type { CSSProperties } from "react";
import { useEntityFieldContext } from "./field-context";
import { InputBuilder } from "./input-builder";
import type { EntityFieldProps } from "./index";

export const EntityField = Titanic.define<EntityFieldProps>("Titanic.UI.EntityField", function EntityField({
  column,
  values,
  displayValues,
  validationError,
  validationErrors,
  onChange,
  disabled,
  className,
  manualCommitDelayMs
}: EntityFieldProps) {
  const context = useEntityFieldContext();
  const resolvedColumn = normalizeEntityColumn(column);

  if (resolvedColumn.hidden) {
    return null;
  }

  const keyName = getColumnKey(resolvedColumn);
  const resolvedValues = values ?? context?.values;

  if (!resolvedValues) {
    throw new Error("EntityField requires values from props or EntityFieldProvider.");
  }

  const resolvedOnChange = onChange ?? context?.onChange;

  if (typeof resolvedOnChange !== "function") {
    throw new Error(`EntityField "${keyName}" requires onChange prop or EntityFieldProvider context.`);
  }

  const kind = resolvedColumn.kind ?? 0;
  const resolvedDisplayValues = displayValues ?? context?.displayValues;
  const resolvedValidationErrors = validationErrors ?? context?.validationErrors;
  const resolvedValidationError = validationError ?? resolvedValidationErrors?.[keyName] ?? null;
  const fieldId = `titanic-field-${String(keyName).replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  const fieldValue = Object.prototype.hasOwnProperty.call(resolvedValues, keyName)
    ? resolvedValues[keyName]
    : resolvedColumn.defaultValue ?? "";
  const readOnly = Boolean(disabled ?? context?.disabled ?? false) || Boolean(resolvedColumn.readOnly);
  const required = Boolean(resolvedColumn.required);
  const gridSpan = resolvedColumn.gridSpan;
  const gridSpanStyle = typeof gridSpan === "number" && Number.isFinite(gridSpan) && gridSpan > 0
    ? { "--titanic-grid-span": String(gridSpan) } as CSSProperties
    : undefined;

  return (
    <div
      className={[
        "titanic-field",
        `titanic-field_${getKindCssName(kind)}`,
        resolvedValidationError ? "titanic-field_error" : undefined,
        className
      ].filter(Boolean).join(" ")}
      style={gridSpanStyle}
    >
      <label className="titanic-field__label" htmlFor={fieldId}>
        {resolvedColumn.label ?? keyName}
        {required ? <span aria-hidden="true" className="titanic-field__required">*</span> : null}
      </label>
      <InputBuilder
        column={resolvedColumn}
        displayValue={resolvedDisplayValues?.[keyName]}
        fieldId={fieldId}
        keyName={keyName}
        manualCommitDelayMs={manualCommitDelayMs ?? context?.manualCommitDelayMs ?? 700}
        onChange={resolvedOnChange}
        readOnly={readOnly}
        validationError={resolvedValidationError}
        value={fieldValue}
      />
      {resolvedValidationError ? (
        <div className="titanic-field__error" id={`${fieldId}-error`}>
          {resolvedValidationError}
        </div>
      ) : null}
    </div>
  );
});

function getKindCssName(kind: number): string {
  const names: Record<number, string> = {
    0: "string",
    1: "text",
    2: "number",
    3: "boolean",
    4: "date",
    5: "date-time",
    6: "time",
    7: "lookup",
    8: "color",
    9: "json"
  };

  return names[kind] ?? "string";
}
