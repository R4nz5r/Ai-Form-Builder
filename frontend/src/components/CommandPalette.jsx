import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Search,
  LayoutDashboard,
  Plus,
  Sparkles,
  LayoutTemplate,
  Moon,
  Sun,
  LogOut,
  FileText,
  CornerDownLeft,
  Inbox,
  Settings,
} from "lucide-react";
import { cn } from "../lib/utils.js";
import { useTheme } from "../hooks/useTheme.js";
import { useAuth } from "../hooks/useAuth.js";
import { formApi } from "../services/index.js";

/** Global Ctrl/Cmd+K command palette with actions, navigation and form search. */
export function CommandPalette({ open, setOpen }) {
  const navigate = useNavigate();
  const { toggle, isDark } = useTheme();
  const { logout } = useAuth();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [forms, setForms] = useState([]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      formApi.list().then(setForms).catch(() => {});
    }
  }, [open]);

  const actions = useMemo(
    () => [
      { id: "dashboard", label: "Go to Dashboard", icon: LayoutDashboard, run: () => navigate("/dashboard") },
      { id: "new", label: "Create blank form", icon: Plus, run: () => navigate("/builder/new") },
      { id: "ai", label: "Generate form with AI", icon: Sparkles, run: () => navigate("/builder/new?ai=1") },
      { id: "insights", label: "View Insights", icon: Sparkles, run: () => navigate("/insights") },
      { id: "inbox", label: "Open Inbox", icon: Inbox, run: () => navigate("/inbox") },
      { id: "templates", label: "Browse templates", icon: LayoutTemplate, run: () => navigate("/templates") },
      { id: "settings", label: "Open Settings", icon: Settings, run: () => navigate("/settings") },
      { id: "theme", label: `Switch to ${isDark ? "light" : "dark"} mode`, icon: isDark ? Sun : Moon, run: toggle },
      { id: "logout", label: "Log out", icon: LogOut, run: logout },
    ],
    [navigate, toggle, isDark, logout]
  );

  const items = useMemo(() => {
    const q = query.toLowerCase().trim();
    const matchedActions = actions
      .filter((a) => !q || a.label.toLowerCase().includes(q))
      .map((a) => ({ ...a, kind: "action" }));
    const matchedForms = forms
      .filter((f) => !q || f.title.toLowerCase().includes(q))
      .slice(0, 6)
      .map((f) => ({
        id: f._id,
        label: f.title,
        icon: FileText,
        kind: "form",
        run: () => navigate(`/builder/${f._id}`),
      }));
    return [...matchedActions, ...matchedForms];
  }, [query, actions, forms, navigate]);

  useEffect(() => {
    if (active >= items.length) setActive(0);
  }, [items.length, active]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => (a + 1) % items.length);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => (a - 1 + items.length) % items.length);
      }
      if (e.key === "Enter" && items[active]) {
        items[active].run();
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, items, active, setOpen]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-default bg-surface shadow-pop animate-scale-in">
        <div className="flex items-center gap-3 border-b border-default px-4">
          <Search className="h-4.5 w-4.5 text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search forms or run a command…"
            className="h-14 w-full bg-transparent text-sm text-fg outline-none placeholder:text-muted"
          />
          <kbd className="hidden rounded-md border border-default bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-muted sm:block">
            ESC
          </kbd>
        </div>
        <div className="max-h-80 overflow-y-auto scrollbar-thin p-2">
          {items.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-muted">No results found</p>
          )}
          {items.map((item, i) => (
            <button
              key={`${item.kind}-${item.id}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => {
                item.run();
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                active === i ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200" : "text-fg"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0 opacity-80" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.kind === "form" && <span className="text-[10px] uppercase text-muted">Form</span>}
              {active === i && <CornerDownLeft className="h-3.5 w-3.5 text-muted" />}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
