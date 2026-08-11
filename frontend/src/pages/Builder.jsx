import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Eye,
  Share2,
  Globe,
  Sparkles,
  Layers,
  Settings2,
  Check,
  Loader2,
  Inbox,
  BarChart3,
  FileQuestion,
} from "lucide-react";
import { formApi } from "../services/index.js";
import { useHistoryState } from "../hooks/useHistoryState.js";
import { useDebounce } from "../hooks/useDebounce.js";
import { createField, FIELD_DEFS } from "../lib/fieldTypes.js";
import { cn } from "../lib/utils.js";
import { Logo } from "../components/Logo.jsx";
import { Button } from "../components/ui/Button.jsx";
import { PageLoader, EmptyState } from "../components/ui/Feedback.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { FieldPalette } from "../components/builder/FieldPalette.jsx";
import { SortableField } from "../components/builder/SortableField.jsx";
import { SettingsPanel } from "../components/builder/SettingsPanel.jsx";
import { AIGenerateModal } from "../components/builder/AIGenerateModal.jsx";
import { ShareModal } from "../components/builder/ShareModal.jsx";
import { FormView } from "../components/public/FormView.jsx";

export default function Builder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { state: form, set: setForm, reset, undo, redo } = useHistoryState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("build"); // build | design
  const [expandedId, setExpandedId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [saveState, setSaveState] = useState("saved"); // saved | saving | dirty
  const [preview, setPreview] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [activeDrag, setActiveDrag] = useState(null); // drives the DragOverlay

  const formIdRef = useRef(null);
  const skipSaveRef = useRef(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // ----- Load or create -----
  useEffect(() => {
    let active = true;
    skipSaveRef.current = true;

    async function init() {
      setLoading(true);
      try {
        if (id === "new") {
          const created = await formApi.create({ title: "Untitled form" });
          if (!active) return;
          formIdRef.current = created._id;
          reset(created);
          // Replace URL so refresh/back works, preserving ?ai flag.
          navigate(`/builder/${created._id}${searchParams.get("ai") ? "?ai=1" : ""}`, { replace: true });
        } else {
          const loaded = await formApi.get(id);
          if (!active) return;
          formIdRef.current = loaded._id;
          reset(loaded);
        }
        if (searchParams.get("ai")) setAiOpen(true);
      } catch (err) {
        toast.error(err.message);
        navigate("/dashboard");
      } finally {
        if (active) setLoading(false);
      }
    }
    init();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ----- Autosave (debounced) -----
  const debouncedForm = useDebounce(form, 800);
  useEffect(() => {
    if (!debouncedForm || !formIdRef.current) return;
    if (skipSaveRef.current) {
      skipSaveRef.current = false;
      return;
    }
    setSaveState("saving");
    formApi
      .update(formIdRef.current, {
        title: debouncedForm.title,
        description: debouncedForm.description,
        theme: debouncedForm.theme,
        questions: debouncedForm.questions,
        settings: debouncedForm.settings,
      })
      .then(() => setSaveState("saved"))
      .catch((err) => {
        setSaveState("dirty");
        toast.error(err.message);
      });
  }, [debouncedForm]);

  const markDirty = useCallback(() => setSaveState("dirty"), []);

  // ----- Field operations -----
  const addField = useCallback(
    (type, index) => {
      const field = createField(type);
      setForm((prev) => {
        const questions = [...prev.questions];
        questions.splice(index ?? questions.length, 0, field);
        return { ...prev, questions };
      });
      setSelectedId(field.id);
      setExpandedId(field.id);
      markDirty();
    },
    [setForm, markDirty]
  );

  const updateField = useCallback(
    (updated) => {
      setForm((prev) => ({
        ...prev,
        questions: prev.questions.map((q) => (q.id === updated.id ? updated : q)),
      }));
      markDirty();
    },
    [setForm, markDirty]
  );

  const duplicateField = useCallback(
    (fieldId) => {
      setForm((prev) => {
        const idx = prev.questions.findIndex((q) => q.id === fieldId);
        if (idx === -1) return prev;
        const copy = { ...createField(prev.questions[idx].type), ...prev.questions[idx], id: createField("short_text").id };
        const questions = [...prev.questions];
        questions.splice(idx + 1, 0, copy);
        return { ...prev, questions };
      });
      markDirty();
    },
    [setForm, markDirty]
  );

  const deleteField = useCallback(
    (fieldId) => {
      setForm((prev) => ({ ...prev, questions: prev.questions.filter((q) => q.id !== fieldId) }));
      markDirty();
    },
    [setForm, markDirty]
  );

  // ----- Drag & drop -----
  const handleDragStart = ({ active }) => {
    if (active.data.current?.fromPalette) {
      setActiveDrag({ fromPalette: true, type: active.data.current.type });
    } else {
      const field = form.questions.find((q) => q.id === active.id);
      setActiveDrag(field ? { field } : null);
    }
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveDrag(null);
    if (!over) return;
    const fromPalette = active.data.current?.fromPalette;

    if (fromPalette) {
      const type = active.data.current.type;
      const overIndex =
        over.id === "canvas"
          ? form.questions.length
          : form.questions.findIndex((q) => q.id === over.id);
      addField(type, overIndex === -1 ? form.questions.length : overIndex);
      return;
    }

    if (active.id !== over.id) {
      setForm((prev) => {
        const oldIndex = prev.questions.findIndex((q) => q.id === active.id);
        const newIndex = prev.questions.findIndex((q) => q.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        return { ...prev, questions: arrayMove(prev.questions, oldIndex, newIndex) };
      });
      markDirty();
    }
  };

  // ----- Keyboard shortcuts -----
  useEffect(() => {
    const onKey = (e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        markDirty();
      } else if (mod && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
        markDirty();
      } else if (mod && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setPreview(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [undo, redo, markDirty]);

  const togglePublish = async () => {
    setPublishing(true);
    try {
      const updated = await formApi.publish(formIdRef.current, form.status !== "published");
      setForm((prev) => ({ ...prev, status: updated.status, slug: updated.slug }));
      skipSaveRef.current = true;
      toast.success(updated.status === "published" ? "Form published 🚀" : "Form unpublished");
      if (updated.status === "published") setShareOpen(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPublishing(false);
    }
  };

  if (loading || !form) return <PageLoader label="Loading builder…" />;

  const published = form.status === "published";

  return (
    <div className="flex h-screen flex-col bg-app">
      {/* Top bar */}
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-default bg-surface px-3 lg:px-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Logo showText={false} size={30} />

        <input
          value={form.title}
          onChange={(e) => {
            setForm((prev) => ({ ...prev, title: e.target.value }));
            markDirty();
          }}
          className="min-w-0 max-w-xs flex-1 truncate rounded-lg bg-transparent px-2 py-1 text-sm font-semibold text-fg outline-none hover:bg-surface-2 focus:bg-surface-2"
        />

        <SaveIndicator state={saveState} />

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => { undo(); markDirty(); }} aria-label="Undo" title="Undo (⌘Z)">
            <Undo2 className="h-4.5 w-4.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => { redo(); markDirty(); }} aria-label="Redo" title="Redo (⌘⇧Z)">
            <Redo2 className="h-4.5 w-4.5" />
          </Button>
          <div className="mx-1 hidden h-6 w-px bg-[var(--border)] sm:block" />
          <Button variant="ghost" size="icon" onClick={() => navigate(`/forms/${form._id}/responses`)} aria-label="Responses" title="Responses">
            <Inbox className="h-4.5 w-4.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate(`/forms/${form._id}/analytics`)} aria-label="Analytics" title="Analytics">
            <BarChart3 className="h-4.5 w-4.5" />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setPreview(true)}>
            <Eye className="h-4 w-4" /> <span className="hidden sm:inline">Preview</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setShareOpen(true)} disabled={!published}>
            <Share2 className="h-4 w-4" /> <span className="hidden sm:inline">Share</span>
          </Button>
          <Button size="sm" variant={published ? "outline" : "primary"} loading={publishing} onClick={togglePublish}>
            <Globe className="h-4 w-4" /> {published ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveDrag(null)}
      >
        <div className="flex min-h-0 flex-1">
          {/* Left: palette */}
          <aside className="hidden w-64 shrink-0 overflow-y-auto scrollbar-thin border-r border-default bg-surface p-4 lg:block">
            <p className="mb-3 text-sm font-semibold text-fg">Add fields</p>
            <FieldPalette onAdd={(type) => addField(type)} />
            <Button variant="subtle" className="mt-4 w-full" onClick={() => setAiOpen(true)}>
              <Sparkles className="h-4 w-4" /> Generate with AI
            </Button>
          </aside>

          {/* Center: canvas */}
          <main className="min-w-0 flex-1 overflow-y-auto scrollbar-thin">
            <div className="mx-auto max-w-2xl px-4 py-8">
              {/* Mobile tab switch */}
              <div className="mb-4 flex gap-1 rounded-xl bg-surface-2 p-1 lg:hidden">
                <TabButton active={tab === "build"} onClick={() => setTab("build")} icon={Layers}>Build</TabButton>
                <TabButton active={tab === "design"} onClick={() => setTab("design")} icon={Settings2}>Design</TabButton>
              </div>

              {(tab === "build" || window.innerWidth >= 1024) && (
                <div className={cn(tab === "design" && "hidden lg:block")}>
                  <div className="mb-5 rounded-2xl border border-default bg-surface p-5">
                    <input
                      value={form.title}
                      onChange={(e) => { setForm((p) => ({ ...p, title: e.target.value })); markDirty(); }}
                      placeholder="Form title"
                      className="w-full bg-transparent text-2xl font-bold tracking-tight text-fg outline-none placeholder:text-muted"
                    />
                    <input
                      value={form.description}
                      onChange={(e) => { setForm((p) => ({ ...p, description: e.target.value })); markDirty(); }}
                      placeholder="Add a description (optional)"
                      className="mt-1.5 w-full bg-transparent text-sm text-muted outline-none"
                    />
                  </div>

                  <CanvasDropArea hasFields={form.questions.length > 0}>
                    <SortableContext items={form.questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-3">
                        {form.questions.map((q, i) => (
                          <SortableField
                            key={q.id}
                            field={q}
                            index={i}
                            expanded={expandedId === q.id}
                            selected={selectedId === q.id}
                            accent={form.settings.primaryColor}
                            onToggle={() => setExpandedId(expandedId === q.id ? null : q.id)}
                            onSelect={() => setSelectedId(q.id)}
                            onChange={updateField}
                            onDuplicate={() => duplicateField(q.id)}
                            onDelete={() => deleteField(q.id)}
                          />
                        ))}
                      </div>
                    </SortableContext>

                    {form.questions.length === 0 && (
                      <EmptyState
                        icon={FileQuestion}
                        title="Your form is empty"
                        description="Add fields from the left, drag them here, or generate a form with AI."
                        action={
                          <div className="flex gap-2">
                            <Button onClick={() => addField("short_text")}>Add a field</Button>
                            <Button variant="outline" onClick={() => setAiOpen(true)}>
                              <Sparkles className="h-4 w-4" /> Use AI
                            </Button>
                          </div>
                        }
                      />
                    )}
                  </CanvasDropArea>
                </div>
              )}

              {tab === "design" && (
                <div className="lg:hidden">
                  <SettingsPanel form={form} onChange={(patch) => { setForm((p) => ({ ...p, ...patch })); markDirty(); }} />
                </div>
              )}
            </div>
          </main>

          {/* Right: settings */}
          <aside className="hidden w-80 shrink-0 overflow-y-auto scrollbar-thin border-l border-default bg-surface p-5 xl:block">
            <SettingsPanel form={form} onChange={(patch) => { setForm((p) => ({ ...p, ...patch })); markDirty(); }} />
          </aside>
        </div>

        {/* Floating preview that follows the cursor while dragging */}
        <DragOverlay dropAnimation={{ duration: 180 }}>
          {activeDrag && <DragPreview drag={activeDrag} />}
        </DragOverlay>
      </DndContext>

      {/* Preview */}
      <Modal open={preview} onClose={() => setPreview(false)} size="xl" title="Preview">
        <div className="-mx-5 -mb-5 max-h-[75vh] overflow-y-auto scrollbar-thin rounded-b-2xl">
          <FormView form={form} preview />
        </div>
      </Modal>

      <AIGenerateModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        onGenerated={(generated) => {
          setForm((prev) => ({
            ...prev,
            title: generated.title || prev.title,
            description: generated.description || prev.description,
            theme: generated.theme || prev.theme,
            questions: generated.questions,
          }));
          markDirty();
        }}
      />

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} form={form} />
    </div>
  );
}

/** Floating card shown under the cursor while dragging (palette add or reorder). */
function DragPreview({ drag }) {
  const type = drag.fromPalette ? drag.type : drag.field?.type;
  const def = FIELD_DEFS[type];
  if (!def) return null;
  const label = drag.fromPalette ? def.label : drag.field.label;

  return (
    <div className="flex w-64 cursor-grabbing items-center gap-2.5 rounded-xl border border-brand-300 bg-surface px-3 py-2.5 shadow-pop ring-2 ring-brand-500/15">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
        <def.icon className="h-4 w-4" strokeWidth={1.8} />
      </span>
      <span className="flex-1 truncate text-sm font-semibold text-fg">{label}</span>
      {drag.fromPalette && (
        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
          New
        </span>
      )}
    </div>
  );
}

function CanvasDropArea({ hasFields, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas" });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-2xl transition-colors",
        isOver && "ring-2 ring-brand-400 ring-offset-4 ring-offset-app",
        !hasFields && "border-2 border-dashed border-default p-2"
      )}
    >
      {children}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition",
        active ? "bg-surface text-fg shadow-soft" : "text-muted"
      )}
    >
      <Icon className="h-4 w-4" /> {children}
    </button>
  );
}

function SaveIndicator({ state }) {
  const map = {
    saved: { icon: Check, text: "Saved", cls: "text-emerald-600" },
    saving: { icon: Loader2, text: "Saving…", cls: "text-muted", spin: true },
    dirty: { icon: Loader2, text: "Unsaved", cls: "text-amber-600" },
  };
  const { icon: Icon, text, cls, spin } = map[state];
  return (
    <span className={cn("hidden items-center gap-1.5 text-xs font-medium sm:flex", cls)}>
      <Icon className={cn("h-3.5 w-3.5", spin && "animate-spin")} /> {text}
    </span>
  );
}
