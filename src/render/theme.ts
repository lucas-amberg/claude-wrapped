// Design tokens + value formatters shared by the mockup and the Satori renderer.

export const WIDTH = 1080;
export const HEIGHT = 1350; // 4:5 portrait

export const COLOR = {
  cream: "#FAF9F5",
  paper: "#F3EEE3", // slightly warmer panel tint
  ink: "#2A1E16",
  inkSoft: "rgba(42,30,22,0.55)",
  inkFaint: "rgba(42,30,22,0.08)",
  coral: "#D97757",
  coralDeep: "#C2562F",
  coralSoft: "rgba(217,119,87,0.10)",
  peach: "#F0B49A",
  cocoa: "#8A4B2F",
  creamOn: "#FFFDF9",
  creamDim: "rgba(255,251,245,0.72)",
  creamFaint: "rgba(255,251,245,0.26)",
  footerInk: "#241A12",
} as const;

export type Palette = { [K in keyof typeof COLOR]: string } & {
  heroFrom: string; // hero gradient start (lighter coral)
  heatOnRgb: string; // "R,G,B" triple used inside rgba(...)
  heatOff: string; // full color for empty heatmap cells
  famOpus: string;
  famSonnet: string;
  famHaiku: string;
  famFallback: string;
  pngBg: string; // resvg background + mockup page bg
};

export const LIGHT: Palette = {
  ...COLOR,
  heroFrom: "#E58A63",
  heatOnRgb: "217,119,87",
  heatOff: "rgba(42,30,22,0.05)",
  famOpus: COLOR.coral,
  famSonnet: COLOR.peach,
  famHaiku: COLOR.cocoa,
  famFallback: COLOR.coralDeep,
  pngBg: COLOR.cream, // #FAF9F5 — unchanged
};

// Warm near-black: brand-family dark (warm brown-tinted blacks, warm-cream text, coral kept)
export const DARK: Palette = {
  cream: "#181210", // root bg — warm near-black
  paper: "#241B16", // raised panel (models) — lifts off root
  ink: "#F4EBE1", // primary text — warm cream
  inkSoft: "rgba(244,235,225,0.58)", // secondary text/labels
  inkFaint: "rgba(244,235,225,0.12)", // borders + project-track bg
  coral: "#E08A66", // lifted coral so accents pop on dark
  coralDeep: "#C2562F", // kept — rich hero gradient end
  coralSoft: "rgba(224,138,102,0.12)", // projects panel wash
  peach: "#F2BFA4", // Sonnet dot + footer streak accent
  cocoa: "#C98A63", // lifted (legacy ref; Haiku now uses famHaiku)
  creamOn: "#FFFDF9", // light text on coral hero / footer (kept)
  creamDim: "rgba(255,251,245,0.72)", // kept
  creamFaint: "rgba(255,251,245,0.26)", // kept
  footerInk: "#0F0B09", // darkest surface — anchors the footer band
  heroFrom: "#E58A63", // hero stays a bright coral gradient
  heatOnRgb: "224,138,102", // active heat = lifted coral rgb
  heatOff: "rgba(244,235,225,0.06)", // empty cells: faint light-on-dark
  famOpus: "#E08A66",
  famSonnet: "#F2BFA4",
  famHaiku: "#D69B72", // cocoa is illegible on dark → lighter tan, distinct from coral/peach
  famFallback: "#C2562F",
  pngBg: "#181210", // == DARK.cream
};

export type ThemeName = "light" | "dark";
export const themeFor = (n: ThemeName): Palette => (n === "dark" ? DARK : LIGHT);

export const FONT = {
  display: "Poppins",
  mono: "Space Mono",
} as const;

const MONTHS_SHORT = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

/** 2.88B / 437M / 26.9K */
export function fmtCompact(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(0) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
}

/** 26.9K (always K for thousands, 1 decimal) */
export function fmtThousands(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
}

/** $2,201 (rounded, grouped) */
export function fmtMoney0(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

/** 95.9% */
export function fmtPct1(n: number): string {
  return (n * 100).toFixed(1) + "%";
}

/** 96% / 3% / <1% for model shares */
export function fmtShare(n: number): string {
  const p = n * 100;
  if (p > 0 && p < 1) return "<1%";
  return Math.round(p) + "%";
}

/** 15 -> "3 PM" */
export function fmtHour(h: number): string {
  const ampm = h < 12 ? "AM" : "PM";
  let hh = h % 12;
  if (hh === 0) hh = 12;
  return `${hh} ${ampm}`;
}

/** "2026-05-08" -> "MAY 8" */
export function fmtDayShort(iso: string): string {
  const [, m, d] = iso.split("-");
  const mi = parseInt(m, 10) - 1;
  return `${MONTHS_SHORT[mi] ?? ""} ${parseInt(d, 10)}`;
}
