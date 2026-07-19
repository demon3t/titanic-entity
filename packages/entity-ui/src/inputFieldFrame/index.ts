import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import "./input-field-frame";
import type { InputFieldFrameProps } from "./input-field-frame-props";

export type { InputFieldFrameProps } from "./input-field-frame-props";

export const InputFieldFrame = Titanic.getReactModule<DefinedEntityReactComponent<InputFieldFrameProps>>(
  "Titanic.UI.InputFieldFrame"
)!;

export * from "./base-input-field";
export * from "./icons";
export * from "./lcz";
