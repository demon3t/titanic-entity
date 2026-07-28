Titanic.define("Titanic.UI.PanelToggleButton", {
  attributes: {
    className: { default: "" },
    direction: {},
    expanded: {},
    icon: {},
    iconClassName: { default: "" },
    label: {},
    onClick: {}
  },
  methods: {},
  diff: [
    {
      component: "Titanic.UI.Button",
      props: {
        "aria-expanded": { attr: "expanded" },
        "aria-label": { attr: "label" },
        className: { attr: "className" },
        onClick: { attr: "onClick" },
        title: { attr: "label" },
        type: "button",
        unstyled: true
      },
      children: [
        {
          component: "Titanic.UI.ResourceSvgIcon",
          props: {
            className: { attr: "iconClassName" },
            icon: { attr: "icon" }
          }
        },
        {
          tag: "span",
          props: {
            "data-direction": { attr: "direction" },
            className: "titanic-site-toggle__direction",
            hidden: true
          }
        }
      ]
    }
  ]
});
