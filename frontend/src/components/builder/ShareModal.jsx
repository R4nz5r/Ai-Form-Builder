import { toast } from "sonner";
import { Copy, ExternalLink, Globe, Code2 } from "lucide-react";
import { Modal } from "../ui/Modal.jsx";
import { Button } from "../ui/Button.jsx";

export function ShareModal({ open, onClose, form }) {
  const url = `${window.location.origin}/f/${form.slug}`;
  const embed = `<iframe src="${url}" width="100%" height="700" frameborder="0"></iframe>`;

  const copy = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  return (
    <Modal open={open} onClose={onClose} title="Share your form" description="Anyone with the link can respond." size="md">
      {form.status !== "published" ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
          Publish this form first to start collecting responses.
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-fg">
              <Globe className="h-4 w-4" /> Public link
            </label>
            <div className="flex gap-2">
              <input
                readOnly
                value={url}
                className="h-10 flex-1 rounded-xl border border-default bg-surface-2 px-3 text-sm text-fg"
              />
              <Button variant="secondary" size="icon" onClick={() => copy(url, "Link")}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon" onClick={() => window.open(url, "_blank")}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-fg">
              <Code2 className="h-4 w-4" /> Embed code
            </label>
            <div className="flex gap-2">
              <input
                readOnly
                value={embed}
                className="h-10 flex-1 rounded-xl border border-default bg-surface-2 px-3 font-mono text-xs text-muted"
              />
              <Button variant="secondary" size="icon" onClick={() => copy(embed, "Embed code")}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
