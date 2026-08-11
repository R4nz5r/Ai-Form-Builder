/**
 * Form "themes". Public forms are always a clean light surface; the theme now
 * selects the accent fallback and the style of the bauhaus illustration shown
 * on the right side of the split layout. `primaryColor` overrides the accent.
 */
const LIGHT = { page: "bg-[#fafafa] text-slate-900", card: "bg-white", font: "font-sans" };

export const FORM_THEMES = {
  minimal: {
    ...LIGHT,
    label: "Minimal",
    accent: "#334155",
    art: "arcs",
    preview: "linear-gradient(135deg,#f8fafc,#e2e8f0)",
  },
  modern: {
    ...LIGHT,
    label: "Modern",
    accent: "#0c8b7c",
    art: "fans",
    preview: "linear-gradient(135deg,#ecfdf8,#cdeee6)",
  },
  corporate: {
    ...LIGHT,
    label: "Editorial",
    accent: "#1e3a8a",
    art: "grid",
    preview: "linear-gradient(135deg,#eef2fb,#d4def4)",
  },
  gradient: {
    ...LIGHT,
    label: "Vibrant",
    accent: "#7c3aed",
    art: "waves",
    preview: "linear-gradient(135deg,#f3edff,#dcd0fb)",
  },
  dark: {
    ...LIGHT,
    label: "Bold",
    accent: "#b45309",
    art: "blocks",
    preview: "linear-gradient(135deg,#fdf2e6,#f6dcc0)",
  },
  glassmorphism: {
    ...LIGHT,
    label: "Soft",
    accent: "#0891b2",
    art: "scatter",
    preview: "linear-gradient(135deg,#e8fbff,#c7eef7)",
  },
};

export const THEME_LIST = Object.entries(FORM_THEMES).map(([id, t]) => ({ id, ...t }));

export function getTheme(id) {
  return FORM_THEMES[id] || FORM_THEMES.modern;
}
