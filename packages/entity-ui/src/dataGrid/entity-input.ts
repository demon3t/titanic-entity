import { Entity, type EntitySchema } from "@titanic-entity/entity-core";
import type { EntityDataGridEntityDescriptor, EntityDataGridEntityInput } from "./data-grid-props";

export function isEntityDataGridEntityModel(entity: EntityDataGridEntityInput | undefined): entity is Entity {
  if (entity instanceof Entity) {
    return true;
  }

  if (!entity || typeof entity !== "object") {
    return false;
  }

  const candidate = entity as {
    schema?: unknown;
    toValues?: unknown;
    getSaveValues?: unknown;
  };

  return Boolean(
    candidate.schema &&
      typeof candidate.schema === "object" &&
      typeof candidate.toValues === "function" &&
      typeof candidate.getSaveValues === "function"
  );
}

export function getEntityDataGridSchema(entity: EntityDataGridEntityInput | undefined): EntitySchema | undefined {
  return isEntityDataGridEntityModel(entity) ? entity.schema : undefined;
}

export function resolveEntityDataGridEntity(
  entity: EntityDataGridEntityInput | undefined,
  tableName?: string,
  primaryColumn?: string
): EntityDataGridEntityDescriptor {
  const explicitTableName = normalizeEntityName(tableName);
  const explicitPrimaryColumn = normalizeEntityName(primaryColumn);

  if (typeof entity === "string") {
    return {
      tableName: normalizeEntityName(entity) ?? explicitTableName,
      primaryColumn: explicitPrimaryColumn ?? "id"
    };
  }

  if (isEntityDataGridEntityModel(entity)) {
    const schema = entity.schema;
    return {
      tableName: explicitTableName ?? normalizeEntityName(schema.tableName) ?? normalizeEntityName(entity.tableName),
      entityTypeName: normalizeEntityName(entity.providerName) ?? normalizeEntityName(entity.name),
      primaryColumn: explicitPrimaryColumn ?? normalizeEntityName(schema.primaryColumn) ?? "id"
    };
  }

  return {
    tableName: normalizeEntityName(entity?.tableName) ?? explicitTableName,
    entityTypeName: normalizeEntityName(entity?.entityTypeName),
    primaryColumn: normalizeEntityName(entity?.primaryColumn) ?? explicitPrimaryColumn ?? "id"
  };
}

function normalizeEntityName(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
