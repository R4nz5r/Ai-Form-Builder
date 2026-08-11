import { useState } from "react";
import { toast } from "sonner";
import { Plus, X, Sparkles, Wand2, GripVertical } from "lucide-react";
import { Input, Textarea, Label } from "../ui/Input.jsx";
import { Switch } from "../ui/Switch.jsx";
import { Button } from "../ui/Button.jsx";
import { FIELD_DEFS, OPTION_TYPES, uid } from "../../lib/fieldTypes.js";
import { aiApi } from "../../services/index.js";

/** Editor panel for a single field's properties. */
export function FieldSettings({ field, onChange }) {
  const def = FIELD_DEFS[field.type];
  const [aiBusy, setAiBusy] = useState(false);
  const [improving, setImproving] = useState(false);
  const [followUps, setFollowUps] = useState([]);

  const set = (patch) => onChange({ ...field, ...patch });
  const setValidation = (patch) => set({ validation: { ...field.validation, ...patch } });

  const updateOption = (id, label) =>
    set({ options: field.options.map((o) => (o.id === id ? { ...o, label } : o)) });
  const addOption = () =>
    set({ options: [...field.options, { id: uid("opt"), label: `Option ${field.options.length + 1}`, value: "" }] });
  const removeOption = (id) => set({ options: field.options.filter((o) => o.id !== id) });

  const suggestValidation = async () => {
    setAiBusy(true);
    try {
      const v = await aiApi.generateValidation({
        label: field.label,
        type: field.type,
        description: field.description,
      });
      setValidation(v);
      toast.success("AI suggested validation rules");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAiBusy(false);
    }
  };

  const improve = async () => {
    setImproving(true);
    try {
      const result = await aiApi.improveQuestion({ label: field.label, type: field.type });
      set({ label: result.improved });
      setFollowUps(result.followUps || []);
      toast.success("Question improved");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setImproving(false);
    }
  };

  // Static layout blocks have a simpler editor.
  if (def.static) {
    return (
      <div className="space-y-4">
        <div>
          <Label>{field.type === "image" ? "Image URL" : "Content"}</Label>
          {field.type === "image" ? (
            <Input
              value={field.content}
              placeholder="https://…"
              onChange={(e) => set({ content: e.target.value })}
            />
          ) : (
            <Textarea value={field.content} onChange={(e) => set({ content: e.target.value })} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <Label>Question label</Label>
          <button
            onClick={improve}
            disabled={improving}
            className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline disabled:opacity-50"
          >
            <Wand2 className="h-3 w-3" /> {improving ? "Improving…" : "AI improve"}
          </button>
        </div>
        <Input value={field.label} onChange={(e) => set({ label: e.target.value })} />
      </div>

      {followUps.length > 0 && (
        <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-3 dark:border-brand-900 dark:bg-brand-900/20">
          <p className="mb-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300">
            Suggested follow-up questions
          </p>
          <div className="space-y-1">
            {followUps.map((f, i) => (
              <p key={i} className="text-xs text-muted">• {f}</p>
            ))}
          </div>
        </div>
      )}

      {!["yes_no", "rating", "file", "date"].includes(field.type) && (
        <div>
          <Label>Placeholder</Label>
          <Input value={field.placeholder} onChange={(e) => set({ placeholder: e.target.value })} />
        </div>
      )}

      <div>
        <Label>Description</Label>
        <Input
          value={field.description}
          placeholder="Optional helper text shown under the label"
          onChange={(e) => set({ description: e.target.value })}
        />
      </div>

      {OPTION_TYPES.includes(field.type) && (
        <div>
          <Label>Options</Label>
          <div className="space-y-1.5">
            {field.options.map((o) => (
              <div key={o.id} className="flex items-center gap-1.5">
                <GripVertical className="h-4 w-4 shrink-0 text-muted" />
                <Input
                  value={o.label}
                  onChange={(e) => updateOption(o.id, e.target.value)}
                  className="h-9"
                />
                <Button variant="ghost" size="icon-sm" onClick={() => removeOption(o.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="mt-1.5" onClick={addOption}>
            <Plus className="h-3.5 w-3.5" /> Add option
          </Button>
        </div>
      )}

      <div>
        <Label>Help text</Label>
        <Input
          value={field.helpText}
          placeholder="Shown below the field"
          onChange={(e) => set({ helpText: e.target.value })}
        />
      </div>

      <div className="rounded-xl border border-default bg-surface-2 p-3">
        <Switch
          checked={field.required}
          onChange={(v) => set({ required: v })}
          label="Required"
          description="Respondents must answer this question"
        />
      </div>

      {/* Validation */}
      <div className="rounded-xl border border-default p-3">
        <div className="mb-2 flex items-center justify-between">
          <Label className="mb-0">Validation</Label>
          <Button variant="subtle" size="sm" loading={aiBusy} onClick={suggestValidation}>
            <Sparkles className="h-3.5 w-3.5" /> AI suggest
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {["short_text", "long_text", "password", "address", "phone"].includes(field.type) && (
            <>
              <NumberInput label="Min length" value={field.validation.minLength} onChange={(v) => setValidation({ minLength: v })} />
              <NumberInput label="Max length" value={field.validation.maxLength} onChange={(v) => setValidation({ maxLength: v })} />
            </>
          )}
          {field.type === "number" && (
            <>
              <NumberInput label="Min value" value={field.validation.min} onChange={(v) => setValidation({ min: v })} />
              <NumberInput label="Max value" value={field.validation.max} onChange={(v) => setValidation({ max: v })} />
            </>
          )}
        </div>
        <div className="mt-2">
          <Label className="text-xs">Regex pattern</Label>
          <Input
            value={field.validation.pattern}
            placeholder="^[A-Za-z]+$"
            className="h-9 font-mono text-xs"
            onChange={(e) => setValidation({ pattern: e.target.value })}
          />
        </div>
        <div className="mt-2">
          <Label className="text-xs">Error message</Label>
          <Input
            value={field.validation.message}
            placeholder="Please enter a valid value"
            className="h-9"
            onChange={(e) => setValidation({ message: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

function NumberInput({ label, value, onChange }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        className="h-9"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      />
    </div>
  );
}
