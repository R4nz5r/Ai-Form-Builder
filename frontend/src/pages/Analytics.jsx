import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Inbox,
  Eye,
  TrendingUp,
  CheckCircle2,
  Clock,
  BarChart3,
  Activity,
  Gauge as GaugeIcon,
  MonitorSmartphone,
  CalendarDays,
} from "lucide-react";
import { formApi, responseApi } from "../services/index.js";
import { FormPageHeader } from "../components/forms/FormPageHeader.jsx";
import { QuestionChart } from "../components/analytics/QuestionChart.jsx";
import { KpiCard } from "../components/analytics/KpiCard.jsx";
import { Funnel } from "../components/analytics/Funnel.jsx";
import { ChartCard } from "../components/analytics/ChartCard.jsx";
import { Gauge, Donut, ActivityBars } from "../components/analytics/Charts.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Skeleton, EmptyState } from "../components/ui/Feedback.jsx";
import { formatDuration } from "../lib/utils.js";
import { CHART, tooltipStyle, deviceFromUA } from "../lib/charts.js";

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Analytics() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([formApi.get(id), responseApi.analytics(id), responseApi.list(id)])
      .then(([f, a, r]) => {
        setForm(f);
        setAnalytics(a);
        setResponses(r.responses || []);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const stats = analytics?.stats || {};

  // Daily series + running cumulative.
  const timeline = useMemo(() => {
    let run = 0;
    return (analytics?.timeline || []).map((t) => {
      run += t.count;
      return {
        ...t,
        day: new Date(t.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        cumulative: run,
      };
    });
  }, [analytics]);

  // Submissions by weekday.
  const weekday = useMemo(() => {
    const counts = Array(7).fill(0);
    (analytics?.timeline || []).forEach((t) => {
      counts[new Date(t.date).getDay()] += t.count;
    });
    return [1, 2, 3, 4, 5, 6, 0].map((i) => ({ day: WD[i], count: counts[i] }));
  }, [analytics]);

  // Device breakdown from response user-agents.
  const devices = useMemo(() => {
    const counts = {};
    responses.forEach((r) => {
      const { browser } = deviceFromUA(r.meta?.userAgent || "");
      counts[browser] = (counts[browser] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [responses]);

  if (loading) {
    return (
      <div>
        <div className="h-32 border-b border-default bg-surface" />
        <div className="mx-auto max-w-7xl space-y-4 px-4 py-8 lg:px-8">
          <Skeleton className="h-24" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  const questions = analytics?.questions || [];
  const hasData = stats.totalResponses > 0;

  return (
    <div className="min-h-full bg-app">
      <FormPageHeader form={form} />

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <KpiCard icon={Inbox} label="Responses" value={stats.totalResponses ?? 0} accent="brand" spark={timeline} />
          <KpiCard icon={Eye} label="Views" value={stats.views ?? 0} accent="slate" />
          <KpiCard icon={TrendingUp} label="Conversion" value={`${stats.conversionRate ?? 0}%`} accent="gold" progress={stats.conversionRate} />
          <KpiCard icon={CheckCircle2} label="Completion" value={`${stats.completionRate ?? 0}%`} accent="green" progress={stats.completionRate} />
          <KpiCard icon={Clock} label="Avg. time" value={formatDuration(stats.avgCompletionTime)} accent="slate" />
        </div>

        {!hasData ? (
          <Card className="mt-6">
            <EmptyState
              icon={BarChart3}
              title="No analytics yet"
              description="Once people start responding, you'll see response trends and per-question insights here."
            />
          </Card>
        ) : (
          <>
            {/* Bento row 1: timeline + completion gauge */}
            <div className="mt-5 grid gap-5 lg:grid-cols-12">
              <ChartCard
                className="lg:col-span-8"
                title="Response timeline"
                subtitle="Daily submissions and cumulative growth"
                icon={Activity}
                right={
                  <div className="hidden items-center gap-4 text-xs sm:flex">
                    <Legend color={CHART.teal} label="Daily" />
                    <Legend color={CHART.gold} label="Cumulative" />
                  </div>
                }
              >
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={timeline} margin={{ left: -18, right: 6, top: 6 }}>
                    <defs>
                      <linearGradient id="dailyFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART.teal} stopOpacity={0.28} />
                        <stop offset="100%" stopColor={CHART.teal} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="day" stroke="var(--fg-muted)" fontSize={11} tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis yAxisId="l" allowDecimals={false} stroke="var(--fg-muted)" fontSize={11} width={34} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="r" orientation="right" allowDecimals={false} stroke="var(--fg-muted)" fontSize={11} width={34} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--fg)" }} />
                    <Area yAxisId="l" type="monotone" dataKey="count" name="Daily" stroke={CHART.teal} strokeWidth={2.5} fill="url(#dailyFill)" />
                    <Line yAxisId="r" type="monotone" dataKey="cumulative" name="Cumulative" stroke={CHART.gold} strokeWidth={2.5} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard className="lg:col-span-4" title="Completion rate" subtitle="Avg. answered per response" icon={GaugeIcon} bodyClass="flex flex-col justify-center">
                <Gauge value={stats.completionRate ?? 0} label="completed" />
                <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                  <MiniStat label="Avg. time" value={formatDuration(stats.avgCompletionTime)} />
                  <MiniStat label="Conversion" value={`${stats.conversionRate ?? 0}%`} />
                </div>
              </ChartCard>
            </div>

            {/* Bento row 2: funnel + device + weekday */}
            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              <Funnel views={stats.views} responses={stats.totalResponses} completionRate={stats.completionRate} />

              <ChartCard title="Devices" subtitle="Browser used to respond" icon={MonitorSmartphone}>
                {devices.length ? (
                  <Donut data={devices} centerValue={responses.length} centerLabel="total" />
                ) : (
                  <p className="py-8 text-center text-sm text-muted">No device data</p>
                )}
              </ChartCard>

              <ChartCard title="Busiest days" subtitle="Submissions by weekday" icon={CalendarDays}>
                <ActivityBars data={weekday} />
              </ChartCard>
            </div>

            {/* Per-question */}
            <div className="mb-3 mt-9 flex items-center gap-2">
              <h2 className="text-lg font-semibold text-fg">Question breakdown</h2>
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">{questions.length}</span>
            </div>
            {questions.length === 0 ? (
              <p className="text-sm text-muted">This form has no answerable questions.</p>
            ) : (
              <div className="grid gap-5 lg:grid-cols-2">
                {questions.map((q) => (
                  <QuestionChart key={q.id} question={q} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span className="flex items-center gap-1.5 text-muted">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl border border-default bg-surface-2/50 px-3 py-2.5">
      <p className="text-base font-bold text-fg">{value}</p>
      <p className="text-[11px] text-muted">{label}</p>
    </div>
  );
}
