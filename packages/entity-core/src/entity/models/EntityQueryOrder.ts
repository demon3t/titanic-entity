import type { EntityOrderDirection } from "../enums/EntityOrderDirection";

/** Sort descriptor used inside an entity query payload. */
export interface EntityQueryOrder {
  /** Entity path of the ordered column. */
  path: string;

  /** Sort direction used by the backend. */
  direction?: EntityOrderDirection;

  /** Legacy descending flag kept for backward compatibility. */
  desc?: boolean;
}
