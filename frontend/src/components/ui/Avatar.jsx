import { initials } from "../../lib/utils.js";
import { cn } from "../../lib/utils.js";

export function Avatar({ name = "", color = "#6366f1", size = "md", className }) {
  const sizes = { sm: "h-7 w-7 text-xs", md: "h-9 w-9 text-sm", lg: "h-12 w-12 text-base" };
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold text-white",
        sizes[size],
        className
      )}
      style={{ backgroundColor: color }}
    >
      {initials(name) || "?"}
    </span>
  );
}
