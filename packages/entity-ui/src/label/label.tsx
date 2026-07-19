Titanic.define("Titanic.UI.EntityLabel", {
  attributes: {
    as: { default: "div" },
    children: {},
    className: {},
    column: {},
    htmlFor: {},
    id: {},
    role: {},
    style: {},
    title: {},
    value: {},
    values: {},
    visible: { default: true },
    onClick: {}
  },
  methods: {
    getColumnKey(this: any, column: any): string {
      if (!column || typeof column !== "object") {
        return "";
      }

      return column.alias || column.path || "";
    },

    getColumnLabel(this: any, column: any): string {
      return column && typeof column === "object"
        ? column.label || this.methods.getColumnKey(column)
        : "";
    },

    getComponentProps(this: any): Record<string, unknown> {
      const componentProps: Record<string, unknown> = {
        className: this.methods.joinClassNames(
          "titanic-label",
          this.attributes.onClick ? "titanic-label_clickable" : undefined,
          this.attributes.className
        ),
        id: this.attributes.id,
        role: this.attributes.role,
        style: this.attributes.style,
        title: this.attributes.title,
        onClick: this.attributes.onClick
      };

      if (this.attributes.as === "label") {
        componentProps.htmlFor = this.attributes.htmlFor;
      }

      return componentProps;
    },

    resolveLabelContent(this: any): unknown {
      const value = this.attributes.value;
      const values = this.attributes.values;
      const column = this.attributes.column;
      const children = this.attributes.children;

      if (value !== undefined && value !== null) {
        return value;
      }

      if (column && values && typeof values === "object") {
        const key = this.methods.getColumnKey(column);

        if (Object.prototype.hasOwnProperty.call(values, key)) {
          return this.methods.toReactNode(values[key]);
        }
      }

      if (children !== undefined && children !== null) {
        return children;
      }

      if (column) {
        return this.methods.getColumnLabel(column);
      }

      return null;
    },

    toReactNode(this: any, value: unknown): unknown {
      if (value === null || value === undefined) {
        return null;
      }

      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean" ||
        (typeof value === "object" && value !== null && "$$typeof" in value)
      ) {
        return value;
      }

      if (Array.isArray(value)) {
        return value.map((item) => this.methods.toReactNode(item));
      }

      return String(value);
    },

    joinClassNames(this: any, ...classNames: Array<string | false | null | undefined>): string {
      return classNames.filter(Boolean).join(" ");
    }
  },
  diff: [
    {
      tag: { attr: "as" },
      when: { attr: "visible" },
      props: {
        $spread: { call: "getComponentProps" }
      },
      children: [
        {
          call: "resolveLabelContent"
        }
      ]
    }
  ]
});
