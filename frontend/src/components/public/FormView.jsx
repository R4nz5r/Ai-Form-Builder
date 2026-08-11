import { useMemo, useState } from "react";
import { FieldRenderer } from "./FieldRenderer.jsx";
import { FormArtPanel } from "./FormArtPanel.jsx";
import { getTheme } from "../../lib/themes.js";
import { isStatic } from "../../lib/fieldTypes.js";
import { validateForm } from "../../lib/validate.js";
import { shade } from "../../lib/utils.js";

/**
 * Renders a complete, fillable form on a clean light surface. On wide screens
 * it's a split layout: the form on the left, a soft bauhaus illustration
 * (tinted by the form's accent) on the right. `preview` renders the form-only
 * column and disables network submit.
 */
export function FormView({ form, preview = false, onSubmit, submitting = false }) {
  const theme = getTheme(form.theme);
  const accent = form.settings?.primaryColor || theme.accent;
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});

  const answerable = useMemo(() => form.questions.filter((q) => !isStatic(q.type)), [form.questions]);
  const answeredCount = answerable.filter((q) => {
    const v = answers[q.id];
    return v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0);
  }).length;
  const progress = answerable.length ? Math.round((answeredCount / answerable.length) * 100) : 0;

  const setAnswer = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validateForm(form.questions, answers);
    if (Object.keys(found).length) {
      setErrors(found);
      const firstId = Object.keys(found)[0];
      document.getElementById(`q-${firstId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const payload = answerable
      .filter((q) => answers[q.id] !== undefined && answers[q.id] !== "")
      .map((q) => ({ questionId: q.id, value: answers[q.id] }));
    onSubmit?.(payload);
  };

  const formBody = (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-xl px-6 py-12 sm:px-10 lg:px-12">
          {form.settings?.logo ? (
            <img src={form.settings.logo} alt="" className="mb-8 h-9 w-auto object-contain" />
          ) : (
            <div className="mb-8 h-1 w-10 rounded-full" style={{ background: accent }} />
          )}

          <header className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{form.title}</h1>
            {form.description && (
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{form.description}</p>
            )}
          </header>

          <div className="space-y-6 text-slate-900">
            {form.questions.map((q) => (
              <div key={q.id} id={`q-${q.id}`}>
                <FieldRenderer
                  field={q}
                  value={answers[q.id]}
                  onChange={(val) => setAnswer(q.id, val)}
                  error={errors[q.id]}
                  accent={accent}
                />
              </div>
            ))}
          </div>

          {answerable.length > 0 && (
            <button
              type="submit"
              disabled={submitting}
              className="mt-9 w-full rounded-xl py-3 text-sm font-semibold text-white transition-all hover:brightness-[1.07] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
              style={{
                background: `linear-gradient(145deg, ${accent}, ${shade(accent, -16)})`,
                boxShadow: `0 8px 22px -8px ${accent}80`,
              }}
            >
              {submitting ? "Submitting…" : form.settings?.submitButtonText || "Submit"}
            </button>
          )}

          {preview && (
            <p className="mt-3 text-center text-xs text-slate-400">Preview mode — submissions are disabled</p>
          )}

          <p className="mt-10 text-center text-xs text-slate-400">Powered by Timely Forms AI</p>
        </form>
  );

  const progressBar = form.settings?.showProgressBar && answerable.length > 0 && (
    <div className="sticky top-0 z-10 h-1 w-full bg-slate-100">
      <div className="h-full transition-all duration-300" style={{ width: `${progress}%`, background: accent }} />
    </div>
  );

  // Preview (builder modal): form-only; the modal owns the scroll.
  if (preview) {
    return (
      <div className="bg-white">
        {progressBar}
        {formBody}
      </div>
    );
  }

  // Public page: split layout with the illustration on the right.
  return (
    <div className="grid h-screen grid-cols-1 lg:grid-cols-[1fr_minmax(0,42%)] xl:grid-cols-[1fr_minmax(0,46%)]">
      <div className="relative flex h-screen flex-col bg-white">
        {progressBar}
        <div className="flex-1 overflow-y-auto scrollbar-thin">{formBody}</div>
      </div>
      <FormArtPanel accent={accent} variant={theme.art} className="hidden lg:block" />
    </div>
  );
}
