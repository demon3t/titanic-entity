import { createEntityGuid, getEntityValue, normalizeEntityProfileKey } from "../client/entityHelpers";
import { ConditionOperator } from "../enums/ConditionOperator";
import type { EntityApiClient } from "../client/EntityApiClient";
import type { EntityApiEntity } from "../models/EntityApiEntity";
import type { EntityUserProfileDto, EntityUserProfileOptions } from "../models/EntityUserProfile";

/** Service contract for reading and saving user profile records. */
export interface EntityUserProfileClient {
  /**
   * Loads a user profile record by key and user identifier.
   *
   * @param key Profile key.
   * @param userId User identifier.
   * @param options Optional storage mapping overrides.
   */
  getEntityUserProfile(key: string, userId: string, options?: EntityUserProfileOptions): Promise<EntityUserProfileDto>;

  /**
   * Saves a user profile record by key and user identifier.
   *
   * @param key Profile key.
   * @param userId User identifier.
   * @param data Serialized profile payload.
   * @param options Optional storage mapping overrides.
   */
  saveEntityUserProfile(key: string, userId: string, data: string, options?: EntityUserProfileOptions): Promise<EntityUserProfileDto>;
}

type EntityUserProfileTransport = Pick<EntityApiClient, "save" | "selectRows">;

/** Default implementation backed by {@link EntityApiClient}. */
export class EntityUserProfileApiClient implements EntityUserProfileClient {
  /**
   * Creates a new user profile client.
   *
   * @param client Entity API transport used to read and save records.
   */
  constructor(private readonly client: EntityUserProfileTransport) {}

  /**
   * Loads a user profile record by key and user identifier.
   *
   * @param key Profile key.
   * @param userId User identifier.
   * @param options Optional storage mapping overrides.
   */
  async getEntityUserProfile(key: string, userId: string, options: EntityUserProfileOptions = {}): Promise<EntityUserProfileDto> {
    const profile = resolveUserProfileOptions(options);
    const safeKey = normalizeEntityProfileKey(key);
    const row = await this.findEntityUserProfileRow(safeKey, userId, profile);

    return {
      key: safeKey,
      data: row ? getEntityValue<string | null>(row, profile.dataColumn) : null
    };
  }

  /**
   * Saves a user profile record by key and user identifier.
   *
   * @param key Profile key.
   * @param userId User identifier.
   * @param data Serialized profile payload.
   * @param options Optional storage mapping overrides.
   */
  async saveEntityUserProfile(key: string, userId: string, data: string, options: EntityUserProfileOptions = {}): Promise<EntityUserProfileDto> {
    const profile = resolveUserProfileOptions(options);
    const safeKey = normalizeEntityProfileKey(key);
    const row = await this.findEntityUserProfileRow(safeKey, userId, profile);

    await this.client.save(profile.tableName, {
      [profile.idColumn]: row ? getEntityValue<string>(row, profile.idColumn) ?? createEntityGuid() : createEntityGuid(),
      [profile.keyColumn]: safeKey,
      [profile.userColumn]: userId,
      [profile.dataColumn]: data ?? ""
    });

    return {
      key: safeKey,
      data: data ?? ""
    };
  }

  private async findEntityUserProfileRow(
    key: string,
    userId: string,
    profile: Required<EntityUserProfileOptions>
  ): Promise<EntityApiEntity | null> {
    const rows = await this.client.selectRows(profile.tableName, [
      {
        path: profile.keyColumn,
        comparisonType: ConditionOperator.Equal,
        value: key
      },
      {
        path: profile.userColumn,
        comparisonType: ConditionOperator.Equal,
        value: userId
      }
    ], undefined, 1);

    return rows[0] ?? null;
  }
}

function resolveUserProfileOptions(options: EntityUserProfileOptions): Required<EntityUserProfileOptions> {
  return {
    tableName: options.tableName ?? "sys_user_profile",
    idColumn: options.idColumn ?? "Id",
    keyColumn: options.keyColumn ?? "Key",
    userColumn: options.userColumn ?? "UserIs",
    dataColumn: options.dataColumn ?? "Data"
  };
}
