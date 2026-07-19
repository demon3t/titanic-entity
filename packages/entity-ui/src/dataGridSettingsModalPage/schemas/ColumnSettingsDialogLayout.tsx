import type { ReactNode } from "react";
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import type { EntityDataGridLabels } from "../../dataGrid/data-grid-settings";
import { BaseModalPage } from "../../baseModalPage";
import { Button } from "../../button";
import { EntityContainer } from "../../container";
import { columnSettingsDefinedComponentNames } from "./component-names";

export interface ColumnSettingsDialogLayoutProps {
  children: ReactNode;
  error: string | null;
  labels: EntityDataGridLabels;
  saving: boolean;
  toolbar?: ReactNode;
  validationWarning: string | null;
  onClose: () => void;
  onSave: () => void;
  onSaveDefault: () => void;
}

function ColumnSettingsDialogLayoutNative({
  children,
  error,
  labels,
  saving,
  toolbar,
  validationWarning,
  onClose,
  onSave,
  onSaveDefault
}: ColumnSettingsDialogLayoutProps) {
  return (
    <BaseModalPage
      ariaLabel={labels.columnsTitle}
      classNames={{
        backdrop: "titanic-data-grid-column-modal__backdrop",
        card: "titanic-data-grid-column-modal__card",
        closeButton: "titanic-data-grid-column-modal__close",
        closeIcon: "titanic-data-grid-column-modal__close-icon",
        error: "titanic-data-grid-column-modal__error",
        footer: "titanic-data-grid-column-modal__footer",
        header: "titanic-data-grid-column-modal__header",
        root: "titanic-data-grid-column-modal",
        warning: "titanic-data-grid-column-modal__warning"
      }}
      closeLabel={labels.closeColumns}
      error={error}
      footer={(
        <>
          <EntityContainer className="titanic-data-grid-column-modal__footer-spacer" />
          <Button unstyled
            className="titanic-data-grid-column-modal__button titanic-data-grid-column-modal__button_primary"
            disabled={saving}
            type="button"
            onClick={onSave}
          >
            {saving ? labels.savingColumns : labels.saveColumns}
          </Button>
          <Button unstyled className="titanic-data-grid-column-modal__button" type="button" onClick={onClose}>
            {labels.cancelColumns}
          </Button>
          <Button unstyled
            className="titanic-data-grid-column-modal__button"
            disabled={saving}
            type="button"
            onClick={onSaveDefault}
          >
            {saving ? labels.savingColumns : labels.saveDefaultColumns}
          </Button>
        </>
      )}
      title={labels.columnsTitle}
      toolbar={toolbar}
      validationWarning={validationWarning}
      onClose={onClose}
    >
      {children}
    </BaseModalPage>
  );
}

Titanic.define<ColumnSettingsDialogLayoutProps>(
  columnSettingsDefinedComponentNames.ColumnSettingsDialogLayout,
  ColumnSettingsDialogLayoutNative
);

export const ColumnSettingsDialogLayout = Titanic.getReactModule<
  DefinedEntityReactComponent<ColumnSettingsDialogLayoutProps>
>(columnSettingsDefinedComponentNames.ColumnSettingsDialogLayout)!;
