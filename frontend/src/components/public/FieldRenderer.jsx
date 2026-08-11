import { useState } from "react";
import { Star, Upload, Check, ChevronDown } from "lucide-react";
import { cn, hexToRgba } from "../../lib/utils.js";

/**
 * Renders a single question for filling. Fully controlled:
 * `value` + `onChange`. Used by the builder preview and the public form.
 * `accent` themes interactive elements to the form's primary color.
 */
export function FieldRenderer({ field, value, onChange, error, accent = "#0c8b7c", disabled }) {
  // Accent-driven focus glow, exposed to inputs via CSS variables so the
  // styling works across every theme (light, dark, gradient, glass).
  const accentVars = {
    "--accent": accent,
    "--accent-ring": hexToRgba(accent, 0.16),
  };

  // Crisp, compact input: clean surface, defined border, a hair of depth,
  // and an accent focus glow. Works across every theme via currentColor.
  const inputClass = cn(
    "w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-all duration-200",
    "bg-transparent placeholder:text-current placeholder:opacity-45",
    "shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:border-current/35",
    "focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-ring)]",
    error ? "border-red-400 shadow-[0_0_0_3px_rgba(248,113,113,0.14)]" : "border-current/20"
  );

  const choiceClass = (active) =>
    cn(
      "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm transition-all duration-150",
      active
        ? "border-[var(--accent)] shadow-[0_0_0_2.5px_var(--accent-ring)]"
        : "border-current/20 shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:border-current/40"
    );

  // --- Static / layout blocks ---
  if (field.type === "heading") {
    return <h2 className="text-2xl font-bold">{field.content || field.label}</h2>;
  }
  if (field.type === "paragraph") {
    return <p className="leading-relaxed opacity-80">{field.content || field.label}</p>;
  }
  if (field.type === "section") {
    return <hr className="border-t border-current/15" />;
  }
  if (field.type === "image") {
    return field.content ? (
      <img src={field.content} alt={field.label} className="w-full rounded-xl object-cover" />
    ) : (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-current/30 text-sm opacity-60">
        Image placeholder
      </div>
    );
  }

  const control = (() => {
    switch (field.type) {
      case "long_text":
      case "address":
        return (
          <textarea
            disabled={disabled}
            rows={field.type === "address" ? 2 : 4}
            className={cn(inputClass, "resize-y")}
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case "dropdown":
        return (
          <div className="relative">
            <select
              disabled={disabled}
              className={cn(inputClass, "cursor-pointer appearance-none pr-10")}
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
            >
              <option value="">Select an option…</option>
              {field.options.map((o) => (
                <option key={o.id} value={o.label}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
          </div>
        );

      case "radio":
        return (
          <div className="space-y-2.5">
            {field.options.map((o) => (
              <label
                key={o.id}
                className={choiceClass(value === o.label)}
                style={value === o.label ? { background: hexToRgba(accent, 0.08) } : undefined}
              >
                <span
                  className="grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 transition-colors"
                  style={{ borderColor: value === o.label ? accent : "currentColor" }}
                >
                  {value === o.label && <span className="h-2 w-2 rounded-full" style={{ background: accent }} />}
                </span>
                <input
                  type="radio"
                  className="sr-only"
                  disabled={disabled}
                  checked={value === o.label}
                  onChange={() => onChange(o.label)}
                />
                {o.label}
              </label>
            ))}
          </div>
        );

      case "checkbox": {
        const arr = Array.isArray(value) ? value : [];
        const toggle = (label) =>
          onChange(arr.includes(label) ? arr.filter((v) => v !== label) : [...arr, label]);
        return (
          <div className="space-y-2.5">
            {field.options.map((o) => {
              const checked = arr.includes(o.label);
              return (
                <label
                  key={o.id}
                  className={choiceClass(checked)}
                  style={checked ? { background: hexToRgba(accent, 0.08) } : undefined}
                >
                  <span
                    className="grid h-4 w-4 shrink-0 place-items-center rounded-[5px] border-2 transition-colors"
                    style={{ borderColor: checked ? accent : "currentColor", background: checked ? accent : "transparent" }}
                  >
                    {checked && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />}
                  </span>
                  <input type="checkbox" className="sr-only" disabled={disabled} checked={checked} onChange={() => toggle(o.label)} />
                  {o.label}
                </label>
              );
            })}
          </div>
        );
      }

      case "yes_no":
        return (
          <div className="flex gap-3">
            {["Yes", "No"].map((opt) => (
              <button
                key={opt}
                type="button"
                disabled={disabled}
                onClick={() => onChange(opt)}
                className={cn(
                  "flex-1 rounded-lg border py-2.5 text-sm font-semibold transition-all duration-150",
                  value === opt
                    ? "text-white shadow-[0_6px_16px_-6px_var(--accent-ring)]"
                    : "border-current/20 shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:border-current/40"
                )}
                style={value === opt ? { background: accent, borderColor: accent } : undefined}
              >
                {opt}
              </button>
            ))}
          </div>
        );

      case "rating":
        return <RatingControl value={value} onChange={onChange} accent={accent} disabled={disabled} />;

      case "file":
        return (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-current/30 py-6 text-sm shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-150 hover:border-[var(--accent)]">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-current/[0.06]">
              <Upload className="h-4 w-4 opacity-70" />
            </span>
            <span className="opacity-80">{value || "Click to upload a file"}</span>
            <input
              type="file"
              className="hidden"
              disabled={disabled}
              onChange={(e) => onChange(e.target.files?.[0]?.name || "")}
            />
          </label>
        );

      case "date":
        return (
          <input
            type="date"
            disabled={disabled}
            className={inputClass}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case "number":
        return (
          <input
            type="number"
            disabled={disabled}
            className={inputClass}
            placeholder={field.placeholder}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      default:
        return (
          <input
            type={field.type === "password" ? "password" : field.type === "email" ? "email" : "text"}
            disabled={disabled}
            className={inputClass}
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  })();

  return (
    <div style={accentVars}>
      <label className="mb-1.5 block text-sm font-semibold leading-snug">
        {field.label}
        {field.required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {field.description && <p className="mb-2 -mt-0.5 text-xs opacity-65">{field.description}</p>}
      {control}
      {field.helpText && !error && <p className="mt-1.5 text-xs opacity-60">{field.helpText}</p>}
      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

function RatingControl({ value, onChange, accent, disabled }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className="h-7 w-7"
            style={{
              fill: (hover || value) >= n ? accent : "transparent",
              color: (hover || value) >= n ? accent : "currentColor",
              opacity: (hover || value) >= n ? 1 : 0.4,
            }}
          />
        </button>
      ))}
    </div>
  );
}
