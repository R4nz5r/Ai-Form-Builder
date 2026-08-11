import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../../lib/utils.js";

/**
 * Right-side slide-in drawer. Used for response detail views and contextual info.
 */
export function Drawer({ open, onClose, title, subtitle, children, footer, width = "max-w-md" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "absolute right-0 top-0 flex h-full w-full flex-col border-l border-default bg-surface shadow-pop animate-slide-in-right",
          width
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-default p-5">
          <div className="min-w-0">
            {title && <h2 className="truncate text-base font-semibold text-fg">{title}</h2>}
            {subtitle && <p className="mt-0.5 truncate text-xs text-muted">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-fg"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-5">{children}</div>

        {footer && <div className="border-t border-default p-4">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
