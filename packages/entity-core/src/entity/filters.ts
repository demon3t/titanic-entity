import { Titanic as BaseTitanic } from "@titanic-entity/entity-base";
import { ConditionOperator } from "./enums/ConditionOperator";
import { EntityLogicalOperation } from "./enums/EntityLogicalOperation";
import type { EntityQueryFilter } from "./models/EntityQueryFilter";
import type { EntityQueryFilterCollection } from "./models/EntityQueryFilterCollection";

function createFilter(
  path: string,
  comparisonType: ConditionOperator,
  value?: unknown,
  secondValue?: unknown
): EntityQueryFilter {
  return {
    path,
    comparisonType,
    ...(value !== undefined ? { value } : {}),
    ...(secondValue !== undefined ? { secondValue } : {})
  };
}

/**
 * Creates an equality EntityQuery filter.
 *
 * @param path Entity path of the filtered column.
 * @param value Expected column value.
 */
export function createIsEqualFilter(path: string, value: unknown): EntityQueryFilter {
  return createFilter(path, ConditionOperator.Equal, value);
}

/**
 * Creates a non-equality EntityQuery filter.
 *
 * @param path Entity path of the filtered column.
 * @param value Value that should not match the column.
 */
export function createIsNotEqualFilter(path: string, value: unknown): EntityQueryFilter {
  return createFilter(path, ConditionOperator.NotEqual, value);
}

/**
 * Creates a greater-than EntityQuery filter.
 *
 * @param path Entity path of the filtered column.
 * @param value Lower exclusive boundary value.
 */
export function createIsGreaterThanFilter(path: string, value: unknown): EntityQueryFilter {
  return createFilter(path, ConditionOperator.GreaterThan, value);
}

/**
 * Creates a greater-than-or-equal EntityQuery filter.
 *
 * @param path Entity path of the filtered column.
 * @param value Lower inclusive boundary value.
 */
export function createIsGreaterThanOrEqualFilter(path: string, value: unknown): EntityQueryFilter {
  return createFilter(path, ConditionOperator.GreaterThanOrEqual, value);
}

/**
 * Creates a less-than EntityQuery filter.
 *
 * @param path Entity path of the filtered column.
 * @param value Upper exclusive boundary value.
 */
export function createIsLessThanFilter(path: string, value: unknown): EntityQueryFilter {
  return createFilter(path, ConditionOperator.LessThan, value);
}

/**
 * Creates a less-than-or-equal EntityQuery filter.
 *
 * @param path Entity path of the filtered column.
 * @param value Upper inclusive boundary value.
 */
export function createIsLessThanOrEqualFilter(path: string, value: unknown): EntityQueryFilter {
  return createFilter(path, ConditionOperator.LessThanOrEqual, value);
}

/**
 * Creates an EntityQuery membership filter.
 *
 * @param path Entity path of the filtered column.
 * @param values Candidate values accepted by the filter.
 */
export function createIsInFilter(path: string, values: readonly unknown[]): EntityQueryFilter {
  return createFilter(path, ConditionOperator.In, values);
}

/**
 * Creates a negative EntityQuery membership filter.
 *
 * @param path Entity path of the filtered column.
 * @param values Candidate values rejected by the filter.
 */
export function createIsNotInFilter(path: string, values: readonly unknown[]): EntityQueryFilter {
  return createFilter(path, ConditionOperator.NotIn, values);
}

/**
 * Creates a contains EntityQuery filter.
 *
 * @param path Entity path of the filtered column.
 * @param value Value that should be contained in the column.
 */
export function createIsContainsFilter(path: string, value: unknown): EntityQueryFilter {
  return createFilter(path, ConditionOperator.Contains, value);
}

/**
 * Creates an EntityQuery null-check filter.
 *
 * @param path Entity path of the filtered column.
 */
export function createIsNullFilter(path: string): EntityQueryFilter {
  return createFilter(path, ConditionOperator.IsNull);
}

/**
 * Creates an EntityQuery non-null-check filter.
 *
 * @param path Entity path of the filtered column.
 */
export function createIsNotNullFilter(path: string): EntityQueryFilter {
  return createFilter(path, ConditionOperator.IsNotNull);
}

/**
 * Creates a nested EntityQuery filter group.
 *
 * @param logicalOperation Logical operation used between nested filters.
 * @param filters Child filters included in the group.
 */
export function createGroupFilter(
  logicalOperation: EntityLogicalOperation,
  filters: readonly EntityQueryFilter[] = []
): EntityQueryFilter {
  return {
    logicalOperation,
    items: filters.map(cloneFilter)
  };
}

/**
 * Creates an EntityQuery filter group joined by AND.
 *
 * @param filters Child filters included in the group.
 */
export function createAndFilter(...filters: EntityQueryFilter[]): EntityQueryFilter {
  return createGroupFilter(EntityLogicalOperation.And, filters);
}

/**
 * Creates an EntityQuery filter group joined by OR.
 *
 * @param filters Child filters included in the group.
 */
export function createOrFilter(...filters: EntityQueryFilter[]): EntityQueryFilter {
  return createGroupFilter(EntityLogicalOperation.Or, filters);
}

/**
 * Creates a root-level EntityQuery filter collection.
 *
 * @param filters Root filters included in the collection.
 * @param logicalOperation Logical operation used between root filters.
 */
export function createFilterCollection(
  filters: readonly EntityQueryFilter[] = [],
  logicalOperation: EntityLogicalOperation = EntityLogicalOperation.And
): EntityQueryFilterCollection {
  return {
    logicalOperation,
    items: filters.map(cloneFilter)
  };
}

/** Static EntityQuery filter factory methods added to the Titanic facade by entity-core. */
export interface TitanicEntityFilterFactory {
  /** Creates an equality EntityQuery filter. */
  createIsEqualFilter: typeof createIsEqualFilter;
  /** Creates a non-equality EntityQuery filter. */
  createIsNotEqualFilter: typeof createIsNotEqualFilter;
  /** Creates a greater-than EntityQuery filter. */
  createIsGreaterThanFilter: typeof createIsGreaterThanFilter;
  /** Creates a greater-than-or-equal EntityQuery filter. */
  createIsGreaterThanOrEqualFilter: typeof createIsGreaterThanOrEqualFilter;
  /** Creates a less-than EntityQuery filter. */
  createIsLessThanFilter: typeof createIsLessThanFilter;
  /** Creates a less-than-or-equal EntityQuery filter. */
  createIsLessThanOrEqualFilter: typeof createIsLessThanOrEqualFilter;
  /** Creates an EntityQuery membership filter. */
  createIsInFilter: typeof createIsInFilter;
  /** Creates a negative EntityQuery membership filter. */
  createIsNotInFilter: typeof createIsNotInFilter;
  /** Creates a contains EntityQuery filter. */
  createIsContainsFilter: typeof createIsContainsFilter;
  /** Creates an EntityQuery null-check filter. */
  createIsNullFilter: typeof createIsNullFilter;
  /** Creates an EntityQuery non-null-check filter. */
  createIsNotNullFilter: typeof createIsNotNullFilter;
  /** Creates a nested EntityQuery filter group. */
  createGroupFilter: typeof createGroupFilter;
  /** Creates an EntityQuery filter group joined by AND. */
  createAndFilter: typeof createAndFilter;
  /** Creates an EntityQuery filter group joined by OR. */
  createOrFilter: typeof createOrFilter;
  /** Creates a root-level EntityQuery filter collection. */
  createFilterCollection: typeof createFilterCollection;
}

/** EntityQuery filter factory method map used to extend the Titanic facade. */
export const titanicEntityFilterFactory: TitanicEntityFilterFactory = {
  createIsEqualFilter,
  createIsNotEqualFilter,
  createIsGreaterThanFilter,
  createIsGreaterThanOrEqualFilter,
  createIsLessThanFilter,
  createIsLessThanOrEqualFilter,
  createIsInFilter,
  createIsNotInFilter,
  createIsContainsFilter,
  createIsNullFilter,
  createIsNotNullFilter,
  createGroupFilter,
  createAndFilter,
  createOrFilter,
  createFilterCollection
};

/** Titanic facade extended with entity-core EntityQuery filter factory methods. */
export const Titanic = Object.assign(BaseTitanic, titanicEntityFilterFactory);

declare module "@titanic-entity/entity-base" {
  namespace Titanic {
    /**
     * Creates an equality EntityQuery filter.
     *
     * @param path Entity path of the filtered column.
     * @param value Expected column value.
     */
    export function createIsEqualFilter(path: string, value: unknown): EntityQueryFilter;
    /**
     * Creates a non-equality EntityQuery filter.
     *
     * @param path Entity path of the filtered column.
     * @param value Value that should not match the column.
     */
    export function createIsNotEqualFilter(path: string, value: unknown): EntityQueryFilter;
    /**
     * Creates a greater-than EntityQuery filter.
     *
     * @param path Entity path of the filtered column.
     * @param value Lower exclusive boundary value.
     */
    export function createIsGreaterThanFilter(path: string, value: unknown): EntityQueryFilter;
    /**
     * Creates a greater-than-or-equal EntityQuery filter.
     *
     * @param path Entity path of the filtered column.
     * @param value Lower inclusive boundary value.
     */
    export function createIsGreaterThanOrEqualFilter(path: string, value: unknown): EntityQueryFilter;
    /**
     * Creates a less-than EntityQuery filter.
     *
     * @param path Entity path of the filtered column.
     * @param value Upper exclusive boundary value.
     */
    export function createIsLessThanFilter(path: string, value: unknown): EntityQueryFilter;
    /**
     * Creates a less-than-or-equal EntityQuery filter.
     *
     * @param path Entity path of the filtered column.
     * @param value Upper inclusive boundary value.
     */
    export function createIsLessThanOrEqualFilter(path: string, value: unknown): EntityQueryFilter;
    /**
     * Creates an EntityQuery membership filter.
     *
     * @param path Entity path of the filtered column.
     * @param values Candidate values accepted by the filter.
     */
    export function createIsInFilter(path: string, values: readonly unknown[]): EntityQueryFilter;
    /**
     * Creates a negative EntityQuery membership filter.
     *
     * @param path Entity path of the filtered column.
     * @param values Candidate values rejected by the filter.
     */
    export function createIsNotInFilter(path: string, values: readonly unknown[]): EntityQueryFilter;
    /**
     * Creates a contains EntityQuery filter.
     *
     * @param path Entity path of the filtered column.
     * @param value Value that should be contained in the column.
     */
    export function createIsContainsFilter(path: string, value: unknown): EntityQueryFilter;
    /**
     * Creates an EntityQuery null-check filter.
     *
     * @param path Entity path of the filtered column.
     */
    export function createIsNullFilter(path: string): EntityQueryFilter;
    /**
     * Creates an EntityQuery non-null-check filter.
     *
     * @param path Entity path of the filtered column.
     */
    export function createIsNotNullFilter(path: string): EntityQueryFilter;
    /**
     * Creates a nested EntityQuery filter group.
     *
     * @param logicalOperation Logical operation used between nested filters.
     * @param filters Child filters included in the group.
     */
    export function createGroupFilter(
      logicalOperation: EntityLogicalOperation,
      filters?: readonly EntityQueryFilter[]
    ): EntityQueryFilter;
    /**
     * Creates an EntityQuery filter group joined by AND.
     *
     * @param filters Child filters included in the group.
     */
    export function createAndFilter(...filters: EntityQueryFilter[]): EntityQueryFilter;
    /**
     * Creates an EntityQuery filter group joined by OR.
     *
     * @param filters Child filters included in the group.
     */
    export function createOrFilter(...filters: EntityQueryFilter[]): EntityQueryFilter;
    /**
     * Creates a root-level EntityQuery filter collection.
     *
     * @param filters Root filters included in the collection.
     * @param logicalOperation Logical operation used between root filters.
     */
    export function createFilterCollection(
      filters?: readonly EntityQueryFilter[],
      logicalOperation?: EntityLogicalOperation
    ): EntityQueryFilterCollection;
  }
}

function cloneFilter(filter: EntityQueryFilter): EntityQueryFilter {
  return {
    ...filter,
    items: filter.items?.map(cloneFilter)
  };
}
