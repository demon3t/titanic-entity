import { defineComponentSchema } from "@titanic-entity/entity-base";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";
import {
  AlertModalPage,
  ApprovalModalPage,
  type AlertModalPageProps,
  type ApprovalModalPageProps
} from "./modal-pages";

export * from "./modal-pages";
export {
  defaultModalPageCulture,
  getModalPageLabels,
  modalPagesLocalizationSchemaName
} from "./modal-pages-lcz";
export type {
  ModalPageCulture,
  ModalPageLabels,
  ModalPageResolvedLabels
} from "./modal-pages-lcz";

export const alertModalPageComponentSchema = defineComponentSchema<AlertModalPageProps>({
  component: AlertModalPage,
  kind: "component",
  name: entityReactComponentNames.AlertModalPage
});

export const approvalModalPageComponentSchema = defineComponentSchema<ApprovalModalPageProps>({
  component: ApprovalModalPage,
  kind: "component",
  name: entityReactComponentNames.ApprovalModalPage
});

export const modalPageComponentSchemas = [
  alertModalPageComponentSchema,
  approvalModalPageComponentSchema
] as const;
