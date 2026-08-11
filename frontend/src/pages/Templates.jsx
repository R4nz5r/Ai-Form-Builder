import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowRight,
  Sparkles,
  MessageSquareText,
  Users,
  UtensilsCrossed,
  GraduationCap,
  Ticket,
  Briefcase,
  Headphones,
  Rocket,
  FileText,
  ListChecks,
} from "lucide-react";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "../lib/templates.js";
import { formApi } from "../services/index.js";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { TemplatePreview } from "../components/forms/TemplatePreview.jsx";
import { isStatic } from "../lib/fieldTypes.js";
import { cn } from "../lib/utils.js";

const ICONS = {
  feedback: MessageSquareText,
  employee: Users,
  restaurant: UtensilsCrossed,
  course: GraduationCap,
  conference: Ticket,
  job: Briefcase,
  support: Headphones,
  lead: Rocket,
};

export default function Templates() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("All");
  const [creatingId, setCreatingId] = useState(null);

  // Build each template once so we can preview its fields and count questions.
  const built = useMemo(
    () =>
      TEMPLATES.map((t) => {
        const def = t.build();
        return {
          ...t,
          questions: def.questions,
          questionCount: def.questions.filter((q) => !isStatic(q.type)).length,
        };
      }),
    []
  );

  const filtered =
    category === "All" ? built : built.filter((t) => t.category === category);

  const applyTemplate = async (template) => {
    setCreatingId(template.id);
    try {
      const form = await formApi.create(template.build());
      toast.success("Form created from template");
      navigate(`/builder/${form._id}`);
    } catch (err) {
      toast.error(err.message);
      setCreatingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-fg">Templates</h1>
          <p className="mt-1.5 text-sm text-muted">
            Premium, ready-to-use forms — pick one and make it yours in seconds.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/builder/new?ai=1")}>
          <Sparkles className="h-4 w-4" /> Generate with AI
        </Button>
      </div>

      {/* Category filter */}
      <div className="mt-7 flex flex-wrap gap-1.5">
        {TEMPLATE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              category === cat
                ? "bg-brand-600 text-white shadow-soft"
                : "border border-default text-muted hover:border-brand-300 hover:text-fg"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => {
          const Icon = ICONS[t.id] || FileText;
          return (
            <Card key={t.id} hover className="group flex flex-col overflow-hidden">
              <TemplatePreview questions={t.questions} />

              <div className="flex flex-1 flex-col border-t border-default p-5">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-fg">{t.name}</h3>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted">
                      {t.category}
                    </p>
                  </div>
                </div>

                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{t.description}</p>

                <div className="mt-4 flex items-center justify-between border-t border-default pt-4">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
                    <ListChecks className="h-3.5 w-3.5" />
                    {t.questionCount} questions
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="group-hover:bg-brand-gradient group-hover:text-white group-hover:border-transparent"
                    loading={creatingId === t.id}
                    onClick={() => applyTemplate(t)}
                  >
                    Use template <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
