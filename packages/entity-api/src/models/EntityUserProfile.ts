// Модель обмена данными Entity ORM API для 'EntityUserProfile'.
export interface EntityUserProfileDto {
  key: string;
  data: string | null;
}

export interface EntityUserProfileOptions {
  tableName?: string;
  idColumn?: string;
  keyColumn?: string;
  userColumn?: string;
  dataColumn?: string;
}

