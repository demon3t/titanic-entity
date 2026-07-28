import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import type { ReactNode } from "react";
import "./input-field-frame";

export interface InputFieldFrameProps {
  children?: ReactNode;
  className?: string;
  control?: ReactNode;
  error?: string | null;
  errorId?: string;
  htmlFor?: string;
  id?: string;
  required?: boolean;
  title?: string;
  validationError?: string | null;
  visible?: boolean;
}

export const InputFieldFrame = Titanic.getReactModule<DefinedEntityReactComponent<InputFieldFrameProps>>(
  "Titanic.UI.InputFieldFrame"
)!;

export * from "./base-input-field";
