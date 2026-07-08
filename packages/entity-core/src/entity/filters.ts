import { Titanic as BaseTitanic } from "@titanic-entity/entity-base";
import {
  ConditionOperator,
  EntityLogicalOperation,
  type ESQFilter,
  type ESQFilterCollection
} from "@titanic-entity/entity-api";

/**
 * Creates a leaf ESQ filter with an explicit comparison operator.
 *
 * @param path Entity path of the filtered column.
 * @param comparisonType Comparison operator used by the filter.
 * @param value Primary filter value.
 * @param secondValue Secondary filter value used by range operators.
 */
export function createFilter(
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
export function createEqualFilter(path: string, value: unknown): ESQFilter {
  return createFilter(path, ConditionOperator.Equal, value);
}

/**
 * Creates a non-equality ESQ filter.
 *
 * @param path Entity path of the filtered column.
 * @param value Value that should not match the column.
 */
export function createNotEqualFilter(path: string, value: unknown): ESQFilter {
  return createFilter(path, ConditionOperator.NotEqual, value);
}

/**
 * Creates a greater-than ESQ filter.
 *
 * @param path Entity path of the filtered column.
 * @param value Lower exclusive boundary value.
 */
export function createGreaterThanFilter(path: string, value: unknown): ESQFilter {
  return createFilter(path, ConditionOperator.GreaterThan, value);
}

/**
 * Creates a greater-than-or-equal ESQ filter.
 *
 * @param path Entity path of the filtered column.
 * @param value Lower inclusive boundary value.
 */
export function createGreaterThanOrEqualFilter(path: string, value: unknown): ESQFilter {
  return createFilter(path, ConditionOperator.GreaterThanOrEqual, value);
}

/**
 * Creates a less-than ESQ filter.
 *
 * @param path Entity path of the filtered column.
 * @param value Upper exclusive boundary value.
 */
export function createLessThanFilter(path: string, value: unknown): ESQFilter {
  return createFilter(path, ConditionOperator.LessThan, value);
}

/**
 * Creates a less-than-or-equal ESQ filter.
 *
 * @param path Entity path of the filtered column.
 * @param value Upper inclusive boundary value.
 */
export function createLessThanOrEqualFilter(path: string, value: unknown): ESQFilter {
  return createFilter(path, ConditionOperator.LessThanOrEqual, value);
}

/**
 * Creates an ESQ membership filter.
 *
 * @param path Entity path of the filtered column.
 * @param values Candidate values accepted by the filter.
 */
export function createInFilter(path: string, values: readonly unknown[]): ESQFilter {
  return createFilter(path, ConditionOperator.In, values);
}

/**
 * Creates a negative ESQ membership filter.
 *
 * @param path Entity path of the filtered column.
 * @param values Candidate values rejected by the filter.
 */
export function createNotInFilter(path: string, values: readonly unknown[]): ESQFilter {
  return createFilter(path, ConditionOperator.NotIn, values);
}

/**
 * Creates a contains ESQ filter.
 *
 * @param path Entity path of the filtered column.
 * @param value Value that should be contained in the column.
 */
export function createContainsFilter(path: string, value: unknown): ESQFilter {
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
  /** Creates a leaf ESQ filter with an explicit comparison operator. */
  createFilter: typeof createFilter;
  /** Creates an equality ESQ filter. */
  createEqualFilter: typeof createEqualFilter;
  /** Creates a non-equality ESQ filter. */
  createNotEqualFilter: typeof createNotEqualFilter;
  /** Creates a greater-than ESQ filter. */
  createGreaterThanFilter: typeof createGreaterThanFilter;
  /** Creates a greater-than-or-equal ESQ filter. */
  createGreaterThanOrEqualFilter: typeof createGreaterThanOrEqualFilter;
  /** Creates a less-than ESQ filter. */
  createLessThanFilter: typeof createLessThanFilter;
  /** Creates a less-than-or-equal ESQ filter. */
  createLessThanOrEqualFilter: typeof createLessThanOrEqualFilter;
  /** Creates an ESQ membership filter. */
  createInFilter: typeof createInFilter;
  /** Creates a negative ESQ membership filter. */
  createNotInFilter: typeof createNotInFilter;
  /** Creates a contains ESQ filter. */
  createContainsFilter: typeof createContainsFilter;
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
  createFilter,
  createEqualFilter,
  createNotEqualFilter,
  createGreaterThanFilter,
  createGreaterThanOrEqualFilter,
  createLessThanFilter,
  createLessThanOrEqualFilter,
  createInFilter,
  createNotInFilter,
  createContainsFilter,
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
     * Creates a leaf ESQ filter with an explicit comparison operator.
     *
     * @param path Entity path of the filtered column.
     * @param comparisonType Comparison operator used by the filter.
     * @param value Primary filter value.
     * @param secondValue Secondary filter value used by range operators.
     */
    export function createFilter(
      path: string,
      comparisonType: ConditionOperator,
      value?: unknown,
      secondValue?: unknown
    ): ESQFilter;
    /**
     * Creates an equality ESQ filter.
     *
     * @param path Entity path of the filtered column.
     * @param value Expected column value.
     */
    export function createEqualFilter(path: string, value: unknown): ESQFilter;
    /**
     * Creates a non-equality ESQ filter.
     *
     * @param path Entity path of the filtered column.
     * @param value Value that should not match the column.
     */
    export function createNotEqualFilter(path: string, value: unknown): ESQFilter;
    /**
     * Creates a greater-than ESQ filter.
     *
     * @param path Entity path of the filtered column.
     * @param value Lower exclusive boundary value.
     */
    export function createGreaterThanFilter(path: string, value: unknown): ESQFilter;
    /**
     * Creates a greater-than-or-equal ESQ filter.
     *
     * @param path Entity path of the filtered column.
     * @param value Lower inclusive boundary value.
     */
    export function createGreaterThanOrEqualFilter(path: string, value: unknown): ESQFilter;
    /**
     * Creates a less-than ESQ filter.
     *
     * @param path Entity path of the filtered column.
     * @param value Upper exclusive boundary value.
     */
    export function createLessThanFilter(path: string, value: unknown): ESQFilter;
    /**
     * Creates a less-than-or-equal ESQ filter.
     *
     * @param path Entity path of the filtered column.
     * @param value Upper inclusive boundary value.
     */
    export function createLessThanOrEqualFilter(path: string, value: unknown): ESQFilter;
    /**
     * Creates an ESQ membership filter.
     *
     * @param path Entity path of the filtered column.
     * @param values Candidate values accepted by the filter.
     */
    export function createInFilter(path: string, values: readonly unknown[]): ESQFilter;
    /**
     * Creates a negative ESQ membership filter.
     *
     * @param path Entity path of the filtered column.
     * @param values Candidate values rejected by the filter.
     */
    export function createNotInFilter(path: string, values: readonly unknown[]): ESQFilter;
    /**
     * Creates a contains ESQ filter.
     *
     * @param path Entity path of the filtered column.
     * @param value Value that should be contained in the column.
     */
    export function createContainsFilter(path: string, value: unknown): ESQFilter;
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
