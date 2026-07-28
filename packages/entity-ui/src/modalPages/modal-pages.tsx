import { Titanic } from "@titanic-entity/entity-react";
import { useEffect, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { BaseModalPage } from "../baseModalPage";
import { Button } from "../button";
import { Container } from "../container";
import { getModalPageLabels, type ModalPageLabels } from "./modal-pages-lcz";

export type ModalPageTone = "default" | "danger" | "warning";

export interface ModalPageOptions {
  closeLabel?: string;
  dismissible?: boolean;
  labels?: ModalPageLabels;
  locale?: string;
  message: ReactNode;
  title?: ReactNode;
}

export interface ApprovalModalPageOptions extends ModalPageOptions {
  approveDisabled?: boolean;
  approveLabel?: ReactNode;
  cancelLabel?: ReactNode;
  tone?: ModalPageTone;
}

export interface AlertModalPageOptions extends ModalPageOptions {
  okLabel?: ReactNode;
  tone?: ModalPageTone;
}

export interface ApprovalModalPageProps extends ApprovalModalPageOptions {
  onApprove: () => void;
  onCancel: () => void;
}

export interface AlertModalPageProps extends AlertModalPageOptions {
  onClose: () => void;
}

export interface ModalPagesApi {
  showAlert(options: AlertModalPageOptions): Promise<void>;
  showApproval(options: ApprovalModalPageOptions): Promise<boolean>;
  showApproved(options: ApprovalModalPageOptions): Promise<boolean>;
}

export const ApprovalModalPage = Titanic.define<ApprovalModalPageProps>(
  "Titanic.UI.ApprovalModalPage",
  function ApprovalModalPage({
    approveDisabled = false,
    approveLabel,
    cancelLabel,
    closeLabel,
    dismissible = true,
    labels,
    locale,
    message,
    title,
    tone = "default",
    onApprove,
    onCancel
  }: ApprovalModalPageProps) {
    const resolvedLabels = { ...getModalPageLabels(locale), ...(labels ?? {}) };

    useDismissibleModal(dismissible, onCancel);

    return (
      <BaseModalPage
        closeLabel={closeLabel ?? resolvedLabels.close}
        classNames={{
          card: "titanic-modal-page__card",
          footer: "titanic-modal-page__footer",
          root: `titanic-modal-page titanic-modal-page_${tone}`
        }}
        footer={(
          <>
            <Button autoFocus type="button" variant="secondary" onClick={onCancel}>
              {cancelLabel ?? resolvedLabels.cancel}
            </Button>
            <Button
              disabled={approveDisabled}
              type="button"
              variant={tone === "danger" ? "danger" : "primary"}
              onClick={onApprove}
            >
              {approveLabel ?? resolvedLabels.approve}
            </Button>
          </>
        )}
        title={title ?? resolvedLabels.approvalTitle}
        onClose={dismissible ? onCancel : undefined}
      >
        <Container className="titanic-modal-page__message">{message}</Container>
      </BaseModalPage>
    );
  }
);

export const AlertModalPage = Titanic.define<AlertModalPageProps>(
  "Titanic.UI.AlertModalPage",
  function AlertModalPage({
    closeLabel,
    dismissible = true,
    labels,
    locale,
    message,
    okLabel,
    title,
    tone = "default",
    onClose
  }: AlertModalPageProps) {
    const resolvedLabels = { ...getModalPageLabels(locale), ...(labels ?? {}) };

    useDismissibleModal(dismissible, onClose);

    return (
      <BaseModalPage
        closeLabel={closeLabel ?? resolvedLabels.close}
        classNames={{
          card: "titanic-modal-page__card",
          footer: "titanic-modal-page__footer",
          root: `titanic-modal-page titanic-modal-page_${tone}`
        }}
        footer={(
          <Button autoFocus type="button" variant="primary" onClick={onClose}>
            {okLabel ?? resolvedLabels.ok}
          </Button>
        )}
        title={title ?? resolvedLabels.alertTitle}
        onClose={dismissible ? onClose : undefined}
      >
        <Container className="titanic-modal-page__message">{message}</Container>
      </BaseModalPage>
    );
  }
);

export const ModalPages: ModalPagesApi = {
  showAlert(options) {
    return mountModalPage<void>((complete) => (
      <AlertModalPage {...options} onClose={() => complete(undefined)} />
    ), undefined);
  },
  showApproval(options) {
    return mountModalPage<boolean>((complete) => (
      <ApprovalModalPage
        {...options}
        onApprove={() => complete(true)}
        onCancel={() => complete(false)}
      />
    ), false);
  },
  showApproved(options) {
    return ModalPages.showApproval(options);
  }
};

Object.assign(Titanic.UI, { ModalPages });

function useDismissibleModal(dismissible: boolean, onDismiss: () => void): void {
  useEffect(() => {
    if (!dismissible || typeof document === "undefined") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onDismiss();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dismissible, onDismiss]);
}

let openModalPageCount = 0;
let bodyOverflowBeforeModalPages = "";

function mountModalPage<TResult>(
  render: (complete: (result: TResult) => void) => ReactNode,
  serverResult: TResult
): Promise<TResult> {
  if (typeof document === "undefined" || !document.body) {
    return Promise.resolve(serverResult);
  }

  return new Promise<TResult>((resolve) => {
    const host = document.createElement("div");
    const previouslyFocusedElement = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    let root: Root | null = createRoot(host);
    let settled = false;

    host.className = "titanic-modal-pages-host";
    document.body.append(host);
    lockBodyScroll();

    const complete = (result: TResult) => {
      if (settled) {
        return;
      }

      settled = true;
      queueMicrotask(() => {
        root?.unmount();
        root = null;
        host.remove();
        unlockBodyScroll();
        previouslyFocusedElement?.focus();
        resolve(result);
      });
    };

    root.render(render(complete));
  });
}

function lockBodyScroll(): void {
  if (openModalPageCount === 0) {
    bodyOverflowBeforeModalPages = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }

  openModalPageCount += 1;
}

function unlockBodyScroll(): void {
  openModalPageCount = Math.max(0, openModalPageCount - 1);

  if (openModalPageCount === 0) {
    document.body.style.overflow = bodyOverflowBeforeModalPages;
  }
}

declare module "@titanic-entity/entity-react/templates" {
  interface TitanicUiNamespace {
    ModalPages: ModalPagesApi;
  }
}
