import { Titanic as BaseTitanic } from "@titanic-entity/entity-base";
import {
  ConditionOperator,
  EntityLogicalOperation,
  type ESQFilter,
  type ESQFilterCollection
} from "@titanic-entity/entity-api";

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

export function createEqualFilter(path: string, value: unknown): ESQFilter {
  return createFilter(path, ConditionOperator.Equal, value);
}

export function createNotEqualFilter(path: string, value: unknown): ESQFilter {
  return createFilter(path, ConditionOperator.NotEqual, value);
}

export function createGreaterThanFilter(path: string, value: unknown): ESQFilter {
  return createFilter(path, ConditionOperator.GreaterThan, value);
}

export function createGreaterThanOrEqualFilter(path: string, value: unknown): ESQFilter {
  return createFilter(path, ConditionOperator.GreaterThanOrEqual, value);
}

export function createLessThanFilter(path: string, value: unknown): ESQFilter {
  return createFilter(path, ConditionOperator.LessThan, value);
}

export function createLessThanOrEqualFilter(path: string, value: unknown): ESQFilter {
  return createFilter(path, ConditionOperator.LessThanOrEqual, value);
}

export function createInFilter(path: string, values: readonly unknown[]): ESQFilter {
  return createFilter(path, ConditionOperator.In, values);
}

export function createNotInFilter(path: string, values: readonly unknown[]): ESQFilter {
  return createFilter(path, ConditionOperator.NotIn, values);
}

export function createContainsFilter(path: string, value: unknown): ESQFilter {
  return createFilter(path, ConditionOperator.Contains, value);
}

export function createIsNullFilter(path: string): ESQFilter {
  return createFilter(path, ConditionOperator.IsNull);
}

export function createIsNotNullFilter(path: string): ESQFilter {
  return createFilter(path, ConditionOperator.IsNotNull);
}

export function createGroupFilter(
  logicalOperation: EntityLogicalOperation,
  filters: readonly ESQFilter[] = []
): ESQFilter {
  return {
    logicalOperation,
    items: filters.map(cloneFilter)
  };
}

export function createAndFilter(...filters: ESQFilter[]): ESQFilter {
  return createGroupFilter(EntityLogicalOperation.And, filters);
}

export function createOrFilter(...filters: ESQFilter[]): ESQFilter {
  return createGroupFilter(EntityLogicalOperation.Or, filters);
}

export function createFilterCollection(
  filters: readonly ESQFilter[] = [],
  logicalOperation: EntityLogicalOperation = EntityLogicalOperation.And
): ESQFilterCollection {
  return {
    logicalOperation,
    items: filters.map(cloneFilter)
  };
}

export interface TitanicEntityFilterFactory {
  createFilter: typeof createFilter;
  createEqualFilter: typeof createEqualFilter;
  createNotEqualFilter: typeof createNotEqualFilter;
  createGreaterThanFilter: typeof createGreaterThanFilter;
  createGreaterThanOrEqualFilter: typeof createGreaterThanOrEqualFilter;
  createLessThanFilter: typeof createLessThanFilter;
  createLessThanOrEqualFilter: typeof createLessThanOrEqualFilter;
  createInFilter: typeof createInFilter;
  createNotInFilter: typeof createNotInFilter;
  createContainsFilter: typeof createContainsFilter;
  createIsNullFilter: typeof createIsNullFilter;
  createIsNotNullFilter: typeof createIsNotNullFilter;
  createGroupFilter: typeof createGroupFilter;
  createAndFilter: typeof createAndFilter;
  createOrFilter: typeof createOrFilter;
  createFilterCollection: typeof createFilterCollection;
}

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

export const Titanic = Object.assign(BaseTitanic, titanicEntityFilterFactory);

declare module "@titanic-entity/entity-base" {
  namespace Titanic {
    export function createFilter(
      path: string,
      comparisonType: ConditionOperator,
      value?: unknown,
      secondValue?: unknown
    ): ESQFilter;
    export function createEqualFilter(path: string, value: unknown): ESQFilter;
    export function createNotEqualFilter(path: string, value: unknown): ESQFilter;
    export function createGreaterThanFilter(path: string, value: unknown): ESQFilter;
    export function createGreaterThanOrEqualFilter(path: string, value: unknown): ESQFilter;
    export function createLessThanFilter(path: string, value: unknown): ESQFilter;
    export function createLessThanOrEqualFilter(path: string, value: unknown): ESQFilter;
    export function createInFilter(path: string, values: readonly unknown[]): ESQFilter;
    export function createNotInFilter(path: string, values: readonly unknown[]): ESQFilter;
    export function createContainsFilter(path: string, value: unknown): ESQFilter;
    export function createIsNullFilter(path: string): ESQFilter;
    export function createIsNotNullFilter(path: string): ESQFilter;
    export function createGroupFilter(
      logicalOperation: EntityLogicalOperation,
      filters?: readonly ESQFilter[]
    ): ESQFilter;
    export function createAndFilter(...filters: ESQFilter[]): ESQFilter;
    export function createOrFilter(...filters: ESQFilter[]): ESQFilter;
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
