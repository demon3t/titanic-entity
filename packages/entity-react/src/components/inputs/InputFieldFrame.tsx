import type { ReactNode } from "react";

export interface InputFieldFrameProps {
  control: ReactNode;
  errorId?: string;
  htmlFor?: string;
  required?: boolean;
  title?: string;
  validationError?: string | null;
}

export function InputFieldFrame({
  control,
  errorId,
  htmlFor,
  required = false,
  title,
  validationError
}: InputFieldFrameProps) {
  if (!title && !validationError) {
    return <>{control}</>;
  }

  return (
    <div className="titanic-input-field">
      {title ? (
        <label className="titanic-input-field__label" htmlFor={htmlFor}>
          {title}
          {required ? <span className="titanic-input-field__required">*</span> : null}
        </label>
      ) : null}
      {control}
      {validationError ? (
        <div className="titanic-input-field__error" id={errorId}>
          {validationError}
        </div>
      ) : null}
    </div>
  );
}
