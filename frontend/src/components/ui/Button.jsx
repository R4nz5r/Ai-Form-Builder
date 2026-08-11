import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils.js";

const VARIANTS = {
  primary:
    "bg-brand-gradient text-white shadow-soft hover:shadow-md hover:brightness-[1.06] active:scale-[.98]",
  secondary:
    "bg-surface text-fg border border-default hover:bg-surface-2 active:scale-[.98]",
  ghost: "text-muted hover:text-fg hover:bg-surface-2 active:scale-[.98]",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-soft active:scale-[.98]",
  outline:
    "border border-brand-300 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 active:scale-[.98]",
  subtle: "bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-900/25 dark:text-brand-200",
};

const SIZES = {
  sm: "h-8 px-3 text-sm gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-base gap-2 rounded-xl",
  icon: "h-10 w-10 rounded-xl",
  "icon-sm": "h-8 w-8 rounded-lg",
};

export const Button = forwardRef(function Button(
  { variant = "primary", size = "md", loading = false, className, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent",
        "disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap select-none",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});
