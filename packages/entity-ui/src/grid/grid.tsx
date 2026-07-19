Titanic.define("Titanic.UI.EntityGrid", {
  attributes: {
    ariaLabel: {},
    ariaLabelledBy: {},
    children: {},
    className: {},
    columns: { default: 24 },
    gap: { default: 12 },
    id: {},
    role: {},
    style: {},
    tabIndex: {},
    title: {},
    visible: { default: true },
    onClick: {},
    gridStyle: {
      value(this: any): Record<string, unknown> {
        return {
          "--titanic-grid-columns": this.attributes.columns,
          "--titanic-grid-gap": `${this.attributes.gap}px`,
          ...(this.attributes.style && typeof this.attributes.style === "object" ? this.attributes.style : {})
        };
      }
    }
  },
  methods: {
    joinClassNames(this: any, ...classNames: Array<string | false | null | undefined>): string {
      return classNames.filter(Boolean).join(" ");
    }
  },
  diff: [
    {
      tag: "div",
      when: { attr: "visible" },
      props: {
        "aria-label": { attr: "ariaLabel" },
        "aria-labelledby": { attr: "ariaLabelledBy" },
        className: {
          call: "joinClassNames",
          args: ["titanic-grid", { attr: "className" }]
        },
        id: { attr: "id" },
        role: { attr: "role" },
        style: { attr: "gridStyle" },
        tabIndex: { attr: "tabIndex" },
        title: { attr: "title" },
        onClick: { attr: "onClick" }
      },
      children: [{ slot: "children" }]
    }
  ]
});
