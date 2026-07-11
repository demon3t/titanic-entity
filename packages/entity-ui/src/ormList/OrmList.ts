import { defineComponentSchema, defineGridSchema } from "@titanic-entity/entity-base";
import { EntityOrmList as OrmList, type EntityOrmListProps as OrmListProps } from "@titanic-entity/entity-react/grids";
import { entityReactComponentNames, entityReactGridNames } from "@titanic-entity/entity-react/model";

export const ormListComponentSchema = defineComponentSchema<OrmListProps<any>>({
  kind: "component",
  name: entityReactComponentNames.EntityOrmList,
  component: OrmList
});

export const ormListSchema = defineGridSchema<OrmListProps<any>>({
  kind: "grid",
  name: entityReactGridNames.EntityOrmList,
  component: OrmList
});
