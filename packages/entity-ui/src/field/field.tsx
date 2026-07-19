Titanic.define("Titanic.UI.EntityField", {
  attributes: {
    column: {},
    values: {},
    displayValues: {},
    validationError: {},
    validationErrors: {},
    onChange: {},
    disabled: {},
    className: {},
    manualCommitDelayMs: {},
    context: {
      value(this: any): any {
        return this.methods.getContext();
      }
    },
    resolvedColumn: {
      value(this: any): any {
        return this.methods.normalizeColumn(this.attributes.column);
      }
    },
    hidden: {
      value(this: any): boolean {
        return Boolean(this.attributes.resolvedColumn.hidden);
      }
    },
    keyName: {
      value(this: any): string {
        return this.methods.getColumnKey(this.attributes.resolvedColumn);
      }
    },
    kind: {
      value(this: any): number {
        return this.methods.coerceKind(this.attributes.resolvedColumn.kind);
      }
    },
    resolvedValues: {
      value(this: any): any {
        return this.attributes.values ?? this.attributes.context?.values;
      }
    },
    resolvedDisplayValues: {
      value(this: any): any {
        return this.attributes.displayValues ?? this.attributes.context?.displayValues;
      }
    },
    resolvedValidationErrors: {
      value(this: any): any {
        return this.attributes.validationErrors ?? this.attributes.context?.validationErrors;
      }
    },
    resolvedOnChange: {
      value(this: any): any {
        const onChange = this.attributes.onChange ?? this.attributes.context?.onChange;

        if (this.attributes.hidden || typeof onChange === "function") {
          return onChange;
        }

        throw new Error(`EntityField "${this.attributes.keyName}" requires onChange prop or EntityFieldProvider context.`);
      }
    },
    resolvedDisabled: {
      value(this: any): boolean {
        return Boolean(this.attributes.disabled ?? this.attributes.context?.disabled ?? false);
      }
    },
    resolvedManualCommitDelayMs: {
      value(this: any): number {
        return this.attributes.manualCommitDelayMs ?? this.attributes.context?.manualCommitDelayMs ?? 700;
      }
    },
    fieldValue: {
      value(this: any): unknown {
        if (this.attributes.hidden) {
          return undefined;
        }

        const values = this.attributes.resolvedValues;

        if (!values) {
          throw new Error("EntityField requires values from props or EntityFieldProvider.");
        }

        return this.methods.getFieldValue(values, this.attributes.keyName, this.attributes.resolvedColumn.defaultValue);
      }
    },
    displayValue: {
      value(this: any): string | undefined {
        return this.attributes.resolvedDisplayValues?.[this.attributes.keyName];
      }
    },
    fieldId: {
      value(this: any): string {
        return `titanic-field-${String(this.attributes.keyName).replace(/[^a-zA-Z0-9_-]/g, "-")}`;
      }
    },
    readOnly: {
      value(this: any): boolean {
        return this.attributes.resolvedDisabled || Boolean(this.attributes.resolvedColumn.readOnly);
      }
    },
    required: {
      value(this: any): boolean {
        return Boolean(this.attributes.resolvedColumn.required);
      }
    },
    resolvedValidationError: {
      value(this: any): string | null {
        return this.attributes.validationError ?? this.attributes.resolvedValidationErrors?.[this.attributes.keyName] ?? null;
      }
    },
    hasValidationError: {
      value(this: any): boolean {
        return Boolean(this.attributes.resolvedValidationError);
      }
    },
    errorId: {
      value(this: any): string | undefined {
        return this.attributes.hasValidationError ? `${this.attributes.fieldId}-error` : undefined;
      }
    },
    fieldClassName: {
      value(this: any): string {
        return [
          "titanic-field",
          `titanic-field_${this.methods.getKindCssName(this.attributes.kind)}`,
          this.attributes.hasValidationError ? "titanic-field_error" : "",
          this.attributes.className
        ].filter(Boolean).join(" ");
      }
    },
    gridSpanStyle: {
      value(this: any): Record<string, string> | undefined {
        return this.methods.getGridSpanStyle(this.attributes.resolvedColumn);
      }
    },
    labelText: {
      value(this: any): string {
        return this.attributes.resolvedColumn.label ?? this.attributes.keyName;
      }
    }
  },
  methods: {
    getContext(): any {
      const ui = (Titanic as any).UI;
      return typeof ui?.useEntityFieldContext === "function" ? ui.useEntityFieldContext() : null;
    },
    normalizeColumn(column: any): any {
      const normalizedColumn = column ?? {};

      return {
        ...normalizedColumn,
        alias: normalizedColumn.alias,
        defaultValue: normalizedColumn.defaultValue,
        displayPath: normalizedColumn.displayPath,
        hidden: Boolean(normalizedColumn.hidden),
        kind: (this as any).methods.coerceKind(normalizedColumn.kind),
        label: normalizedColumn.label,
        lookup: normalizedColumn.lookup,
        lookupMode: normalizedColumn.lookupMode,
        maxLength: normalizedColumn.maxLength,
        path: normalizedColumn.path ?? normalizedColumn.alias ?? "",
        placeholder: normalizedColumn.placeholder,
        readOnly: Boolean(normalizedColumn.readOnly),
        required: Boolean(normalizedColumn.required),
        width: normalizedColumn.width
      };
    },
    coerceKind(kind: any): number {
      if (typeof kind === "number" && Number.isFinite(kind)) {
        return kind;
      }

      const normalizedKind = typeof kind === "string" ? kind.trim().toLowerCase() : "";
      const kinds: Record<string, number> = {
        boolean: 3,
        color: 8,
        date: 4,
        datetime: 5,
        json: 9,
        lookup: 7,
        number: 2,
        string: 0,
        text: 1,
        time: 6
      };

      return kinds[normalizedKind] ?? 0;
    },
    getKindCssName(kind: number): string {
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
    },
    getColumnKey(column: any): string {
      return column?.alias || column?.path || "";
    },
    getFieldValue(values: any, key: string, defaultValue: unknown): unknown {
      if (Object.prototype.hasOwnProperty.call(values, key)) {
        return values[key];
      }

      return defaultValue ?? "";
    },
    getGridSpanStyle(column: any): Record<string, string> | undefined {
      const gridSpan = column?.width?.gridSpan;

      if (typeof gridSpan !== "number" || !Number.isFinite(gridSpan) || gridSpan <= 0) {
        return undefined;
      }

      return {
        "--titanic-grid-span": String(gridSpan)
      };
    }
  },
  diff: [
    {
      tag: "div",
      unless: { attr: "hidden" },
      props: {
        className: { attr: "fieldClassName" },
        style: { attr: "gridSpanStyle" }
      },
      children: [
        {
          tag: "label",
          props: {
            className: "titanic-field__label",
            htmlFor: { attr: "fieldId" }
          },
          children: [
            { text: { attr: "labelText" } },
            {
              tag: "span",
              when: { attr: "required" },
              props: {
                "aria-hidden": true,
                className: "titanic-field__required"
              },
              text: "*"
            }
          ]
        },
        {
          component: "Titanic.UI.InputBuilder",
          props: {
            column: { attr: "resolvedColumn" },
            displayValue: { attr: "displayValue" },
            fieldId: { attr: "fieldId" },
            keyName: { attr: "keyName" },
            manualCommitDelayMs: { attr: "resolvedManualCommitDelayMs" },
            onChange: { attr: "resolvedOnChange" },
            readOnly: { attr: "readOnly" },
            validationError: { attr: "resolvedValidationError" },
            value: { attr: "fieldValue" }
          }
        },
        {
          tag: "div",
          when: { attr: "resolvedValidationError" },
          props: {
            className: "titanic-field__error",
            id: { attr: "errorId" }
          },
          text: { attr: "resolvedValidationError" }
        }
      ]
    }
  ]
});
