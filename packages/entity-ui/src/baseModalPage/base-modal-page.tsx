import { Titanic } from "@titanic-entity/entity-react";
import { Button } from "../button";
import { EntityContainer } from "../container";
import { EntityLabel } from "../label";
import { ResourceSvgIcon } from "../resourceSvgIcon/resource-svg-icon";
import type { BaseModalPageProps } from "./base-modal-page-props";

function joinClassNames(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

export function BaseModalPage({
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
    <EntityContainer
      ariaLabel={resolvedAriaLabel}
      ariaModal="true"
      className={joinClassNames("titanic-base-modal-page", classNames?.root)}
      role="dialog"
    >
      <EntityContainer
        className={joinClassNames("titanic-base-modal-page__backdrop", classNames?.backdrop)}
        onClick={onClose}
      />
      <EntityContainer className={joinClassNames("titanic-base-modal-page__card", classNames?.card)}>
        <header className={joinClassNames("titanic-base-modal-page__header", classNames?.header)}>
          <EntityContainer className={joinClassNames("titanic-base-modal-page__title", classNames?.title)}>
            <EntityLabel as="strong" value={title} />
          </EntityContainer>
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

        <EntityLabel
          as="p"
          className={joinClassNames("titanic-base-modal-page__error", classNames?.error)}
          value={error}
          visible={Boolean(error)}
        />
        {validationWarning ? (
          <EntityLabel
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
      </EntityContainer>
    </EntityContainer>
  );
}

Titanic.define<BaseModalPageProps>("Titanic.UI.BaseModalPage", BaseModalPage);
