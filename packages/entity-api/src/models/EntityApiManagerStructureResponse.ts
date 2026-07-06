// Модель обмена данными Entity ORM API для 'EntityApiManagerStructureResponse'.
export interface EntityApiManagerStructureResponse {
  entities: EntityApiStructureEntityResponse[];
}

export interface EntityApiStructureEntityResponse {
  tableName: string;
  entityTypeName: string;
  columns: EntityApiStructureColumnResponse[];
}

export interface EntityApiStructureColumnResponse {
  propertyName: string;
  columnName: string;
  dataValueType: number | string;
  isNullable: boolean;
  isPrimary: boolean;
  isDisplay: boolean;
  isReference: boolean;
  referenceTableName?: string | null;
}
