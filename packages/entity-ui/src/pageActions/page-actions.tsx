import { defineComponentSchema } from "@titanic-entity/entity-base";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";// Базовый UI-компонент действия страницы 'EntityPageActions'.
import { useMemo } from "react";
import { useUiComponent } from "@titanic-entity/entity-base";
import { EntityPageActionButton } from "../pageActionButton/page-action-button";
import type { EntityPageActionButtonProps } from "../pageActionButton/page-action-button-props";
import type { EntityPageActionsProps } from "./page-actions-props";

export type {
  EntityPageActionConfig,
  EntityPageActionsProps
} from "./page-actions-props";

export function EntityPageActions({
  actions,
  align = "end",
  className = ""
}: EntityPageActionsProps) {
  const ActionButton = useUiComponent<EntityPageActionButtonProps>(
    "EntityPageActionButton",
    EntityPageActionButton
  );
  const visibleActions = useMemo(
    () => [...actions]
      .filter((action) => !action.hidden)
      .sort((left, right) => (left.order ?? 0) - (right.order ?? 0)),
    [actions]
  );
  const rootClassName = [
    "titanic-page-actions",
    `titanic-page-actions_${align}`,
    className
  ].filter(Boolean).join(" ");

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <div className={rootClassName}>
      {visibleActions.map((action) => (
        <ActionButton key={action.actionName} {...action} />
      ))}
    </div>
  );
}

export const pageActionsComponentSchema = defineComponentSchema<EntityPageActionsProps>({
  kind: "component",
  name: entityReactComponentNames.EntityPageActions,
  component: EntityPageActions
});