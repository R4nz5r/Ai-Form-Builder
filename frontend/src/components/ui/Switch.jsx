import { cn } from "../../lib/utils.js";

export function Switch({ checked, onChange, label, description, className }) {
  return (
    <label className={cn("flex cursor-pointer items-center justify-between gap-3", className)}>
      {(label || description) && (
        <span className="flex flex-col">
          {label && <span className="text-sm font-medium text-fg">{label}</span>}
          {description && <span className="text-xs text-muted">{description}</span>}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange?.(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40",
          checked ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-600"
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </label>
  );
}
