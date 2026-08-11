/**
 * Decorative corner motif for the dashboard cards: a single clean striped
 * quarter-fan (concentric rings) radiating from the bottom-right corner.
 * One coherent shape per card — no overlapping elements — tinted to `color`.
 *
 * SVG angle convention: 0°=right, 90°=down. A quarter fan filling the up-left
 * quadrant from the corner sweeps 180°→270°.
 */

const rad = (deg) => (deg * Math.PI) / 180;
const pt = (cx, cy, r, deg) => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))];

/** Concentric striped rings (annular sectors), fading inner→outer. */
function Fan({ cx, cy, max, bands, from = 180, to = 270, color, base = 0.85, min = 0.3 }) {
  const step = max / bands;
  const out = [];
  for (let i = 0; i < bands; i++) {
    const ri = step * i;
    const ro = step * (i + 1);
    const [ax, ay] = pt(cx, cy, ri, from);
    const [bx, by] = pt(cx, cy, ro, from);
    const [ex, ey] = pt(cx, cy, ro, to);
    const [dx, dy] = pt(cx, cy, ri, to);
    const d =
      ri === 0
        ? `M ${cx} ${cy} L ${bx} ${by} A ${ro} ${ro} 0 0 1 ${ex} ${ey} Z`
        : `M ${ax} ${ay} L ${bx} ${by} A ${ro} ${ro} 0 0 1 ${ex} ${ey} L ${dx} ${dy} A ${ri} ${ri} 0 0 0 ${ax} ${ay} Z`;
    // Stronger inner band → soft outer edge.
    const t = bands > 1 ? i / (bands - 1) : 0;
    const opacity = base - t * (base - min);
    out.push(<path key={i} d={d} fill={color} opacity={opacity} />);
  }
  return <g>{out}</g>;
}

// Per-variant band count / radius for subtle variety between cards.
const SHAPES = {
  a: { bands: 5, max: 116 },
  b: { bands: 6, max: 128 },
  c: { bands: 4, max: 104 },
  d: { bands: 5, max: 120 },
  e: { bands: 7, max: 132 },
};

export function CardDecor({ variant = "a", color = "#bfa23a", className }) {
  const svg = { className, viewBox: "0 0 170 170", width: "170", height: "170" };
  const C = 170;

  if (variant === "hero") {
    // Same striped fan, drawn in translucent white for the dark green card.
    return (
      <svg {...svg}>
        <Fan cx={C} cy={C} max={124} bands={6} color="#ffffff" base={0.22} min={0.05} />
      </svg>
    );
  }

  const { bands, max } = SHAPES[variant] || SHAPES.a;
  return (
    <svg {...svg}>
      <Fan cx={C} cy={C} max={max} bands={bands} color={color} />
    </svg>
  );
}
