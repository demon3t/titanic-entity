import { defineComponentSchema } from "@titanic-entity/entity-base";
import type { EntityApiManagerStructureResponse } from "@titanic-entity/entity-api";
import type {
  ConditionOperator,
  EntityColumnDefinition,
  EntityQueryFilter,
  EntityQueryFilterCollection,
  EntitySchema
} from "@titanic-entity/entity-core";
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";
import "./entity-query-filter-builder";
import type {
  EntityQueryFilterBuilderLabels,
  EntityQueryFilterBuilderItem,
  EntityQueryFilterBuilderState,
  EntityQueryFilterBuilderValue
} from "./model";
import type { EntityDataGridColumnPickerLabels } from "../dataGrid";

export type EntityQueryFilterBuilderLabelsInput =
  Partial<Omit<EntityQueryFilterBuilderLabels, "operators">> & {
    operators?: Partial<Record<ConditionOperator, string>>;
  };

export interface EntityQueryFilterBuilderChangeContext {
  collection: EntityQueryFilterCollection;
  filters: EntityQueryFilter[];
  state: EntityQueryFilterBuilderState;
  unsupportedFilters: EntityQueryFilterBuilderItem[];
}

export interface EntityQueryFilterBuilderProps {
  schema?: EntitySchema | null;
  columns?: readonly EntityColumnDefinition[] | null;
  structure?: EntityApiManagerStructureResponse | null;
  rootTableName?: string | null;
  columnPickerLabels?: EntityDataGridColumnPickerLabels;
  maxRelationDepth?: number;
  value?: EntityQueryFilterBuilderValue;
  defaultValue?: EntityQueryFilterBuilderValue;
  labels?: EntityQueryFilterBuilderLabelsInput;
  locale?: string;
  disabled?: boolean;
  className?: string;
  onChange?: (context: EntityQueryFilterBuilderChangeContext) => void;
}

export const EntityQueryFilterBuilder = Titanic.getReactModule<
  DefinedEntityReactComponent<EntityQueryFilterBuilderProps>
>("Titanic.UI.EntityQueryFilterBuilder")!;

export const entityQueryFilterBuilderComponentSchema = defineComponentSchema<EntityQueryFilterBuilderProps>({
  kind: "component",
  name: entityReactComponentNames.EntityQueryFilterBuilder,
  component: EntityQueryFilterBuilder
});

export * from "./model";
export {
  defaultEntityQueryFilterBuilderCulture,
  entityQueryFilterBuilderLocalizationSchemaName,
  getEntityQueryFilterBuilderLabels,
  resolveEntityQueryFilterBuilderCulture
} from "./entity-query-filter-builder-lcz";
export type { EntityQueryFilterBuilderCulture } from "./entity-query-filter-builder-lcz";
