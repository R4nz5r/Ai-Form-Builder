import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Star, MessageSquareText } from "lucide-react";
import { Card } from "../ui/Card.jsx";
import { FIELD_DEFS } from "../../lib/fieldTypes.js";
import { shade } from "../../lib/utils.js";
import { CHART_PALETTE } from "../../lib/charts.js";

const PALETTE = CHART_PALETTE;

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-default bg-surface px-3 py-1.5 text-xs shadow-pop">
      <span className="font-medium text-fg">{payload[0].payload.label}</span>
      <span className="ml-2 text-muted">{payload[0].value}</span>
    </div>
  );
}

/** Renders the right visualization for one question's analytics. */
export function QuestionChart({ question }) {
  const def = FIELD_DEFS[question.type];
  const Icon = def?.icon || MessageSquareText;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-muted">
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-semibold text-fg">{question.label}</h3>
            <p className="text-xs text-muted">
              {question.total} response{question.total === 1 ? "" : "s"} · {def?.label}
            </p>
          </div>
        </div>
        {question.average != null && (
          <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-600 dark:bg-amber-900/20 dark:text-amber-300">
            <Star className="h-3.5 w-3.5 fill-current" /> {question.average}
          </div>
        )}
      </div>

      <div className="mt-4">
        {renderBody(question)}
      </div>
    </Card>
  );
}

function renderBody(question) {
  // Free text — show recent samples.
  if (question.samples) {
    if (!question.samples.length) return <Empty />;
    return (
      <div className="space-y-2">
        {question.samples.map((s, i) => (
          <p key={i} className="rounded-xl bg-surface-2 px-3 py-2 text-sm text-fg">
            “{s}”
          </p>
        ))}
      </div>
    );
  }

  const data = question.breakdown || [];
  if (!data.length || data.every((d) => d.count === 0)) return <Empty />;

  // Pie for yes/no, donut for small choice sets; bar otherwise.
  if (question.type === "yes_no" || (question.type !== "rating" && question.type !== "number" && data.length <= 4)) {
    return (
      <div className="flex items-center gap-4">
        <ResponsiveContainer width="50%" height={180}>
          <PieChart>
            <defs>
              {data.map((_, i) => {
                const base = PALETTE[i % PALETTE.length];
                return (
                  <linearGradient key={i} id={`qpie-${question.id}-${i}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={shade(base, 14)} />
                    <stop offset="100%" stopColor={shade(base, -10)} />
                  </linearGradient>
                );
              })}
            </defs>
            <Pie data={data} dataKey="count" nameKey="label" innerRadius={44} outerRadius={72} paddingAngle={2} stroke="none">
              {data.map((_, i) => (
                <Cell key={i} fill={`url(#qpie-${question.id}-${i})`} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-1.5">
          {data.map((d, i) => (
            <Legend key={d.label} color={PALETTE[i % PALETTE.length]} label={d.label} value={d.count} total={question.total} />
          ))}
        </div>
      </div>
    );
  }

  // Size the category axis to the longest label so short ones (e.g. "1"–"5")
  // don't leave a big empty gutter.
  const maxLen = Math.max(...data.map((d) => String(d.label).length));
  const yWidth = Math.min(116, Math.max(24, maxLen * 7.5));

  return (
    <ResponsiveContainer width="100%" height={Math.max(170, data.length * 38)}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 18 }}>
        <defs>
          {data.map((_, i) => {
            const base = PALETTE[i % PALETTE.length];
            return (
              <linearGradient key={i} id={`qbar-${question.id}-${i}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={base} />
                <stop offset="100%" stopColor={shade(base, 16)} />
              </linearGradient>
            );
          })}
        </defs>
        <CartesianGrid horizontal={false} stroke="var(--border)" />
        <XAxis type="number" allowDecimals={false} stroke="var(--fg-muted)" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis
          type="category"
          dataKey="label"
          width={yWidth}
          stroke="var(--fg-muted)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => (v.length > 16 ? `${v.slice(0, 16)}…` : v)}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--surface-2)" }} />
        <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
          {data.map((_, i) => (
            <Cell key={i} fill={`url(#qbar-${question.id}-${i})`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function Legend({ color, label, value, total }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="h-3 w-3 rounded-sm" style={{ background: color }} />
      <span className="flex-1 truncate text-fg">{label}</span>
      <span className="text-muted">
        {value} ({pct}%)
      </span>
    </div>
  );
}

function Empty() {
  return <p className="py-6 text-center text-sm text-muted">No data yet</p>;
}
