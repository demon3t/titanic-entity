import type { ReactNode } from "react";
import type { EntityDataGridLabels } from "../../data-grid/EntityDataGridSettings";
import { ResourceSvgIcon } from "../../../components/icons/ResourceSvgIcon";

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

export function ColumnSettingsDialogLayout({
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
    <div className="titanic-data-grid-column-modal" role="dialog" aria-modal="true" aria-label={labels.columnsTitle}>
      <div className="titanic-data-grid-column-modal__backdrop" onClick={onClose} />
      <section className="titanic-data-grid-column-modal__card">
        <header className="titanic-data-grid-column-modal__header">
          <div>
            <strong>{labels.columnsTitle}</strong>
          </div>
          <button
            aria-label={labels.closeColumns}
            className="titanic-data-grid-column-modal__close"
            title={labels.closeColumns}
            type="button"
            onClick={onClose}
          >
            <ResourceSvgIcon className="titanic-data-grid-column-modal__close-icon" icon="close" />
          </button>
        </header>

        {error ? <p className="titanic-data-grid-column-modal__error">{error}</p> : null}
        {validationWarning ? (
          <p className="titanic-data-grid-column-modal__warning" role="alert">
            {validationWarning}
          </p>
        ) : null}

        {toolbar}

        {children}

        <footer className="titanic-data-grid-column-modal__footer">
          <span className="titanic-data-grid-column-modal__footer-spacer" />
          <button
            className="titanic-data-grid-column-modal__button titanic-data-grid-column-modal__button_primary"
            disabled={saving}
            type="button"
            onClick={onSave}
          >
            {saving ? labels.savingColumns : labels.saveColumns}
          </button>
          <button className="titanic-data-grid-column-modal__button" type="button" onClick={onClose}>
            {labels.cancelColumns}
          </button>
          <button
            className="titanic-data-grid-column-modal__button"
            disabled={saving}
            type="button"
            onClick={onSaveDefault}
          >
            {saving ? labels.savingColumns : labels.saveDefaultColumns}
          </button>
        </footer>
      </section>
    </div>
  );
}
