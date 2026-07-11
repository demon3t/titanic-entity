/** Structure metadata payload returned by the Entity API manager. */
export interface ApiManagerStructureResponse {
  /** Entities exposed by the backend manager. */
  entities: ApiStructureEntityResponse[];
}

/** Entity description inside the structure metadata payload. */
export interface ApiStructureEntityResponse {
  /** Physical table name. */
  tableName: string;

  /** Backend CLR type name for the entity. */
  entityTypeName: string;

  /** Columns available for the entity. */
  columns: ApiStructureColumnResponse[];
}

/** Column description inside the structure metadata payload. */
export interface ApiStructureColumnResponse {
  /** Backend property name. */
  propertyName: string;

  /** Physical database column name. */
  columnName: string;

  /** Backend data type identifier. */
  dataValueType: number | string;

  /** Indicates whether the column accepts null values. */
  isNullable: boolean;

  /** Indicates whether the column is part of the primary key. */
  isPrimary: boolean;

  /** Indicates whether the column is the display column. */
  isDisplay: boolean;

  /** Indicates whether the column references another entity. */
  isReference: boolean;

  /** Optional table name of the referenced entity. */
  referenceTableName?: string | null;
}
