import { Titanic } from "@titanic-entity/entity-react";
import type { InputFieldFrameProps } from "./index";

export const InputFieldFrame = Titanic.define<InputFieldFrameProps>("Titanic.UI.InputFieldFrame", function InputFieldFrame({
  children,
  className = "",
  control,
  error,
  errorId,
  htmlFor: htmlForProp,
  id,
  required = false,
  title,
  validationError: validationErrorProp,
  visible = true
}: InputFieldFrameProps) {
  if (!visible) {
    return null;
  }

  const resolvedControl = control ?? children;
  const htmlFor = htmlForProp ?? id;
  const validationError = validationErrorProp ?? error;
  const resolvedErrorId = errorId ?? (validationError && htmlFor ? `${htmlFor}-error` : undefined);

  if (!title && !validationError) {
    return resolvedControl;
  }

  return (
    <div className={["titanic-input-field", className].filter(Boolean).join(" ")}>
      {title ? (
        <label className="titanic-input-field__label" htmlFor={htmlFor}>
          {title}
          {required ? <span className="titanic-input-field__required">*</span> : null}
        </label>
      ) : null}
      {resolvedControl}
      {validationError ? (
        <div className="titanic-input-field__error" id={resolvedErrorId}>
          {validationError}
        </div>
      ) : null}
    </div>
  );
});
