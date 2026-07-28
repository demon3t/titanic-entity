import { Titanic } from "@titanic-entity/entity-react";
import { Container } from "../container";
import type { ActionBarProps } from "./index";

export const ActionBar = Titanic.define<ActionBarProps>("Titanic.UI.ActionBar", function ActionBar({
  align = "end",
  ariaLabel,
  children,
  className,
  contentClassName,
  sticky = true,
  style,
  variant = "default",
  visible = true
}: ActionBarProps) {
  if (!visible) {
    return null;
  }

  return (
    <Container
      ariaLabel={ariaLabel}
      className={joinClassNames(
        "titanic-action-bar",
        sticky && "titanic-action-bar_sticky",
        `titanic-action-bar_align_${align}`,
        `titanic-action-bar_${variant}`,
        className
      )}
      role="toolbar"
      style={style}
    >
      <Container className={joinClassNames("titanic-action-bar__content", contentClassName)}>
        <Container className="titanic-action-bar__column titanic-action-bar__column_left">
          {align === "start" ? children : null}
        </Container>
        <Container className="titanic-action-bar__column titanic-action-bar__column_center">
          {align === "center" ? children : null}
        </Container>
        <Container className="titanic-action-bar__column titanic-action-bar__column_right">
          {align === "end" ? children : null}
        </Container>
      </Container>
    </Container>
  );
});

function joinClassNames(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}
