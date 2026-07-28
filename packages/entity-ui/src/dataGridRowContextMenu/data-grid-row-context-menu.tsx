import { defineComponentSchema } from "@titanic-entity/entity-base";
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";
import type { ReactNode } from "react";
import { ResourceSvgIcon } from "../resourceSvgIcon/resource-svg-icon";
import { Button } from "../button";
import type {
  EntityDataGridRowAction,
  EntityDataGridRowActionContext
} from "../dataGrid";

export interface EntityDataGridRowContextMenuProps<TRow = unknown> {
  actions: readonly EntityDataGridRowAction<TRow>[];
  ariaLabel: string;
  context: EntityDataGridRowActionContext<TRow>;
  left: number;
  loadingActionKey: string | null;
  top: number;
  onActionClick: (action: EntityDataGridRowAction<TRow>) => void;
}

type EntityDataGridRowContextMenuComponent =
  <TRow = unknown>(props: EntityDataGridRowContextMenuProps<TRow>) => ReactNode;

export const EntityDataGridRowContextMenu = Titanic.define<EntityDataGridRowContextMenuProps<any>>("Titanic.UI.EntityDataGridRowContextMenu", function EntityDataGridRowContextMenu<TRow = unknown>({
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
          <Button unstyled
            aria-label={action.label}
            className={actionClassName}
            disabled={disabled || loadingActionKey === action.key}
            key={action.key}
            role="menuitem"
            title={action.label}
            type="button"
            onClick={() => onActionClick(action)}
          >
            <ResourceSvgIcon className="titanic-data-grid__row-menu-icon" icon={action.icon} />
          </Button>
        );
      })}
    </div>
  );
}) as DefinedEntityReactComponent<EntityDataGridRowContextMenuProps<any>> &
  EntityDataGridRowContextMenuComponent;

function resolveRowActionDisabled<TRow>(
  action: EntityDataGridRowAction<TRow>,
  context: EntityDataGridRowActionContext<TRow>
): boolean {
  return typeof action.disabled === "function"
    ? action.disabled(context)
    : Boolean(action.disabled);
}

export const dataGridRowContextMenuComponentSchema = defineComponentSchema<EntityDataGridRowContextMenuProps<any>>({
  kind: "component",
  name: entityReactComponentNames.EntityDataGridRowContextMenu,
  component: EntityDataGridRowContextMenu
});
