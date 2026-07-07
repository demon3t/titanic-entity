import type { EntityAggregationType } from "../enums/EntityAggregationType";
import type { ESQ } from "./ESQ";

/** Column descriptor used inside an ESQ payload. */
export interface ESQColumn {
  /** Entity path of the selected column. */
  path?: string | null;

  /** Optional result alias returned by the backend. */
  alias?: string | null;

  /** Optional aggregation applied to the selected column. */
  aggregationType?: EntityAggregationType;

  /** Optional nested ESQ used as the column source. */
  subQuery?: ESQ | null;
}
