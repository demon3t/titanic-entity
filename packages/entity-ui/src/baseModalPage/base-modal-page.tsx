import { Titanic } from "@titanic-entity/entity-react";
import type { ReactNode } from "react";
import { Button } from "../button";
import { Container } from "../container";
import { Label } from "../label";
import { ResourceSvgIcon } from "../resourceSvgIcon/resource-svg-icon";

export interface BaseModalPageClassNames {
  backdrop?: string;
  card?: string;
  closeButton?: string;
  closeIcon?: string;
  error?: string;
  footer?: string;
  header?: string;
  root?: string;
  title?: string;
  warning?: string;
}

export interface BaseModalPageProps {
  ariaLabel?: string;
  children?: ReactNode;
  classNames?: BaseModalPageClassNames;
  closeLabel?: string;
  error?: ReactNode;
  footer?: ReactNode;
  title?: ReactNode;
  toolbar?: ReactNode;
  validationWarning?: ReactNode;
  onClose?: () => void;
}

function joinClassNames(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

export const BaseModalPage = Titanic.define<BaseModalPageProps>("Titanic.UI.BaseModalPage", function BaseModalPage({
  ariaLabel,
  children,
  classNames,
  closeLabel,
  error,
  footer,
  title,
  toolbar,
  validationWarning,
  onClose
}: BaseModalPageProps) {
  const resolvedAriaLabel = ariaLabel ?? (typeof title === "string" ? title : undefined);

  return (
    <Container
      ariaLabel={resolvedAriaLabel}
      ariaModal="true"
      className={joinClassNames("titanic-base-modal-page", classNames?.root)}
      role="dialog"
    >
      <Container
        className={joinClassNames("titanic-base-modal-page__backdrop", classNames?.backdrop)}
        onClick={onClose}
      />
      <Container className={joinClassNames("titanic-base-modal-page__card", classNames?.card)}>
        <header className={joinClassNames("titanic-base-modal-page__header", classNames?.header)}>
          <Container className={joinClassNames("titanic-base-modal-page__title", classNames?.title)}>
            <Label as="strong" value={title} />
          </Container>
          {onClose ? (
            <Button unstyled
              aria-label={closeLabel}
              className={joinClassNames("titanic-base-modal-page__close", classNames?.closeButton)}
              title={closeLabel}
              type="button"
              onClick={onClose}
            >
              <ResourceSvgIcon
                className={joinClassNames("titanic-base-modal-page__close-icon", classNames?.closeIcon)}
                icon="close"
              />
            </Button>
          ) : null}
        </header>

        <Label
          as="p"
          className={joinClassNames("titanic-base-modal-page__error", classNames?.error)}
          value={error}
          visible={Boolean(error)}
        />
        {validationWarning ? (
          <Label
            as="p"
            className={joinClassNames("titanic-base-modal-page__warning", classNames?.warning)}
            role="alert"
            value={validationWarning}
          />
        ) : null}

        {toolbar}
        {children}

        {footer ? (
          <footer className={joinClassNames("titanic-base-modal-page__footer", classNames?.footer)}>
            {footer}
          </footer>
        ) : null}
      </Container>
    </Container>
  );
});
