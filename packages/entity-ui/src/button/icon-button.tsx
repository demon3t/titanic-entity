Titanic.define("Titanic.UI.IconButton", {
  attributes: {
    buttonClassName: {},
    icon: {},
    iconClassName: {},
    label: {},
    tooltipClassName: {},
    type: { default: "button" },
    onClick: {}
  },
  methods: {},
  diff: [
    {
      component: "Titanic.UI.Button",
      props: {
        "aria-label": { attr: "label" },
        className: { attr: "buttonClassName" },
        onClick: { attr: "onClick" },
        type: { attr: "type" },
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
          when: { attr: "tooltipClassName" },
          props: {
            className: { attr: "tooltipClassName" },
            role: "tooltip"
          },
          text: { attr: "label" }
        }
      ]
    }
  ]
});
