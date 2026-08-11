import { forwardRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Sparkles, Search, FolderOpen } from "lucide-react";
import { useForms } from "../../hooks/useForms.js";
import { useDebounce } from "../../hooks/useDebounce.js";
import { Button } from "../ui/Button.jsx";
import { Input } from "../ui/Input.jsx";
import { Skeleton, EmptyState } from "../ui/Feedback.jsx";
import { ConfirmModal } from "../ui/Modal.jsx";
import { FormCard } from "./FormCard.jsx";
import { cn } from "../../lib/utils.js";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "published", label: "Published" },
  { id: "draft", label: "Drafts" },
  { id: "favorites", label: "Favorites" },
  { id: "archived", label: "Archived" },
];

/**
 * Self-contained forms list: filter tabs, search, responsive card grid and a
 * delete confirmation. `filter`/`onFilterChange` make the filter optionally
 * controlled (used by the dashboard category cards). `onMutate` fires after any
 * create/delete/favorite change so a parent can refresh aggregate counts.
 */
export const FormsBrowser = forwardRef(function FormsBrowser(
  { title = "Your forms", filter: filterProp, onFilterChange, onMutate },
  ref
) {
  const navigate = useNavigate();
  const [internalFilter, setInternalFilter] = useState("all");
  const filter = filterProp ?? internalFilter;
  const setFilter = onFilterChange ?? setInternalFilter;

  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 300);
  const [toDelete, setToDelete] = useState(null);

  const { forms, loading, remove, duplicate, patch } = useForms({ search, filter });

  const handleDelete = async (id) => {
    await remove(id);
    onMutate?.();
  };
  const handleDuplicate = async (id) => {
    await duplicate(id);
    onMutate?.();
  };
  const handlePatch = (id, data) => {
    patch(id, data);
    onMutate?.();
  };

  return (
    <div ref={ref} className="scroll-mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {title && <h2 className="text-lg font-semibold text-fg">{title}</h2>}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  filter === f.id ? "bg-brand-600 text-white shadow-soft" : "text-muted hover:bg-surface-2 hover:text-fg"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search forms…" className="h-9 pl-9" />
          </div>
        </div>
      </div>

      <div className="mt-5">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-2xl" />
            ))}
          </div>
        ) : forms.length === 0 ? (
          <EmptyState
            icon={searchInput ? Search : FolderOpen}
            title={searchInput ? "No forms match your search" : "No forms here yet"}
            description={
              searchInput ? "Try a different keyword or clear the filter." : "Create your first form from scratch or let AI draft one for you."
            }
            action={
              !searchInput && (
                <div className="flex gap-2">
                  <Button onClick={() => navigate("/builder/new")}>
                    <Plus className="h-4 w-4" /> Blank form
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/builder/new?ai=1")}>
                    <Sparkles className="h-4 w-4" /> Use AI
                  </Button>
                </div>
              )
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((form, i) => (
              <FormCard key={form._id} form={form} index={i} onDuplicate={handleDuplicate} onDelete={setToDelete} onPatch={handlePatch} />
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          handleDelete(toDelete._id);
          setToDelete(null);
        }}
        title="Delete this form?"
        description={`"${toDelete?.title}" and all its responses will be permanently removed. This cannot be undone.`}
        confirmText="Delete form"
        danger
      />
    </div>
  );
});
