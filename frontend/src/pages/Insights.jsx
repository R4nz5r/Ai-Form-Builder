import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Inbox as InboxIcon,
  Eye,
  TrendingUp,
  TrendingDown,
  Clock,
  Activity,
  Trophy,
  ArrowUpRight,
  Sparkles,
  CalendarClock,
  MonitorSmartphone,
  Laptop,
  Smartphone,
  Tablet,
} from "lucide-react";
import { insightsApi } from "../services/index.js";
import { ChartCard } from "../components/analytics/ChartCard.jsx";
import { Heatmap } from "../components/analytics/Charts.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Skeleton, EmptyState } from "../components/ui/Feedback.jsx";
import { formatDuration, cn } from "../lib/utils.js";
import { CHART, tooltipStyle } from "../lib/charts.js";

const DEVICE_META = {
  Desktop: { icon: Laptop, color: CHART.teal },
  Mobile: { icon: Smartphone, color: "#34b8a3" },
  Tablet: { icon: Tablet, color: "#9fe0d3" },
};
const RANGES = ["Day", "Week", "Month"];

export default function Insights() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("Day");

  useEffect(() => {
    insightsApi
      .overview()
      .then(setData)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const series = useMemo(
    () => bucketTimeline(data?.timeline || [], range),
    [data, range],
  );

  const responsesDelta = useMemo(() => {
    const t = data?.timeline || [];
    const recent = t.slice(-7).reduce((s, x) => s + x.count, 0);
    const prev = t.slice(-14, -7).reduce((s, x) => s + x.count, 0);
    if (!prev) return recent ? 100 : 0;
    return Math.round(((recent - prev) / prev) * 100);
  }, [data]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-8 lg:px-8">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-60" />
          <Skeleton className="h-60" />
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const devices = data?.devices || [];
  const topForms = data?.topForms || [];
  const hasData = stats.totalResponses > 0;
  const totalDevices = devices.reduce((s, d) => s + d.value, 0);

  const kpis = [
    {
      icon: InboxIcon,
      label: "Responses",
      value: stats.totalResponses ?? 0,
      delta: responsesDelta,
    },
    {
      icon: Eye,
      label: "Views",
      value: (stats.totalViews ?? 0).toLocaleString(),
      sub: `across ${stats.totalForms ?? 0} forms`,
    },
    {
      icon: TrendingUp,
      label: "Conversion",
      value: `${stats.conversion ?? 0}%`,
      sub: `of ${(stats.totalViews ?? 0).toLocaleString()} views`,
    },
    {
      icon: Clock,
      label: "Avg. time",
      value: formatDuration(stats.avgCompletionTime),
      sub: "per response",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <PageHeader
        icon={Sparkles}
        title="Insights"
        subtitle="Performance across all your forms"
      />

      {!hasData ? (
        <Card className="mt-6">
          <EmptyState
            icon={Activity}
            title="No responses yet"
            description="Once your forms start collecting responses, you'll see cross-form trends here."
          />
        </Card>
      ) : (
        <>
          {/* Row 1: KPI cards + heatmap */}
          <div className="mt-6 grid gap-5 lg:grid-cols-12">
            <div className="grid grid-cols-2 gap-4 lg:col-span-5">
              {kpis.map((k) => (
                <Card key={k.label} hover className="p-5">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-brand-50 to-brand-100/50 text-brand-700 shadow-soft dark:from-brand-900/50 dark:to-brand-800/40 dark:text-brand-200">
                    <k.icon className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <p className="mt-3.5 text-sm text-muted">{k.label}</p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-fg">
                    {k.value}
                  </p>
                  {k.delta != null ? (
                    <p
                      className={cn(
                        "mt-1 flex items-center gap-1 text-xs font-medium",
                        k.delta >= 0 ? "text-emerald-600" : "text-red-500",
                      )}
                    >
                      {k.delta >= 0 ? (
                        <TrendingUp className="h-3.5 w-3.5" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5" />
                      )}
                      {Math.abs(k.delta)}%{" "}
                      <span className="font-normal text-muted">this week</span>
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-muted">{k.sub}</p>
                  )}
                </Card>
              ))}
            </div>

            <ChartCard
              className="lg:col-span-7"
              title="Responses by time of day"
              subtitle="When people submit your forms"
              icon={CalendarClock}
            >
              <Heatmap data={data?.heatmap || []} />
            </ChartCard>
          </div>

          {/* Row 2: area chart + device donut */}
          <div className="mt-5 grid gap-5 lg:grid-cols-12">
            <ChartCard
              className="lg:col-span-8"
              title="Response volume"
              subtitle="Submissions over time"
              icon={Activity}
              right={
                <div className="flex rounded-lg border border-default p-0.5">
                  {RANGES.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRange(r)}
                      className={cn(
                        "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                        range === r
                          ? "bg-brand-600 text-white"
                          : "text-muted hover:text-fg",
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              }
            >
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={series}
                  margin={{ left: -18, right: 6, top: 8 }}
                >
                  <defs>
                    <linearGradient id="volFill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={CHART.teal}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor={CHART.teal}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="var(--border)"
                    vertical={false}
                    strokeDasharray="4 4"
                  />
                  <XAxis
                    dataKey="label"
                    stroke="var(--fg-muted)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={20}
                  />
                  <YAxis
                    allowDecimals={false}
                    stroke="var(--fg-muted)"
                    fontSize={11}
                    width={34}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: "var(--fg)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Responses"
                    stroke={CHART.teal}
                    strokeWidth={2.5}
                    fill="url(#volFill)"
                    activeDot={{ r: 5, strokeWidth: 2, fill: "var(--surface)" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              className="lg:col-span-4"
              title="Sessions by device"
              subtitle="Where responses come from"
              icon={MonitorSmartphone}
            >
              <div className="relative mx-auto h-44 w-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={devices}
                      dataKey="value"
                      nameKey="label"
                      innerRadius={62}
                      outerRadius={80}
                      paddingAngle={4}
                      cornerRadius={8}
                      stroke="none"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {devices.map((d) => (
                        <Cell
                          key={d.label}
                          fill={DEVICE_META[d.label]?.color || CHART.slate}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-fg">
                    {totalDevices.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-muted">total</span>
                </div>
              </div>
              <ul className="mt-4 space-y-2.5">
                {devices.map((d) => {
                  const meta = DEVICE_META[d.label] || {};
                  const Icon = meta.icon || MonitorSmartphone;
                  const pct = totalDevices
                    ? ((d.value / totalDevices) * 100).toFixed(1)
                    : 0;
                  return (
                    <li
                      key={d.label}
                      className="flex items-center gap-2.5 text-sm"
                    >
                      <Icon className="h-4 w-4" style={{ color: meta.color }} />
                      <span className="flex-1 text-fg">{d.label}</span>
                      <span className="font-semibold text-fg">{pct}%</span>
                    </li>
                  );
                })}
              </ul>
            </ChartCard>
          </div>

          {/* Top forms leaderboard */}
          <ChartCard
            className="mt-5"
            title="Top forms"
            subtitle="Ranked by responses"
            icon={Trophy}
            bodyClass="space-y-1"
          >
            {topForms.map((f, i) => {
              const max = topForms[0]?.responses || 1;
              return (
                <button
                  key={f.id}
                  onClick={() => navigate(`/forms/${f.id}/analytics`)}
                  className="group grid w-full grid-cols-[1.5rem_1fr_auto] items-center gap-3 rounded-xl border border-transparent p-2.5 text-left transition-colors hover:border-default hover:bg-surface-2 sm:grid-cols-[1.5rem_1.5fr_2fr_auto]"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-lg bg-surface-2 text-xs font-bold text-muted">
                    {i + 1}
                  </span>
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: f.color }}
                    />
                    <span className="truncate text-sm font-medium text-fg">
                      {f.title}
                    </span>
                  </div>
                  <div className="hidden h-2 overflow-hidden rounded-full bg-surface-2 sm:block">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(f.responses / max) * 100}%`,
                        background: f.color,
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <span className="w-14 text-sm font-semibold text-fg">
                      {f.responses}
                    </span>
                    <span className="hidden w-16 text-xs text-muted sm:block">
                      {f.conversion}% conv.
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-muted opacity-0 transition group-hover:opacity-100" />
                  </div>
                </button>
              );
            })}
          </ChartCard>
        </>
      )}
    </div>
  );
}

export function PageHeader({ icon: Icon, title, subtitle, right }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-100/50 to-brand-200/50 text-brand-700 shadow-soft">
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-fg">{title}</h1>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

/** Bucket a daily timeline into Day / Week / Month granularity. */
function bucketTimeline(timeline, gran) {
  if (!timeline.length) return [];
  if (gran === "Day") {
    return timeline.map((t) => ({
      label: new Date(t.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      count: t.count,
    }));
  }
  const start = new Date(timeline[0].date);
  const groups = new Map();
  for (const t of timeline) {
    const d = new Date(t.date);
    let key;
    let label;
    if (gran === "Week") {
      const wk = Math.floor((d - start) / (7 * 86_400_000));
      key = `w${wk}`;
      label = `Wk ${wk + 1}`;
    } else {
      key = `${d.getFullYear()}-${d.getMonth()}`;
      label = d.toLocaleDateString(undefined, {
        month: "short",
        year: "2-digit",
      });
    }
    const g = groups.get(key) || { label, count: 0 };
    g.count += t.count;
    groups.set(key, g);
  }
  return [...groups.values()];
}
