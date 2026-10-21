import type { SelectHTMLAttributes } from "react";
import { cx } from "../../lib/styles";
import { ChevronDownIcon } from "./icons";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Classes for the wrapper, e.g. width or flex sizing. */
  wrapperClassName?: string;
}

export function Select({ wrapperClassName, className, ...props }: SelectProps) {
  return (
    <span className={cx("relative block", wrapperClassName)}>
      <select
        className={cx(
          "h-[42px] w-full appearance-none rounded-ctl border border-line bg-surface pr-9 pl-3.5",
          "focus:border-brand focus:outline-none focus:ring-3 focus:ring-brand/15",
          className,
        )}
        {...props}
      />
      <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-ink-soft" />
    </span>
  );
}
