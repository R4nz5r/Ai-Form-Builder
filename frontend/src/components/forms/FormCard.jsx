import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  MoreVertical,
  Star,
  Pencil,
  Copy,
  BarChart3,
  Inbox,
  Link2,
  Archive,
  ArchiveRestore,
  Trash2,
  Globe,
  CircleDashed,
} from "lucide-react";
import { Card } from "../ui/Card.jsx";
import { Badge } from "../ui/Feedback.jsx";
import { Dropdown, MenuItem, MenuDivider } from "../ui/Dropdown.jsx";
import { cn, timeAgo, hexToRgba } from "../../lib/utils.js";
import { CardDecor } from "../dashboard/CardDecor.jsx";

// Curated, muted palette + motif — alternated by card position so the grid
// has visual rhythm even when many forms share the same brand color.
const STRIP = [
  { color: "#0c8b7c", decor: "e" },
  { color: "#4f7cc0", decor: "b" },
  { color: "#7e6cc0", decor: "a" },
  { color: "#c79235", decor: "c" },
  { color: "#c2706a", decor: "d" },
  { color: "#2f9e8a", decor: "a" },
  { color: "#5e7fb8", decor: "c" },
  { color: "#b06ca0", decor: "b" },
];

export function FormCard({ form, index = 0, onDuplicate, onDelete, onPatch }) {
  const navigate = useNavigate();
  const strip = STRIP[index % STRIP.length];
  const accent = strip.color;
  const published = form.status === "published";

  const copyLink = () => {
    const url = `${window.location.origin}/f/${form.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Public link copied");
  };

  return (
    <Card hover className="group flex flex-col">
      {/* Soft tinted strip with a single subtle corner motif */}
      <div
        className="relative h-24 w-full overflow-hidden rounded-t-2xl"
        style={{ background: `linear-gradient(135deg, ${hexToRgba(accent, 0.14)}, ${hexToRgba(accent, 0.05)})` }}
      >
        <div className="pointer-events-none absolute -bottom-2 right-0 opacity-55">
          <CardDecor variant={strip.decor} color={accent} className="h-28 w-28" />
        </div>
        <button
          onClick={() => onPatch(form._id, { isFavorite: !form.isFavorite })}
          className={cn(
            "absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg backdrop-blur transition",
            form.isFavorite ? "bg-white/90 text-amber-500" : "bg-black/15 text-white hover:bg-black/25"
          )}
          aria-label="Favorite"
        >
          <Star className={cn("h-4 w-4", form.isFavorite && "fill-current")} />
        </button>
        <div className="absolute left-3 top-3">
          <Badge variant={published ? "green" : "gray"}>
            {published ? <Globe className="h-3 w-3" /> : <CircleDashed className="h-3 w-3" />}
            {published ? "Published" : "Draft"}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <button
            onClick={() => navigate(`/builder/${form._id}`)}
            className="line-clamp-1 text-left text-base font-semibold text-fg hover:text-brand-600"
          >
            {form.title}
          </button>

          <Dropdown
            trigger={
              <button className="rounded-lg p-1 text-muted opacity-0 transition hover:bg-surface-2 group-hover:opacity-100">
                <MoreVertical className="h-4 w-4" />
              </button>
            }
          >
            <MenuItem icon={Pencil} onClick={() => navigate(`/builder/${form._id}`)}>
              Edit
            </MenuItem>
            <MenuItem icon={BarChart3} onClick={() => navigate(`/forms/${form._id}/analytics`)}>
              Analytics
            </MenuItem>
            <MenuItem icon={Inbox} onClick={() => navigate(`/forms/${form._id}/responses`)}>
              Responses
            </MenuItem>
            <MenuItem icon={Copy} onClick={() => onDuplicate(form._id)}>
              Duplicate
            </MenuItem>
            {published && (
              <MenuItem icon={Link2} onClick={copyLink}>
                Copy link
              </MenuItem>
            )}
            <MenuDivider />
            <MenuItem
              icon={form.isArchived ? ArchiveRestore : Archive}
              onClick={() => onPatch(form._id, { isArchived: !form.isArchived })}
            >
              {form.isArchived ? "Unarchive" : "Archive"}
            </MenuItem>
            <MenuItem icon={Trash2} danger onClick={() => onDelete(form)}>
              Delete
            </MenuItem>
          </Dropdown>
        </div>

        <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-muted">
          {form.description || "No description yet."}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-default pt-3 text-xs text-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Inbox className="h-3.5 w-3.5" /> {form.responseCount || 0}
            </span>
            <span className="flex items-center gap-1">
              <BarChart3 className="h-3.5 w-3.5" /> {form.views || 0}
            </span>
          </div>
          <span>{timeAgo(form.updatedAt)}</span>
        </div>
      </div>
    </Card>
  );
}
