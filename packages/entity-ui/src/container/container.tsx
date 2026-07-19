Titanic.define("Titanic.UI.EntityContainer", {
  attributes: {
    ariaLabel: {},
    ariaLabelledBy: {},
    ariaModal: {},
    children: {},
    className: {},
    containerRef: {},
    id: {},
    role: {},
    style: {},
    tabIndex: {},
    title: {},
    visible: { default: true },
    onClick: {}
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
        "aria-modal": { attr: "ariaModal" },
        className: {
          call: "joinClassNames",
          args: ["titanic-container", { attr: "className" }]
        },
        id: { attr: "id" },
        ref: { attr: "containerRef" },
        role: { attr: "role" },
        style: { attr: "style" },
        tabIndex: { attr: "tabIndex" },
        title: { attr: "title" },
        onClick: { attr: "onClick" }
      },
      children: [{ slot: "children" }]
    }
  ]
});
