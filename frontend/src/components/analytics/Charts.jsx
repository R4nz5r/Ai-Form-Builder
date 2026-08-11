import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { CHART, CHART_PALETTE, tooltipStyle } from "../../lib/charts.js";
import { shade, hexToRgba } from "../../lib/utils.js";

const HEAT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HEAT_HOURS = ["12a", "", "4a", "", "8a", "", "12p", "", "4p", "", "8p", ""];

/** Weekday × time-of-day activity heatmap (data: {day 0-6, hour 0-23, count}). */
export function Heatmap({ data = [], color = CHART.teal }) {
  const matrix = Array.from({ length: 7 }, () => Array(12).fill(0));
  data.forEach(({ day, hour, count }) => {
    if (day >= 0 && day < 7) matrix[day][Math.floor(hour / 2)] += count;
  });
  const max = Math.max(1, ...matrix.flat());

  return (
    <div>
      <div className="space-y-1.5">
        {matrix.map((row, d) => (
          <div key={d} className="flex items-center gap-1.5">
            <span className="w-8 shrink-0 text-[11px] text-muted">{HEAT_DAYS[d]}</span>
            {row.map((c, h) => (
              <div
                key={h}
                title={`${HEAT_DAYS[d]} ${h * 2}:00 — ${c} response${c === 1 ? "" : "s"}`}
                className="h-6 flex-1 rounded-[5px] transition-transform hover:scale-110"
                style={{ background: c ? hexToRgba(color, 0.14 + 0.86 * (c / max)) : "var(--surface-2)" }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5 pl-[2.6rem]">
        {HEAT_HOURS.map((h, i) => (
          <span key={i} className="flex-1 text-center text-[9px] text-muted">{h}</span>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-muted">
        <span>Less</span>
        {[0.16, 0.4, 0.65, 0.9].map((o) => (
          <span key={o} className="h-3 w-5 rounded-[3px]" style={{ background: hexToRgba(color, o) }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

/** Semicircle gauge drawn as SVG with a gradient arc (reliable + premium). */
export function Gauge({ value = 0, suffix = "%", label, from = "#34b8a3", to = "#0c8b7c" }) {
  const pct = Math.min(100, Math.max(0, value)) / 100;
  const R = 82;
  const cx = 100;
  const cy = 96;
  const sw = 16;
  const circ = Math.PI * R;
  const arc = `M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`;

  return (
    <div className="relative mx-auto w-full" style={{ maxWidth: 230 }}>
      <svg viewBox="0 0 200 116" className="w-full">
        <defs>
          <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <path d={arc} fill="none" stroke="var(--surface-2)" strokeWidth={sw} strokeLinecap="round" />
        <path
          d={arc}
          fill="none"
          stroke="url(#gauge-grad)"
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={`${pct * circ} ${circ}`}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-1 text-center">
        <p className="text-3xl font-bold tracking-tight text-fg">
          {Math.round(value)}
          <span className="text-lg">{suffix}</span>
        </p>
        {label && <p className="text-xs text-muted">{label}</p>}
      </div>
    </div>
  );
}

/** Donut with a side legend and an optional center total. */
export function Donut({ data, centerLabel, centerValue }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <div className="flex items-center gap-4">
      <div className="relative h-[150px] w-[150px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {data.map((_, i) => {
                const base = CHART_PALETTE[i % CHART_PALETTE.length];
                return (
                  <linearGradient key={i} id={`donut-${i}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={shade(base, 16)} />
                    <stop offset="100%" stopColor={shade(base, -12)} />
                  </linearGradient>
                );
              })}
            </defs>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={50}
              outerRadius={72}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={`url(#donut-${i})`} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        {centerValue != null && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-fg">{centerValue}</span>
            {centerLabel && <span className="text-[10px] text-muted">{centerLabel}</span>}
          </div>
        )}
      </div>
      <ul className="flex-1 space-y-2">
        {data.map((d, i) => {
          const pct = Math.round((d.value / total) * 100);
          return (
            <li key={d.label} className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: CHART_PALETTE[i % CHART_PALETTE.length] }} />
              <span className="flex-1 truncate text-fg">{d.label}</span>
              <span className="font-medium text-muted">{d.value}</span>
              <span className="w-9 text-right text-xs text-muted">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Vertical bar chart that highlights the peak bar in gold. */
export function ActivityBars({ data, dataKey = "count", xKey = "day", height = 200 }) {
  const max = Math.max(...data.map((d) => d[dataKey]), 0);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ left: -18, right: 4, top: 6 }}>
        <defs>
          <linearGradient id="bars-teal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART.tealLight} />
            <stop offset="100%" stopColor={CHART.teal} />
          </linearGradient>
          <linearGradient id="bars-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART.goldLight} />
            <stop offset="100%" stopColor={CHART.gold} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis dataKey={xKey} stroke="var(--fg-muted)" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} stroke="var(--fg-muted)" fontSize={11} width={32} tickLine={false} axisLine={false} />
        <Tooltip cursor={{ fill: "var(--surface-2)" }} contentStyle={tooltipStyle} />
        <Bar dataKey={dataKey} radius={[6, 6, 0, 0]} barSize={26}>
          {data.map((d, i) => (
            <Cell key={i} fill={d[dataKey] === max && max > 0 ? "url(#bars-gold)" : "url(#bars-teal)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Ranked horizontal bars (à la "session by country"). */
export function RankedBars({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className="space-y-3.5">
      {data.map((d, i) => (
        <li key={d.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium text-fg">
              {d.icon && <d.icon className="h-4 w-4 text-muted" />}
              {d.label}
            </span>
            <span className="text-muted">
              <span className="font-semibold text-fg">{d.value}</span>
              <span className="ml-1.5 text-xs">{Math.round((d.value / max) * 100)}%</span>
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full"
              style={{ width: `${(d.value / max) * 100}%`, background: CHART_PALETTE[i % CHART_PALETTE.length] }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
