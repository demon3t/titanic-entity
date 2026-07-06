import type { EntityApiEntity } from "@titanic-entity/entity-api";
import type { EntityDataGridProps } from "../grids";
import { EntityDataGrid } from "./grid/EntityDataGrid";

export type EntityRegistryProps<TRow = EntityApiEntity> = EntityDataGridProps<TRow>;

export function EntityRegistry<TRow = EntityApiEntity>(props: EntityRegistryProps<TRow>) {
  return <EntityDataGrid {...props} />;
}

export default EntityRegistry;
