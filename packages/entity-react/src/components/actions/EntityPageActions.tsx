// Базовый UI-компонент действия страницы 'EntityPageActions'.
import { useMemo } from "react";
import { useUiComponent } from "@titanic-entity/entity-base";
import { EntityPageActionButton } from "./EntityPageActionButton";
import type { EntityPageActionButtonProps } from "./models/EntityPageActionButtonProps";
import type { EntityPageActionsProps } from "./models/EntityPageActionsProps";

export type {
  EntityPageActionConfig,
  EntityPageActionsProps
} from "./models/EntityPageActionsProps";

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
