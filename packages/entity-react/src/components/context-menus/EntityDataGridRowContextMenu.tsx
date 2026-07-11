import { ResourceSvgIcon } from "../icons/ResourceSvgIcon";
import type {
  EntityDataGridRowAction,
  EntityDataGridRowActionContext
} from "../../grids";
import type { ResourceSvgIconResource } from "@titanic-entity/entity-resources";

export interface EntityDataGridRowContextMenuProps<TRow = unknown> {
  actions: readonly EntityDataGridRowAction<TRow>[];
  ariaLabel: string;
  context: EntityDataGridRowActionContext<TRow>;
  left: number;
  loadingActionKey: string | null;
  top: number;
  onActionClick: (action: EntityDataGridRowAction<TRow>) => void;
}

export function EntityDataGridRowContextMenu<TRow = unknown>({
  actions,
  ariaLabel,
  context,
  left,
  loadingActionKey,
  top,
  onActionClick
}: EntityDataGridRowContextMenuProps<TRow>) {
  return (
    <div
      className="titanic-data-grid__row-menu"
      role="menu"
      aria-label={ariaLabel}
      style={{
        left: `${left}px`,
        top: `${top}px`
      }}
    >
      {actions.map((action) => {
        const disabled = resolveRowActionDisabled(action, context);
        const actionClassName = [
          "titanic-data-grid__row-menu-action",
          action.danger ? "titanic-data-grid__row-menu-action_danger" : ""
        ].filter(Boolean).join(" ");

        return (
          <button
            aria-label={action.label}
            className={actionClassName}
            disabled={disabled || loadingActionKey === action.key}
            key={action.key}
            role="menuitem"
            title={action.label}
            type="button"
            onClick={() => onActionClick(action)}
          >
            <RowActionIcon icon={action.icon} label={action.label} />
          </button>
        );
      })}
    </div>
  );
}

function resolveRowActionDisabled<TRow>(
  action: EntityDataGridRowAction<TRow>,
  context: EntityDataGridRowActionContext<TRow>
): boolean {
  return typeof action.disabled === "function"
    ? action.disabled(context)
    : Boolean(action.disabled);
}

function RowActionIcon({ icon, label }: { icon?: ResourceSvgIconResource; label: string }) {
  if (!icon) {
    return <span aria-hidden="true" className="titanic-data-grid__row-menu-icon-placeholder">{getRowActionFallback(label)}</span>;
  }

  return <ResourceSvgIcon className="titanic-data-grid__row-menu-icon" icon={icon} />;
}

function getRowActionFallback(label: string): string {
  return label.trim().charAt(0).toUpperCase();
}
