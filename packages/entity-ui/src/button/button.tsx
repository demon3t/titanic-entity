import { Titanic } from "@titanic-entity/entity-react";
import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { useButtonMethodRunner } from "./button-method-context";
import type { ButtonMenuAction, ButtonMenuItem, ButtonProps } from "./index";

export const Button = Titanic.define<ButtonProps>("Titanic.UI.Button", function Button(props: ButtonProps) {
  const {
    children,
    className = "",
    disabled,
    items,
    method,
    methodArgs,
    menuAriaLabel,
    menuClassName,
    menuItemClassName,
    menuSeparatorClassName,
    onClick,
    type = "button",
    unstyled = false,
    variant = "default",
    ...nativeProps
  } = props;
  const [open, setOpen] = useState(false);
  const runMethod = useButtonMethodRunner();
  const menuId = useId();
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const menuItems = Array.isArray(items) ? items : [];
  const hasMenu = menuItems.length > 0;

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);

    if (!event.defaultPrevented && !disabled && method) {
      if (!runMethod) {
        throw new Error(`Button method "${method}" requires a ButtonMethodProvider.`);
      }

      void runMethod(method, ...(methodArgs ?? []));
    }

    if (!event.defaultPrevented && !disabled && hasMenu) {
      setOpen((current) => !current);
    }
  };
  const buttonProps = {
    ...nativeProps,
    "aria-controls": hasMenu ? menuId : props["aria-controls"],
    "aria-expanded": hasMenu ? open : props["aria-expanded"],
    "aria-haspopup": hasMenu ? "menu" as const : props["aria-haspopup"],
    className: [
      unstyled ? undefined : "titanic-button",
      unstyled ? undefined : `titanic-button_${variant}`,
      !unstyled && hasMenu ? "titanic-button_has-menu" : undefined,
      className
    ].filter(Boolean).join(" "),
    disabled,
    type,
    onClick: handleButtonClick
  };
  const content = (
    <>
      {children}
      {!unstyled && hasMenu ? <span aria-hidden="true" className="titanic-button__menu-indicator" /> : null}
    </>
  );

  if (!hasMenu) {
    return <button {...buttonProps}>{content}</button>;
  }

  return (
    <span className="titanic-button-menu" ref={rootRef}>
      <button {...buttonProps}>{content}</button>
      {open ? (
        <span
          aria-label={menuAriaLabel}
          className={["titanic-button-menu__menu", menuClassName].filter(Boolean).join(" ")}
          id={menuId}
          role="menu"
        >
          {menuItems.map((item) => renderMenuItem(
            item,
            menuItemClassName,
            menuSeparatorClassName,
            setOpen
          ))}
        </span>
      ) : null}
    </span>
  );
});

function renderMenuItem(
  item: ButtonMenuItem,
  menuItemClassName: string | undefined,
  menuSeparatorClassName: string | undefined,
  setOpen: (open: boolean) => void
) {
  if (item.kind === "separator") {
    return (
      <span
        className={["titanic-button-menu__separator", menuSeparatorClassName].filter(Boolean).join(" ")}
        key={item.key}
        role="separator"
      />
    );
  }

  const action = item as ButtonMenuAction;

  return (
    <button
      className={[
        "titanic-button-menu__item",
        action.danger ? "titanic-button-menu__item_danger" : undefined,
        menuItemClassName,
        action.className
      ].filter(Boolean).join(" ")}
      disabled={action.disabled}
      key={action.key}
      role="menuitem"
      title={action.title}
      type="button"
      onClick={(event) => {
        action.onClick?.(event);
        if (!event.defaultPrevented) {
          setOpen(false);
        }
      }}
    >
      {action.label}
    </button>
  );
}
