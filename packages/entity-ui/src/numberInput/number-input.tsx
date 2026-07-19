Titanic.define("Titanic.UI.NumberInput", {
  attributes: {
    id: {},
    name: {},
    value: {},
    disabled: {},
    className: {},
    editable: { default: true },
    required: { default: false },
    title: {},
    validationError: {},
    visible: { default: true },
    onChange: {},
    fallbackId: { id: true },
    resolvedId: {
      value(this: any): string {
        return this.attributes.id ?? this.attributes.fallbackId;
      }
    },
    resolvedName: {
      value(this: any): string {
        return this.attributes.name ?? this.attributes.id ?? String(this.attributes.fallbackId).replace(/:/g, "");
      }
    },
    readOnly: {
      value(this: any): boolean {
        return Boolean(this.attributes.disabled) || !this.attributes.editable;
      }
    },
    errorId: {
      value(this: any): string | undefined {
        return this.attributes.validationError ? `${this.attributes.resolvedId}-error` : undefined;
      }
    },
    hasValidationError: {
      value(this: any): boolean {
        return Boolean(this.attributes.validationError);
      }
    },
    inputValue: {
      value(this: any): string | number {
        return this.attributes.value ?? "";
      }
    }
  },
  methods: {
    handleChange(this: any, event: any): void {
      const onChange = this.attributes.onChange;

      if (typeof onChange !== "function") {
        return;
      }

      onChange(event.target.value === "" ? null : Number(event.target.value));
    }
  },
  diff: [
    {
      component: "Titanic.UI.InputFieldFrame",
      when: { attr: "visible" },
      props: {
        control: {
          diff: [
            {
              tag: "input",
              props: {
                "aria-errormessage": { attr: "errorId" },
                "aria-invalid": { attr: "hasValidationError" },
                className: { attr: "className" },
                disabled: { attr: "readOnly" },
                id: { attr: "resolvedId" },
                name: { attr: "resolvedName" },
                required: { attr: "required" },
                type: "number",
                value: { attr: "inputValue" },
                onChange: { method: "handleChange" }
              }
            }
          ]
        },
        errorId: { attr: "errorId" },
        htmlFor: { attr: "resolvedId" },
        required: { attr: "required" },
        title: { attr: "title" },
        validationError: { attr: "validationError" }
      }
    }
  ]
});
