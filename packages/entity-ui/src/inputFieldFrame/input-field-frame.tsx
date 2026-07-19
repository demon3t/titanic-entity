Titanic.define("Titanic.UI.InputFieldFrame", {
  attributes: {
    children: {
      value(this: any) {
        return this.props.children;
      }
    },
    className: { default: "" },
    control: {
      value(this: any) {
        return this.props.control ?? this.props.children;
      }
    },
    errorId: {
      value(this: any) {
        return this.props.errorId ?? (this.attributes.validationError && this.attributes.htmlFor ? `${this.attributes.htmlFor}-error` : undefined);
      }
    },
    htmlFor: {
      value(this: any) {
        return this.props.htmlFor ?? this.props.id;
      }
    },
    required: { default: false },
    title: {},
    validationError: {
      value(this: any) {
        return this.props.validationError ?? this.props.error;
      }
    },
    visible: { default: true },
    hasFrame: {
      value(this: any): boolean {
        return Boolean(this.attributes.title || this.attributes.validationError);
      }
    }
  },
  methods: {
    joinClassNames(...classNames: Array<string | false | null | undefined>): string {
      return classNames.filter(Boolean).join(" ");
    }
  },
  diff: [
    {
      when: { and: [{ attr: "visible" }, { not: { attr: "hasFrame" } }] },
      text: { attr: "control" }
    },
    {
      tag: "div",
      when: { and: [{ attr: "visible" }, { attr: "hasFrame" }] },
      props: {
        className: { call: "joinClassNames", args: ["titanic-input-field", { attr: "className" }] }
      },
      children: [
        {
          tag: "label",
          when: { attr: "title" },
          props: {
            className: "titanic-input-field__label",
            htmlFor: { attr: "htmlFor" }
          },
          children: [
            { text: { attr: "title" } },
            {
              tag: "span",
              when: { attr: "required" },
              props: {
                className: "titanic-input-field__required"
              },
              text: "*"
            }
          ]
        },
        {
          text: { attr: "control" }
        },
        {
          tag: "div",
          when: { attr: "validationError" },
          props: {
            className: "titanic-input-field__error",
            id: { attr: "errorId" }
          },
          text: { attr: "validationError" }
        }
      ]
    }
  ]
});
