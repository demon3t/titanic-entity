import type { ReactNode } from "react";

export interface DateTimePopoverProps {
  ariaLabelledBy: string;
  children: ReactNode;
  className?: string;
}

export function DateTimePopover({
  ariaLabelledBy,
  children,
  className = ""
}: DateTimePopoverProps) {
  const popoverClassName = ["titanic-date-time-popover", className].filter(Boolean).join(" ");

  return (
    <div className={popoverClassName} role="dialog" aria-modal="false" aria-labelledby={ariaLabelledBy}>
      {children}
    </div>
  );
}
