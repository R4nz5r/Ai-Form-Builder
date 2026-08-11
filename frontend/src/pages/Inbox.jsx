import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Inbox as InboxIcon, Search, Calendar, Clock, Monitor, ExternalLink } from "lucide-react";
import { insightsApi } from "../services/index.js";
import { useDebounce } from "../hooks/useDebounce.js";
import { PageHeader } from "./Insights.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Avatar } from "../components/ui/Avatar.jsx";
import { Badge, Skeleton, EmptyState } from "../components/ui/Feedback.jsx";
import { Drawer } from "../components/ui/Drawer.jsx";
import { Button } from "../components/ui/Button.jsx";
import { timeAgo, formatDate, formatDuration } from "../lib/utils.js";

export default function Inbox() {
  const navigate = useNavigate();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 300);
  const [formFilter, setFormFilter] = useState("all");
  const [active, setActive] = useState(null);

  useEffect(() => {
    insightsApi
      .inbox({ search })
      .then((d) => setResponses(d.responses))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [search]);

  const forms = useMemo(() => {
    const map = new Map();
    responses.forEach((r) => map.set(r.formId, { id: r.formId, title: r.formTitle, color: r.formColor }));
    return [...map.values()];
  }, [responses]);

  const shown = useMemo(
    () => (formFilter === "all" ? responses : responses.filter((r) => r.formId === formFilter)),
    [responses, formFilter]
  );

  const primaryAnswer = (r) => {
    const named = r.answers.find((a) => a.type === "short_text" && a.value);
    const emailed = r.answers.find((a) => a.type === "email" && a.value);
    const name = named?.value || "Anonymous";
    const snippet = r.answers
      .filter((a) => !["short_text", "email"].includes(a.type))
      .map((a) => (Array.isArray(a.value) ? a.value.join(", ") : a.value))
      .filter(Boolean)
      .join(" · ");
    return { name: String(name), email: emailed?.value || "", snippet: String(snippet).slice(0, 90) };
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <PageHeader icon={InboxIcon} title="Inbox" subtitle="Recent responses across all your forms" />

      {/* Toolbar */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          <FilterChip active={formFilter === "all"} onClick={() => setFormFilter("all")}>
            All forms
          </FilterChip>
          {forms.slice(0, 6).map((f) => (
            <FilterChip key={f.id} active={formFilter === f.id} onClick={() => setFormFilter(f.id)} color={f.color}>
              {f.title}
            </FilterChip>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search responses…" className="h-9 pl-9" />
        </div>
      </div>

      {/* Feed */}
      <div className="mt-4 space-y-2.5">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
        ) : shown.length === 0 ? (
          <EmptyState
            icon={InboxIcon}
            title={searchInput ? "No matching responses" : "Your inbox is empty"}
            description={searchInput ? "Try a different search term." : "Responses to your forms will appear here as they come in."}
          />
        ) : (
          shown.map((r) => {
            const { name, email, snippet } = primaryAnswer(r);
            return (
              <button
                key={r._id}
                onClick={() => setActive(r)}
                className="group flex w-full items-center gap-4 rounded-2xl border border-default bg-surface p-4 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card"
              >
                <Avatar name={name} color={r.formColor} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-fg">{name}</p>
                    <Badge variant="brand">{r.formTitle}</Badge>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted">{email || snippet || "No answers"}</p>
                </div>
                <span className="hidden whitespace-nowrap text-xs text-muted sm:block">{timeAgo(r.submittedAt)}</span>
              </button>
            );
          })
        )}
      </div>

      {/* Detail drawer */}
      <Drawer
        open={!!active}
        onClose={() => setActive(null)}
        title={active ? primaryAnswer(active).name : "Response"}
        subtitle={active?.formTitle}
        footer={
          active && (
            <Button variant="secondary" size="sm" className="w-full" onClick={() => navigate(`/forms/${active.formId}/responses`)}>
              <ExternalLink className="h-4 w-4" /> Open in form
            </Button>
          )
        }
      >
        {active && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <Meta icon={Calendar} label="Submitted" value={formatDate(active.submittedAt)} />
              <Meta icon={Clock} label="Completion" value={formatDuration(active.completionTime)} />
            </div>
            {active.meta?.userAgent && <Meta icon={Monitor} label="Device" value={device(active.meta.userAgent)} wide />}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Answers</p>
              {active.answers.map((a, i) => (
                <div key={i} className="rounded-xl border border-default bg-surface-2/50 p-3.5">
                  <p className="text-xs font-medium text-muted">{a.label}</p>
                  <p className="mt-1 text-sm text-fg">{Array.isArray(a.value) ? a.value.join(", ") : String(a.value)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

function FilterChip({ active, onClick, color, children }) {
  return (
    <button
      onClick={onClick}
      className={
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors " +
        (active ? "bg-brand-600 text-white shadow-soft" : "border border-default text-muted hover:text-fg")
      }
    >
      {color && <span className="h-2 w-2 rounded-full" style={{ background: active ? "#fff" : color }} />}
      <span className="max-w-[10rem] truncate">{children}</span>
    </button>
  );
}

function Meta({ icon: Icon, label, value, wide }) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <div className="flex items-center gap-2.5 rounded-xl border border-default bg-surface-2/50 p-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted">{label}</p>
          <p className="truncate text-sm font-medium text-fg">{value}</p>
        </div>
      </div>
    </div>
  );
}

function device(ua) {
  const b = /Edg/.test(ua) ? "Edge" : /Chrome/.test(ua) ? "Chrome" : /Firefox/.test(ua) ? "Firefox" : /Safari/.test(ua) ? "Safari" : "Browser";
  const os = /Windows/.test(ua) ? "Windows" : /Mac/.test(ua) ? "macOS" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Linux/.test(ua) ? "Linux" : "";
  return [b, os].filter(Boolean).join(" · ");
}
