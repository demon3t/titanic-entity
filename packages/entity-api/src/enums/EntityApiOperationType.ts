/** Operation types supported by the Entity API manager endpoint. */
export enum EntityApiOperationType {
  /** Operation type is missing or unknown. */
  Unknown = 0,

  /** Select entities via EntityQuery. */
  Select = 1,

  /** Create or update an entity. */
  Save = 2,

  /** Delete entities by filter. */
  Delete = 3
}
