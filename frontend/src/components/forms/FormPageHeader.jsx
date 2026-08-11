import { NavLink, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Inbox, BarChart3, ExternalLink } from "lucide-react";
import { Button } from "../ui/Button.jsx";
import { Badge } from "../ui/Feedback.jsx";
import { cn } from "../../lib/utils.js";

/** Header shared by the Responses and Analytics views of a form. */
export function FormPageHeader({ form, right }) {
  const navigate = useNavigate();
  const published = form?.status === "published";

  const tabClass = ({ isActive }) =>
    cn(
      "flex items-center gap-1.5 border-b-2 px-1 pb-2 text-sm font-medium transition-colors",
      isActive ? "border-brand-600 text-brand-600" : "border-transparent text-muted hover:text-fg"
    );

  return (
    <div className="border-b border-default bg-surface">
      <div className="mx-auto max-w-7xl px-4 pt-5 lg:px-8">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-xl font-bold tracking-tight text-fg">{form?.title}</h1>
                <Badge variant={published ? "green" : "gray"}>{published ? "Published" : "Draft"}</Badge>
              </div>
              <p className="text-xs text-muted">{form?.responseCount || 0} responses · {form?.views || 0} views</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {published && (
              <Button variant="secondary" size="sm" onClick={() => window.open(`/f/${form.slug}`, "_blank")}>
                <ExternalLink className="h-4 w-4" /> <span className="hidden sm:inline">View</span>
              </Button>
            )}
            {right}
          </div>
        </div>

        <nav className="mt-4 flex gap-5">
          <NavLink to={`/builder/${form?._id}`} className={tabClass}>
            <Pencil className="h-4 w-4" /> Edit
          </NavLink>
          <NavLink to={`/forms/${form?._id}/responses`} className={tabClass}>
            <Inbox className="h-4 w-4" /> Responses
          </NavLink>
          <NavLink to={`/forms/${form?._id}/analytics`} className={tabClass}>
            <BarChart3 className="h-4 w-4" /> Analytics
          </NavLink>
        </nav>
      </div>
    </div>
  );
}
