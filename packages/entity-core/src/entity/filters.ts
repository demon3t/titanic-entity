import { Titanic as BaseTitanic } from "@titanic-entity/entity-base";
import {
  ConditionOperator,
  EntityLogicalOperation,
  type ESQFilter,
  type ESQFilterCollection
} from "@titanic-entity/entity-api";

function createFilter(
  path: string,
  comparisonType: ConditionOperator,
  value?: unknown,
  secondValue?: unknown
): ESQFilter {
  return {
    path,
    comparisonType,
    ...(value !== undefined ? { value } : {}),
    ...(secondValue !== undefined ? { secondValue } : {})
  };
}

/**
 * Creates an equality ESQ filter.
 *
 * @param path Entity path of the filtered column.
 * @param value Expected column value.
 */
export function createIsEqualFilter(path: string, value: unknown): ESQFilter {
  return createFilter(path, ConditionOperator.Equal, value);
}

/**
 * Creates a non-equality ESQ filter.
 *
 * @param path Entity path of the filtered column.
 * @param value Value that should not match the column.
 */
export function createIsNotEqualFilter(path: string, value: unknown): ESQFilter {
  return createFilter(path, ConditionOperator.NotEqual, value);
}

/**
 * Creates a greater-than ESQ filter.
 *
 * @param path Entity path of the filtered column.
 * @param value Lower exclusive boundary value.
 */
export function createIsGreaterThanFilter(path: string, value: unknown): ESQFilter {
  return createFilter(path, ConditionOperator.GreaterThan, value);
}

/**
 * Creates a greater-than-or-equal ESQ filter.
 *
 * @param path Entity path of the filtered column.
 * @param value Lower inclusive boundary value.
 */
export function createIsGreaterThanOrEqualFilter(path: string, value: unknown): ESQFilter {
  return createFilter(path, ConditionOperator.GreaterThanOrEqual, value);
}

/**
 * Creates a less-than ESQ filter.
 *
 * @param path Entity path of the filtered column.
 * @param value Upper exclusive boundary value.
 */
export function createIsLessThanFilter(path: string, value: unknown): ESQFilter {
  return createFilter(path, ConditionOperator.LessThan, value);
}

/**
 * Creates a less-than-or-equal ESQ filter.
 *
 * @param path Entity path of the filtered column.
 * @param value Upper inclusive boundary value.
 */
export function createIsLessThanOrEqualFilter(path: string, value: unknown): ESQFilter {
  return createFilter(path, ConditionOperator.LessThanOrEqual, value);
}

/**
 * Creates an ESQ membership filter.
 *
 * @param path Entity path of the filtered column.
 * @param values Candidate values accepted by the filter.
 */
export function createIsInFilter(path: string, values: readonly unknown[]): ESQFilter {
  return createFilter(path, ConditionOperator.In, values);
}

/**
 * Creates a negative ESQ membership filter.
 *
 * @param path Entity path of the filtered column.
 * @param values Candidate values rejected by the filter.
 */
export function createIsNotInFilter(path: string, values: readonly unknown[]): ESQFilter {
  return createFilter(path, ConditionOperator.NotIn, values);
}

/**
 * Creates a contains ESQ filter.
 *
 * @param path Entity path of the filtered column.
 * @param value Value that should be contained in the column.
 */
export function createIsContainsFilter(path: string, value: unknown): ESQFilter {
  return createFilter(path, ConditionOperator.Contains, value);
}

/**
 * Creates an ESQ null-check filter.
 *
 * @param path Entity path of the filtered column.
 */
export function createIsNullFilter(path: string): ESQFilter {
  return createFilter(path, ConditionOperator.IsNull);
}

/**
 * Creates an ESQ non-null-check filter.
 *
 * @param path Entity path of the filtered column.
 */
export function createIsNotNullFilter(path: string): ESQFilter {
  return createFilter(path, ConditionOperator.IsNotNull);
}

/**
 * Creates a nested ESQ filter group.
 *
 * @param logicalOperation Logical operation used between nested filters.
 * @param filters Child filters included in the group.
 */
export function createGroupFilter(
  logicalOperation: EntityLogicalOperation,
  filters: readonly ESQFilter[] = []
): ESQFilter {
  return {
    logicalOperation,
    items: filters.map(cloneFilter)
  };
}

/**
 * Creates an ESQ filter group joined by AND.
 *
 * @param filters Child filters included in the group.
 */
export function createAndFilter(...filters: ESQFilter[]): ESQFilter {
  return createGroupFilter(EntityLogicalOperation.And, filters);
}

/**
 * Creates an ESQ filter group joined by OR.
 *
 * @param filters Child filters included in the group.
 */
export function createOrFilter(...filters: ESQFilter[]): ESQFilter {
  return createGroupFilter(EntityLogicalOperation.Or, filters);
}

/**
 * Creates a root-level ESQ filter collection.
 *
 * @param filters Root filters included in the collection.
 * @param logicalOperation Logical operation used between root filters.
 */
export function createFilterCollection(
  filters: readonly ESQFilter[] = [],
  logicalOperation: EntityLogicalOperation = EntityLogicalOperation.And
): ESQFilterCollection {
  return {
    logicalOperation,
    items: filters.map(cloneFilter)
  };
}

/** Static ESQ filter factory methods added to the Titanic facade by entity-core. */
export interface TitanicEntityFilterFactory {
  /** Creates an equality ESQ filter. */
  createIsEqualFilter: typeof createIsEqualFilter;
  /** Creates a non-equality ESQ filter. */
  createIsNotEqualFilter: typeof createIsNotEqualFilter;
  /** Creates a greater-than ESQ filter. */
  createIsGreaterThanFilter: typeof createIsGreaterThanFilter;
  /** Creates a greater-than-or-equal ESQ filter. */
  createIsGreaterThanOrEqualFilter: typeof createIsGreaterThanOrEqualFilter;
  /** Creates a less-than ESQ filter. */
  createIsLessThanFilter: typeof createIsLessThanFilter;
  /** Creates a less-than-or-equal ESQ filter. */
  createIsLessThanOrEqualFilter: typeof createIsLessThanOrEqualFilter;
  /** Creates an ESQ membership filter. */
  createIsInFilter: typeof createIsInFilter;
  /** Creates a negative ESQ membership filter. */
  createIsNotInFilter: typeof createIsNotInFilter;
  /** Creates a contains ESQ filter. */
  createIsContainsFilter: typeof createIsContainsFilter;
  /** Creates an ESQ null-check filter. */
  createIsNullFilter: typeof createIsNullFilter;
  /** Creates an ESQ non-null-check filter. */
  createIsNotNullFilter: typeof createIsNotNullFilter;
  /** Creates a nested ESQ filter group. */
  createGroupFilter: typeof createGroupFilter;
  /** Creates an ESQ filter group joined by AND. */
  createAndFilter: typeof createAndFilter;
  /** Creates an ESQ filter group joined by OR. */
  createOrFilter: typeof createOrFilter;
  /** Creates a root-level ESQ filter collection. */
  createFilterCollection: typeof createFilterCollection;
}

/** ESQ filter factory method map used to extend the Titanic facade. */
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

/** Titanic facade extended with entity-core ESQ filter factory methods. */
export const Titanic = Object.assign(BaseTitanic, titanicEntityFilterFactory);

declare module "@titanic-entity/entity-base" {
  namespace Titanic {
    /**
     * Creates an equality ESQ filter.
     *
     * @param path Entity path of the filtered column.
     * @param value Expected column value.
     */
    export function createIsEqualFilter(path: string, value: unknown): ESQFilter;
    /**
     * Creates a non-equality ESQ filter.
     *
     * @param path Entity path of the filtered column.
     * @param value Value that should not match the column.
     */
    export function createIsNotEqualFilter(path: string, value: unknown): ESQFilter;
    /**
     * Creates a greater-than ESQ filter.
     *
     * @param path Entity path of the filtered column.
     * @param value Lower exclusive boundary value.
     */
    export function createIsGreaterThanFilter(path: string, value: unknown): ESQFilter;
    /**
     * Creates a greater-than-or-equal ESQ filter.
     *
     * @param path Entity path of the filtered column.
     * @param value Lower inclusive boundary value.
     */
    export function createIsGreaterThanOrEqualFilter(path: string, value: unknown): ESQFilter;
    /**
     * Creates a less-than ESQ filter.
     *
     * @param path Entity path of the filtered column.
     * @param value Upper exclusive boundary value.
     */
    export function createIsLessThanFilter(path: string, value: unknown): ESQFilter;
    /**
     * Creates a less-than-or-equal ESQ filter.
     *
     * @param path Entity path of the filtered column.
     * @param value Upper inclusive boundary value.
     */
    export function createIsLessThanOrEqualFilter(path: string, value: unknown): ESQFilter;
    /**
     * Creates an ESQ membership filter.
     *
     * @param path Entity path of the filtered column.
     * @param values Candidate values accepted by the filter.
     */
    export function createIsInFilter(path: string, values: readonly unknown[]): ESQFilter;
    /**
     * Creates a negative ESQ membership filter.
     *
     * @param path Entity path of the filtered column.
     * @param values Candidate values rejected by the filter.
     */
    export function createIsNotInFilter(path: string, values: readonly unknown[]): ESQFilter;
    /**
     * Creates a contains ESQ filter.
     *
     * @param path Entity path of the filtered column.
     * @param value Value that should be contained in the column.
     */
    export function createIsContainsFilter(path: string, value: unknown): ESQFilter;
    /**
     * Creates an ESQ null-check filter.
     *
     * @param path Entity path of the filtered column.
     */
    export function createIsNullFilter(path: string): ESQFilter;
    /**
     * Creates an ESQ non-null-check filter.
     *
     * @param path Entity path of the filtered column.
     */
    export function createIsNotNullFilter(path: string): ESQFilter;
    /**
     * Creates a nested ESQ filter group.
     *
     * @param logicalOperation Logical operation used between nested filters.
     * @param filters Child filters included in the group.
     */
    export function createGroupFilter(
      logicalOperation: EntityLogicalOperation,
      filters?: readonly ESQFilter[]
    ): ESQFilter;
    /**
     * Creates an ESQ filter group joined by AND.
     *
     * @param filters Child filters included in the group.
     */
    export function createAndFilter(...filters: ESQFilter[]): ESQFilter;
    /**
     * Creates an ESQ filter group joined by OR.
     *
     * @param filters Child filters included in the group.
     */
    export function createOrFilter(...filters: ESQFilter[]): ESQFilter;
    /**
     * Creates a root-level ESQ filter collection.
     *
     * @param filters Root filters included in the collection.
     * @param logicalOperation Logical operation used between root filters.
     */
    export function createFilterCollection(
      filters?: readonly ESQFilter[],
      logicalOperation?: EntityLogicalOperation
    ): ESQFilterCollection;
  }
}

function cloneFilter(filter: ESQFilter): ESQFilter {
  return {
    ...filter,
    items: filter.items?.map(cloneFilter)
  };
}
