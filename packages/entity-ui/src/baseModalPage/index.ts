import { defineComponentSchema } from "@titanic-entity/entity-base";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";
import { BaseModalPage } from "./base-modal-page";
import type { BaseModalPageProps } from "./base-modal-page";

export * from "./base-modal-page";

export const baseModalPageComponentSchema = defineComponentSchema<BaseModalPageProps>({
  component: BaseModalPage,
  kind: "component",
  name: entityReactComponentNames.BaseModalPage
});
