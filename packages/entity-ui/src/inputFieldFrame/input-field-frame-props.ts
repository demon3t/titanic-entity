import type { ReactNode } from "react";

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
