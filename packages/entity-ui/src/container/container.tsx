import { Titanic } from "@titanic-entity/entity-react";
import type { ContainerProps } from "./index";

export const Container = Titanic.define<ContainerProps>("Titanic.UI.Container", function Container({
  ariaLabel,
  ariaLabelledBy,
  ariaModal,
  children,
  className,
  containerRef,
  id,
  role,
  style,
  tabIndex,
  title,
  visible = true,
  onClick
}: ContainerProps) {
  if (!visible) {
    return null;
  }

  return (
    <div
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-modal={ariaModal}
      className={["titanic-container", className].filter(Boolean).join(" ")}
      id={id}
      ref={containerRef}
      role={role}
      style={style}
      tabIndex={tabIndex}
      title={title}
      onClick={onClick}
    >
      {children}
    </div>
  );
});
