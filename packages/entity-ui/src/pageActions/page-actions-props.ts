// Контракт свойств базового действия страницы 'EntityPageActionsProps'.
import type { EntityPageActionButtonProps } from "../pageActionButton/page-action-button-props";

export interface EntityPageActionConfig extends EntityPageActionButtonProps {
  order?: number;
}

export interface EntityPageActionsProps {
  actions: readonly EntityPageActionConfig[];
  align?: "start" | "end" | "between";
  className?: string;
}
