import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Sparkles,
  LayoutTemplate,
  FolderOpen,
  Globe,
  FileEdit,
  Inbox,
  Eye,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";
import { formApi } from "../services/index.js";
import { Button } from "../components/ui/Button.jsx";
import { StatCard } from "../components/ui/Card.jsx";
import { FormsBrowser } from "../components/forms/FormsBrowser.jsx";
import { NavCard } from "../components/dashboard/NavCard.jsx";

const ACCENT = {
  gold: "#bfa23a",
  coral: "#c2706a",
  purple: "#7e6cc0",
  blue: "#6f86c9",
  teal: "#4f9a8e",
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [allForms, setAllForms] = useState([]);
  const listRef = useRef(null);

  // Unfiltered snapshot powering the hero stats and card counts.
  const loadAll = () => formApi.list().then(setAllForms).catch(() => {});
  useEffect(() => {
    loadAll();
  }, []);

  const counts = useMemo(() => {
    const active = allForms.filter((f) => !f.isArchived);
    return {
      total: active.length,
      published: active.filter((f) => f.status === "published").length,
      draft: active.filter((f) => f.status === "draft").length,
      responses: allForms.reduce((s, f) => s + (f.responseCount || 0), 0),
      views: allForms.reduce((s, f) => s + (f.views || 0), 0),
    };
  }, [allForms]);

  const conversion = counts.views ? Math.round((counts.responses / counts.views) * 100) : 0;

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  }, []);

  const jumpTo = (nextFilter) => {
    setFilter(nextFilter);
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      {/* Greeting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-fg sm:text-4xl">
          {greeting}, {user?.name?.split(" ")[0]}!
        </h1>
        <Button onClick={() => navigate("/builder/new")} className="self-start sm:self-auto">
          <Plus className="h-4 w-4" /> New form
        </Button>
      </div>

      {/* Decorative card grid */}
      <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <NavCard hero icon={FolderOpen} title="Create a form" description="Start from a blank canvas and design it your way." onClick={() => navigate("/builder/new")} />
        <NavCard icon={Sparkles} accent={ACCENT.purple} decor="b" title="AI Generator" description="Describe what you need — AI drafts the whole form." onClick={() => navigate("/builder/new?ai=1")} />
        <NavCard icon={LayoutTemplate} accent={ACCENT.gold} decor="c" title="Templates" description="Start fast from a professionally designed gallery." onClick={() => navigate("/templates")} />
        <NavCard icon={FolderOpen} accent={ACCENT.coral} decor="a" title="All forms" description="Browse and manage everything you've created." badge={`${counts.total} total`} onClick={() => jumpTo("all")} />
        <NavCard icon={Globe} accent={ACCENT.blue} decor="e" title="Published" description="Forms that are live and collecting responses." badge={`${counts.published} live`} onClick={() => jumpTo("published")} />
        <NavCard icon={FileEdit} accent={ACCENT.teal} decor="d" title="Drafts" description="Work in progress, not yet shared publicly." badge={`${counts.draft} drafts`} onClick={() => jumpTo("draft")} />
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Inbox} label="Responses" value={counts.responses} accent="green" />
        <StatCard icon={Eye} label="Total views" value={counts.views} accent="amber" />
        <StatCard icon={TrendingUp} label="Conversion" value={`${conversion}%`} accent="pink" />
        <StatCard icon={CheckCircle2} label="Published" value={counts.published} sublabel={`${counts.total} total forms`} />
      </div>

      {/* Forms list */}
      <div className="mt-10">
        <FormsBrowser ref={listRef} filter={filter} onFilterChange={setFilter} onMutate={loadAll} />
      </div>
    </div>
  );
}
