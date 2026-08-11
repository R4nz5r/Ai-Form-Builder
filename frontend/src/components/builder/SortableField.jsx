import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Copy, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { FIELD_DEFS } from "../../lib/fieldTypes.js";
import { FieldRenderer } from "../public/FieldRenderer.jsx";
import { FieldSettings } from "./FieldSettings.jsx";
import { Button } from "../ui/Button.jsx";
import { cn } from "../../lib/utils.js";

export function SortableField({
  field,
  expanded,
  selected,
  accent,
  onToggle,
  onSelect,
  onChange,
  onDuplicate,
  onDelete,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });
  const def = FIELD_DEFS[field.type];

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        "group rounded-2xl border bg-surface transition-all duration-150",
        selected
          ? "border-brand-400 ring-2 ring-brand-500/15 shadow-card"
          : "border-default hover:border-brand-200 hover:shadow-soft",
        isDragging && "opacity-60 shadow-pop"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 rounded-t-2xl px-2.5 py-2 transition-colors",
          selected && "bg-brand-50/40 dark:bg-brand-900/15"
        )}
      >
        <button
          {...attributes}
          {...listeners}
          className="grid h-7 w-7 cursor-grab touch-none place-items-center rounded-lg text-muted/70 transition-colors hover:bg-surface-2 hover:text-fg active:cursor-grabbing"
          aria-label="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span
          className={cn(
            "grid h-7 w-7 place-items-center rounded-lg transition-colors",
            selected ? "bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300" : "bg-surface-2 text-muted"
          )}
        >
          <def.icon className="h-4 w-4" strokeWidth={1.8} />
        </span>
        <span className="flex-1 truncate text-sm font-semibold text-fg">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </span>
        <span className="hidden rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted sm:block">
          {def.label}
        </span>

        <div className="flex items-center opacity-0 transition group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            aria-label="Duplicate"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label="Delete"
          >
            <Trash2 className="h-3.5 w-3.5 text-red-500" />
          </Button>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="text-muted hover:text-fg"
          aria-label="Toggle settings"
        >
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {/* Live preview row */}
      <div className="border-t border-default px-4 py-3">
        <div className="pointer-events-none text-fg">
          <FieldRenderer field={field} value={undefined} onChange={() => {}} accent={accent} disabled />
        </div>
      </div>

      {/* Inline settings */}
      {expanded && (
        <div className="border-t border-default bg-surface-2/50 p-4" onClick={(e) => e.stopPropagation()}>
          <FieldSettings field={field} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
