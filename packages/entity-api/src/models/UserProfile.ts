/** User profile record returned by {@link EntityUserProfileApiClient}. */
export interface UserProfileDto {
  /** Normalized profile key. */
  key: string;

  /** Stored profile payload. */
  data: string | null;
}

/** Column mapping overrides for the user profile storage table. */
export interface UserProfileOptions {
  /** Storage table name. */
  tableName?: string;

  /** Primary key column name. */
  idColumn?: string;

  /** Profile key column name. */
  keyColumn?: string;

  /** User identifier column name. */
  userColumn?: string;

  /** Payload column name. */
  dataColumn?: string;
}
