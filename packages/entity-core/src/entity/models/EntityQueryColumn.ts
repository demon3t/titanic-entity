import type { EntityAggregationType } from "../enums/EntityAggregationType";
import type { EntityQuery } from "./EntityQuery";

/** Column descriptor used inside an entity query payload. */
export interface EntityQueryColumn {
  /** Entity path of the selected column. */
  path?: string | null;

  /** Optional result alias returned by the backend. */
  alias?: string | null;

  /** Optional aggregation applied to the selected column. */
  aggregationType?: EntityAggregationType;

  /** Optional nested entity query used as the column source. */
  subQuery?: EntityQuery | null;
}
