import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";
import { Modal } from "../ui/Modal.jsx";
import { Button } from "../ui/Button.jsx";
import { Textarea } from "../ui/Input.jsx";
import { aiApi } from "../../services/index.js";

const EXAMPLES = [
  "Customer feedback form for a coffee shop",
  "Employee onboarding survey",
  "Event registration for a tech conference",
  "Product market-research questionnaire",
  "Job application for a frontend developer",
];

/** Modal that turns a natural-language prompt into a full form via Gemini. */
export function AIGenerateModal({ open, onClose, onGenerated }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const form = await aiApi.generateForm(prompt);
      toast.success("Form generated with AI ✨");
      onGenerated(form);
      onClose();
      setPrompt("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      title="Generate a form with AI"
      description="Describe what you need and Gemini will draft the questions, types and validation."
      size="lg"
    >
      <div className="relative">
        <Textarea
          autoFocus
          rows={4}
          value={prompt}
          disabled={loading}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. A detailed customer satisfaction survey for an online electronics store, including delivery and support ratings."
          className="pr-3"
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") generate();
          }}
        />
      </div>

      <div className="mt-3">
        <p className="mb-2 text-xs font-medium text-muted">Try an example</p>
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              disabled={loading}
              onClick={() => setPrompt(ex)}
              className="rounded-full border border-default px-3 py-1 text-xs text-muted transition hover:border-brand-300 hover:text-brand-600 disabled:opacity-50"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-xs text-muted">Tip: press ⌘/Ctrl + Enter</p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={generate} loading={loading} disabled={!prompt.trim()}>
            {!loading && <Sparkles className="h-4 w-4" />}
            Generate form
          </Button>
        </div>
      </div>

      {loading && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-brand-50 p-3 text-sm text-brand-700 dark:bg-brand-900/20 dark:text-brand-200">
          <Loader2 className="h-4 w-4 animate-spin" />
          Designing your form — this usually takes a few seconds…
        </div>
      )}
    </Modal>
  );
}
