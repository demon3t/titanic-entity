// Контракт свойств UI-компонента 'EntityRecordDetailsProps'.
import type { ReactNode } from "react";
import type { EntityApiEntity } from "@titanic/entity-api";

export interface EntityRecordDetailsField {
  key: string;
  label: string;
  render?: (row: EntityApiEntity) => ReactNode;
}

export interface EntityRecordDetailsProps {
  title: string;
  row: EntityApiEntity | null;
  fields: EntityRecordDetailsField[];
  emptyText?: string;
  className?: string;
  actions?: ReactNode;
}
