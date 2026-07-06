// Контракт свойств базового действия страницы 'EntityPageActionsProps'.
import type { EntityPageActionButtonProps } from "./EntityPageActionButtonProps";

export interface EntityPageActionConfig extends EntityPageActionButtonProps {
  order?: number;
}

export interface EntityPageActionsProps {
  actions: readonly EntityPageActionConfig[];
  align?: "start" | "end" | "between";
  className?: string;
}
