import { defineComponentSchema } from "@titanic-entity/entity-base";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";
import { NavigationTrail, type NavigationTrailProps } from "./navigation-trail";

export type {
  NavigationTrailClassNames,
  NavigationTrailItem,
  NavigationTrailProps
} from "./navigation-trail";
export { NavigationTrail } from "./navigation-trail";

export const navigationTrailComponentSchema = defineComponentSchema<NavigationTrailProps>({
  kind: "component",
  name: entityReactComponentNames.NavigationTrail,
  component: NavigationTrail
});
