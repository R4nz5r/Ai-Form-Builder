import { Eye, MousePointerClick, CheckCircle2, Filter } from "lucide-react";
import { ChartCard } from "./ChartCard.jsx";
import { CHART } from "../../lib/charts.js";

/**
 * Conversion funnel: Views → Responses → Completed, as proportional bars
 * with drop-off between stages.
 */
export function Funnel({ views = 0, responses = 0, completionRate = 0 }) {
  const completed = Math.round((responses * completionRate) / 100);
  const max = Math.max(views, 1);
  const stages = [
    { label: "Views", value: views, icon: Eye, grad: `linear-gradient(90deg, ${CHART.slateLight}, ${CHART.slate})` },
    { label: "Responses", value: responses, icon: MousePointerClick, grad: `linear-gradient(90deg, ${CHART.goldLight}, ${CHART.gold})` },
    { label: "Completed", value: completed, icon: CheckCircle2, grad: `linear-gradient(90deg, ${CHART.tealLight}, ${CHART.teal})` },
  ];

  return (
    <ChartCard title="Conversion funnel" subtitle="From a view to a completed submission" icon={Filter}>
      <div className="space-y-4">
        {stages.map((s, i) => {
          const pct = Math.round((s.value / max) * 100);
          const prev = i > 0 ? stages[i - 1].value : null;
          const drop = prev && prev > 0 ? Math.round((s.value / prev) * 100) : null;
          return (
            <div key={s.label}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium text-fg">
                  <s.icon className="h-4 w-4 text-muted" /> {s.label}
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-semibold text-fg">{s.value.toLocaleString()}</span>
                  {drop != null && (
                    <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-muted">
                      {drop}%
                    </span>
                  )}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(pct, 2)}%`, background: s.grad }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}
