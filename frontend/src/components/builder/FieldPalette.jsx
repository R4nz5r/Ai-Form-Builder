import { useDraggable } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import { FIELD_DEFS, FIELD_GROUPS } from "../../lib/fieldTypes.js";
import { cn } from "../../lib/utils.js";

function PaletteItem({ type, onAdd }) {
  const def = FIELD_DEFS[type];
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${type}`,
    data: { fromPalette: true, type },
  });

  return (
    <button
      ref={setNodeRef}
      onClick={() => onAdd(type)}
      {...listeners}
      {...attributes}
      className={cn(
        "group flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left text-sm transition-colors hover:bg-surface-2",
        isDragging && "opacity-40"
      )}
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-muted ring-1 ring-transparent transition-colors group-hover:bg-brand-50 group-hover:text-brand-600 group-hover:ring-brand-100 dark:group-hover:bg-brand-900/30 dark:group-hover:ring-brand-900/40">
        <def.icon className="h-4 w-4" strokeWidth={1.8} />
      </span>
      <span className="flex-1 font-medium text-fg">{def.label}</span>
      <GripVertical className="h-4 w-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}

export function FieldPalette({ onAdd }) {
  return (
    <div className="space-y-5">
      {FIELD_GROUPS.map((group) => (
        <div key={group.id}>
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted">
            {group.label}
          </p>
          <div className="space-y-1.5">
            {Object.keys(FIELD_DEFS)
              .filter((type) => FIELD_DEFS[type].group === group.id)
              .map((type) => (
                <PaletteItem key={type} type={type} onAdd={onAdd} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
