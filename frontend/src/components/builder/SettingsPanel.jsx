import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Clock, Target, Users, Lightbulb, Check } from "lucide-react";
import { THEME_LIST } from "../../lib/themes.js";
import { FormArtPanel } from "../public/FormArtPanel.jsx";
import { Input, Textarea, Label } from "../ui/Input.jsx";
import { Switch } from "../ui/Switch.jsx";
import { Button } from "../ui/Button.jsx";
import { cn } from "../../lib/utils.js";
import { aiApi } from "../../services/index.js";

// Curated, premium accent palette (deeper, more considered than primaries).
const COLORS = [
  "#0c8b7c", // brand teal
  "#0f766e", // pine
  "#2563eb", // blue
  "#4f46e5", // indigo
  "#7c3aed", // violet
  "#db2777", // pink
  "#e11d48", // rose
  "#ea580c", // orange
  "#d97706", // amber
  "#059669", // emerald
  "#0891b2", // cyan
  "#334155", // ink
];

/** Miniature theme preview: a light form sliver beside its art pattern. */
function ThemeThumb({ theme, accent }) {
  return (
    <div className="relative grid h-[4.5rem] w-full grid-cols-[1fr_1fr] overflow-hidden bg-white">
      <div className="p-2.5">
        <div className="h-1.5 w-4/5 rounded-full bg-slate-300" />
        <div className="mt-1.5 h-1 w-3/5 rounded-full bg-slate-200" />
        <div className="mt-2 h-2.5 w-full rounded-[3px] border border-slate-200" />
        <div className="mt-1.5 h-2.5 w-8 rounded-[3px]" style={{ background: accent }} />
      </div>
      <FormArtPanel accent={accent} variant={theme.art} cols={2} rows={3} className="h-full w-full" />
    </div>
  );
}

/** Right-rail editor for form-level settings: theme, branding, copy, SEO. */
export function SettingsPanel({ form, onChange }) {
  const [summary, setSummary] = useState(null);
  const [summarizing, setSummarizing] = useState(false);

  const setSettings = (patch) => onChange({ settings: { ...form.settings, ...patch } });

  const runSummary = async () => {
    setSummarizing(true);
    try {
      const result = await aiApi.formSummary(form);
      setSummary(result);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Theme */}
      <Section title="Theme">
        <div className="grid grid-cols-2 gap-2.5">
          {THEME_LIST.map((t) => {
            const active = form.theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onChange({ theme: t.id })}
                className={cn(
                  "group relative overflow-hidden rounded-xl border bg-surface text-left transition-all",
                  active
                    ? "border-brand-500 ring-2 ring-brand-500/20"
                    : "border-default hover:border-brand-300 hover:shadow-soft"
                )}
              >
                <ThemeThumb theme={t} accent={form.settings.primaryColor} />
                {active && (
                  <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-white shadow-soft">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                )}
                <p className="px-2.5 py-1.5 text-xs font-medium text-fg">{t.label}</p>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Branding */}
      <Section title="Branding">
        <Label>Primary color</Label>
        <div className="grid grid-cols-6 gap-2">
          {COLORS.map((c) => {
            const active = form.settings.primaryColor?.toLowerCase() === c;
            return (
              <button
                key={c}
                onClick={() => setSettings({ primaryColor: c })}
                aria-label={c}
                className={cn(
                  "grid aspect-square place-items-center rounded-full text-white transition-transform hover:scale-110",
                  active && "ring-2 ring-offset-2 ring-offset-surface"
                )}
                style={{ background: c, "--tw-ring-color": c }}
              >
                {active && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
        <label className="mt-2.5 flex cursor-pointer items-center gap-2 rounded-xl border border-default bg-surface-2 px-3 py-2 text-sm text-muted transition-colors hover:border-brand-300">
          <span
            className="h-5 w-5 rounded-full ring-1 ring-black/10"
            style={{ background: form.settings.primaryColor }}
          />
          <span className="flex-1 font-medium text-fg">Custom color</span>
          <span className="font-mono text-xs uppercase">{form.settings.primaryColor}</span>
          <input
            type="color"
            value={form.settings.primaryColor}
            onChange={(e) => setSettings({ primaryColor: e.target.value })}
            className="h-0 w-0 opacity-0"
          />
        </label>

        <div className="mt-3">
          <Label>Logo URL</Label>
          <Input
            value={form.settings.logo}
            placeholder="https://…/logo.png"
            onChange={(e) => setSettings({ logo: e.target.value })}
          />
        </div>

        <div className="mt-3">
          <Label>Border radius — {form.settings.borderRadius}px</Label>
          <input
            type="range"
            min="0"
            max="28"
            value={form.settings.borderRadius}
            onChange={(e) => setSettings({ borderRadius: Number(e.target.value) })}
            className="w-full accent-brand-600"
          />
        </div>
      </Section>

      {/* Copy */}
      <Section title="Messages">
        <Label>Submit button text</Label>
        <Input value={form.settings.submitButtonText} onChange={(e) => setSettings({ submitButtonText: e.target.value })} />
        <div className="mt-3">
          <Label>Thank-you message</Label>
          <Textarea
            rows={2}
            value={form.settings.thankYouMessage}
            onChange={(e) => setSettings({ thankYouMessage: e.target.value })}
          />
        </div>
        <div className="mt-3 rounded-xl border border-default bg-surface-2 p-3">
          <Switch
            checked={form.settings.showProgressBar}
            onChange={(v) => setSettings({ showProgressBar: v })}
            label="Show progress bar"
          />
        </div>
      </Section>

      {/* SEO */}
      <Section title="SEO">
        <Label>SEO title</Label>
        <Input value={form.settings.seoTitle} placeholder={form.title} onChange={(e) => setSettings({ seoTitle: e.target.value })} />
        <div className="mt-3">
          <Label>SEO description</Label>
          <Textarea rows={2} value={form.settings.seoDescription} onChange={(e) => setSettings({ seoDescription: e.target.value })} />
        </div>
      </Section>

      {/* AI summary */}
      <Section title="AI insights">
        <Button variant="subtle" className="w-full" onClick={runSummary} loading={summarizing}>
          {!summarizing && <Sparkles className="h-4 w-4" />}
          Analyze this form
        </Button>
        {summary && (
          <div className="mt-3 space-y-2 text-sm">
            <Insight icon={Target} label="Purpose" value={summary.purpose} />
            <Insight icon={Users} label="Audience" value={summary.audience} />
            <Insight icon={Clock} label="Completion time" value={summary.completionTime} />
            {summary.suggestions?.length > 0 && (
              <div className="rounded-xl border border-default bg-surface-2 p-3">
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-fg">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-500" /> Suggestions
                </p>
                <ul className="space-y-1">
                  {summary.suggestions.map((s, i) => (
                    <li key={i} className="text-xs text-muted">• {s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="mb-2.5 text-sm font-semibold text-fg">{title}</h3>
      {children}
    </div>
  );
}

function Insight({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
      <div>
        <span className="font-medium text-fg">{label}: </span>
        <span className="text-muted">{value}</span>
      </div>
    </div>
  );
}
