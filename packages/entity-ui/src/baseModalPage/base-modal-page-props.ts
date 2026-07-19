import type { ReactNode } from "react";

export interface BaseModalPageClassNames {
  backdrop?: string;
  card?: string;
  closeButton?: string;
  closeIcon?: string;
  error?: string;
  footer?: string;
  header?: string;
  root?: string;
  title?: string;
  warning?: string;
}

export interface BaseModalPageProps {
  ariaLabel?: string;
  children?: ReactNode;
  classNames?: BaseModalPageClassNames;
  closeLabel?: string;
  error?: ReactNode;
  footer?: ReactNode;
  title?: ReactNode;
  toolbar?: ReactNode;
  validationWarning?: ReactNode;
  onClose?: () => void;
}
