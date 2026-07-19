Titanic.define("Titanic.UI.Button", {
  attributes: {
    ariaControls: {
      value(this: any): unknown {
        return this.props["aria-controls"];
      }
    },
    ariaExpanded: {
      value(this: any): unknown {
        return this.props["aria-expanded"];
      }
    },
    ariaHasPopup: {
      value(this: any): unknown {
        return this.props["aria-haspopup"];
      }
    },
    children: {},
    className: { default: "" },
    disabled: {},
    items: {},
    menuAriaLabel: {},
    menuClassName: {},
    menuItemClassName: {},
    menuSeparatorClassName: {},
    onClick: {},
    type: { default: "button" },
    unstyled: { default: false },
    variant: { default: "default" },
    open: { state: true, default: false },
    menuId: { id: true },
    rootRef: { ref: true, default: null },
    menuItems: {
      value(this: any): readonly any[] {
        return Array.isArray(this.attributes.items) ? this.attributes.items : [];
      }
    },
    hasMenu: {
      value(this: any): boolean {
        return this.attributes.menuItems.length > 0;
      }
    },
    buttonProps: {
      value(this: any): Record<string, unknown> {
        return this.methods.getButtonProps();
      }
    },
    outsideMenuEffect: {
      deps: { array: [{ attr: "open" }] },
      effect(this: any): void | (() => void) {
        if (!this.attributes.open) {
          return;
        }

        const handlePointerDown = (event: PointerEvent) => {
          const root = this.attributes.rootRef.current;

          if (!root || root.contains(event.target as Node)) {
            return;
          }

          this.attributes.setOpen(false);
        };

        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === "Escape") {
            this.attributes.setOpen(false);
          }
        };

        document.addEventListener("pointerdown", handlePointerDown, true);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
          document.removeEventListener("pointerdown", handlePointerDown, true);
          document.removeEventListener("keydown", handleKeyDown);
        };
      }
    }
  },
  methods: {
    getNativeButtonProps(this: any): Record<string, unknown> {
      const nativeProps = { ...this.props } as Record<string, unknown>;

      [
        "aria-controls",
        "aria-expanded",
        "aria-haspopup",
        "children",
        "className",
        "disabled",
        "items",
        "menuAriaLabel",
        "menuClassName",
        "menuItemClassName",
        "menuSeparatorClassName",
        "onClick",
        "type",
        "unstyled",
        "variant"
      ].forEach((propName) => {
        delete nativeProps[propName];
      });

      return nativeProps;
    },

    getButtonProps(this: any): Record<string, unknown> {
      return {
        ...this.methods.getNativeButtonProps(),
        "aria-controls": this.attributes.hasMenu ? this.attributes.menuId : this.attributes.ariaControls,
        "aria-expanded": this.attributes.hasMenu ? this.attributes.open : this.attributes.ariaExpanded,
        "aria-haspopup": this.attributes.hasMenu ? "menu" : this.attributes.ariaHasPopup,
        className: this.methods.joinClassNames(
          this.attributes.unstyled ? undefined : "titanic-button",
          this.attributes.unstyled ? undefined : `titanic-button_${this.attributes.variant}`,
          !this.attributes.unstyled && this.attributes.hasMenu ? "titanic-button_has-menu" : undefined,
          this.attributes.className
        ),
        disabled: this.attributes.disabled,
        onClick: this.methods.handleButtonClick,
        type: this.attributes.type
      };
    },

    handleButtonClick(this: any, event: any): void {
      this.attributes.onClick?.(event);

      if (event.defaultPrevented || this.attributes.disabled || !this.attributes.hasMenu) {
        return;
      }

      this.attributes.setOpen((current: boolean) => !current);
    },

    handleMenuItemClick(this: any, event: any, item: any): void {
      item?.onClick?.(event);

      if (!event.defaultPrevented) {
        this.attributes.setOpen(false);
      }
    },

    isButtonMenuSeparator(this: any, item: any): boolean {
      return item?.kind === "separator";
    },

    getMenuItemClassName(this: any, item: any): string {
      return this.methods.joinClassNames(
        "titanic-button-menu__item",
        item?.danger ? "titanic-button-menu__item_danger" : undefined,
        this.attributes.menuItemClassName,
        item?.className
      );
    },

    getMenuSeparatorClassName(this: any): string {
      return this.methods.joinClassNames(
        "titanic-button-menu__separator",
        this.attributes.menuSeparatorClassName
      );
    },

    joinClassNames(this: any, ...classNames: Array<string | false | null | undefined>): string {
      return classNames.filter(Boolean).join(" ");
    }
  },
  diff: [
    {
      tag: "button",
      unless: { attr: "hasMenu" },
      props: {
        $spread: { attr: "buttonProps" }
      },
      children: [
        { slot: "children" },
        {
          tag: "span",
          when: { and: [{ not: { attr: "unstyled" } }, { attr: "hasMenu" }] },
          props: {
            "aria-hidden": true,
            className: "titanic-button__menu-indicator"
          }
        }
      ]
    },
    {
      tag: "span",
      when: { attr: "hasMenu" },
      props: {
        className: "titanic-button-menu",
        ref: { attr: "rootRef" }
      },
      children: [
        {
          tag: "button",
          props: {
            $spread: { attr: "buttonProps" }
          },
          children: [
            { slot: "children" },
            {
              tag: "span",
              when: { and: [{ not: { attr: "unstyled" } }, { attr: "hasMenu" }] },
              props: {
                "aria-hidden": true,
                className: "titanic-button__menu-indicator"
              }
            }
          ]
        },
        {
          tag: "span",
          when: { attr: "open" },
          props: {
            "aria-label": { attr: "menuAriaLabel" },
            className: {
              call: "joinClassNames",
              args: ["titanic-button-menu__menu", { attr: "menuClassName" }]
            },
            id: { attr: "menuId" },
            role: "menu"
          },
          children: [
            {
              each: { attr: "menuItems" },
              as: "menuItem",
              diff: [
                {
                  tag: "span",
                  key: { local: "menuItem.key" },
                  when: {
                    call: "isButtonMenuSeparator",
                    args: [{ local: "menuItem" }]
                  },
                  props: {
                    className: { call: "getMenuSeparatorClassName" },
                    role: "separator"
                  }
                },
                {
                  tag: "button",
                  key: { local: "menuItem.key" },
                  unless: {
                    call: "isButtonMenuSeparator",
                    args: [{ local: "menuItem" }]
                  },
                  props: {
                    className: {
                      call: "getMenuItemClassName",
                      args: [{ local: "menuItem" }]
                    },
                    disabled: { local: "menuItem.disabled" },
                    onClick: {
                      method: "handleMenuItemClick",
                      args: [{ local: "menuItem" }]
                    },
                    role: "menuitem",
                    title: { local: "menuItem.title" },
                    type: "button"
                  },
                  children: [{ text: { local: "menuItem.label" } }]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
});
