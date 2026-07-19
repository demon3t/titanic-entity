Titanic.define("Titanic.UI.IconDropdownButton", {
  attributes: {
    chevron: {},
    chevronClassName: {},
    className: { default: "" },
    disabled: { default: false },
    errorClassName: { default: "titanic-icon-dropdown__error" },
    errorText: {},
    iconClassName: { default: "titanic-icon-dropdown__icon" },
    label: {},
    labelClassName: {},
    menuClassName: { default: "titanic-icon-dropdown__menu" },
    optionActiveClassName: { default: "titanic-icon-dropdown__option_active" },
    optionClassName: { default: "titanic-icon-dropdown__option" },
    options: { default: [] },
    selectedLabelClassName: {},
    tooltipClassName: {},
    triggerClassName: { default: "titanic-icon-dropdown__trigger" },
    value: {},
    onChange: {},
    open: { state: true, default: false },
    rootRef: { ref: true, default: null },
    selectedOption: {
      value(this: any): any {
        const options = Array.isArray(this.attributes.options) ? this.attributes.options : [];

        return options.find((option: any) => option.value === this.attributes.value) ?? options[0];
      }
    },
    rootClassName: {
      value(this: any): string {
        return this.methods.joinClassNames("titanic-icon-dropdown", this.attributes.className);
      }
    },
    triggerLabelClassName: {
      value(this: any): string | undefined {
        return this.attributes.selectedLabelClassName ??
          (!this.attributes.selectedOption?.icon ? "titanic-icon-dropdown__value" : undefined);
      }
    },
    triggerLabel: {
      value(this: any): unknown {
        if (this.attributes.selectedLabelClassName) {
          return this.attributes.selectedOption?.label;
        }

        return this.attributes.selectedOption?.icon ? undefined : this.attributes.label;
      }
    },
    outsideMenuEffect: {
      deps: { array: [{ attr: "open" }] },
      effect(this: any): void | (() => void) {
        if (!this.attributes.open) {
          return;
        }

        const closeOnOutsidePointer = (event: PointerEvent) => {
          if (!this.attributes.rootRef.current?.contains(event.target as Node)) {
            this.attributes.setOpen(false);
          }
        };

        const closeOnEscape = (event: KeyboardEvent) => {
          if (event.key === "Escape") {
            this.attributes.setOpen(false);
          }
        };

        document.addEventListener("pointerdown", closeOnOutsidePointer, true);
        document.addEventListener("keydown", closeOnEscape);

        return () => {
          document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
          document.removeEventListener("keydown", closeOnEscape);
        };
      }
    }
  },
  methods: {
    joinClassNames(this: any, ...classNames: Array<string | false | null | undefined>): string {
      return classNames.filter(Boolean).join(" ");
    },

    toggleOpen(this: any): void {
      if (this.attributes.disabled) {
        return;
      }

      this.attributes.setOpen((currentValue: boolean) => !currentValue);
    },

    selectOption(this: any, _event: any, option: any): void {
      this.attributes.onChange?.(option.value);
      this.attributes.setOpen(false);
    },

    isActiveOption(this: any, option: any): boolean {
      return option?.value === this.attributes.value;
    },

    getOptionClassName(this: any, option: any): string {
      return this.methods.isActiveOption(option)
        ? `${this.attributes.optionClassName} ${this.attributes.optionActiveClassName}`
        : this.attributes.optionClassName;
    },

    getTriggerTitle(this: any): unknown {
      return this.attributes.triggerLabel ?? this.attributes.selectedOption?.label ?? this.attributes.label;
    },

    getTooltipText(this: any): unknown {
      return this.attributes.triggerLabel ?? this.attributes.selectedOption?.label;
    },

    getChevron(this: any): unknown {
      return this.attributes.chevron ?? "v";
    }
  },
  diff: [
    {
      tag: "div",
      props: {
        className: { attr: "rootClassName" },
        ref: { attr: "rootRef" }
      },
      children: [
        {
          tag: "span",
          when: { attr: "labelClassName" },
          props: {
            className: { attr: "labelClassName" }
          },
          text: { attr: "label" }
        },
        {
          component: "Titanic.UI.Button",
          props: {
            "aria-expanded": { attr: "open" },
            "aria-haspopup": "listbox",
            "aria-label": { attr: "label" },
            className: { attr: "triggerClassName" },
            disabled: { attr: "disabled" },
            onClick: { method: "toggleOpen" },
            title: { call: "getTriggerTitle" },
            type: "button",
            unstyled: true
          },
          children: [
            {
              component: "Titanic.UI.ResourceSvgIcon",
              props: {
                className: { attr: "iconClassName" },
                icon: { attr: "selectedOption.icon" }
              }
            },
            {
              tag: "span",
              when: { and: [{ attr: "triggerLabelClassName" }, { attr: "triggerLabel" }] },
              props: {
                className: { attr: "triggerLabelClassName" }
              },
              text: { attr: "triggerLabel" }
            },
            {
              tag: "span",
              when: { attr: "chevronClassName" },
              props: {
                "aria-hidden": true,
                className: { attr: "chevronClassName" }
              },
              text: { call: "getChevron" }
            },
            {
              tag: "span",
              when: { and: [{ attr: "tooltipClassName" }, { attr: "selectedOption" }] },
              props: {
                className: { attr: "tooltipClassName" },
                role: "tooltip"
              },
              text: { call: "getTooltipText" }
            }
          ]
        },
        {
          tag: "div",
          when: { attr: "open" },
          props: {
            "aria-label": { attr: "label" },
            className: { attr: "menuClassName" },
            role: "listbox"
          },
          children: [
            {
              each: { attr: "options" },
              as: "option",
              diff: [
                {
                  component: "Titanic.UI.Button",
                  key: { local: "option.value" },
                  props: {
                    "aria-selected": {
                      call: "isActiveOption",
                      args: [{ local: "option" }]
                    },
                    className: {
                      call: "getOptionClassName",
                      args: [{ local: "option" }]
                    },
                    onClick: {
                      method: "selectOption",
                      args: [{ local: "option" }]
                    },
                    role: "option",
                    type: "button",
                    unstyled: true
                  },
                  children: [
                    {
                      component: "Titanic.UI.ResourceSvgIcon",
                      props: {
                        className: { attr: "iconClassName" },
                        icon: { local: "option.icon" }
                      }
                    },
                    {
                      tag: "span",
                      text: { local: "option.label" }
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          tag: "small",
          when: { attr: "errorText" },
          props: {
            className: { attr: "errorClassName" }
          },
          text: { attr: "errorText" }
        }
      ]
    }
  ]
});
