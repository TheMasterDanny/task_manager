import type { ButtonHTMLAttributes } from "react";
import { cx } from "../../lib/styles";

const VARIANTS = {
  primary: "bg-ink text-white hover:bg-brand",
  ghost: "text-ink-soft hover:bg-bg hover:text-ink",
  danger: "mr-auto text-urgent hover:bg-high-bg",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANTS;
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={cx(
        "inline-flex h-11 items-center gap-2 rounded-full px-[18px] font-semibold",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
