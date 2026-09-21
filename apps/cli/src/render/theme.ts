// Design tokens + value formatters shared by the mockup and the Satori renderer.
import type { Provider } from "../types.js";
export type { Provider };

export const WIDTH = 1080;
export const HEIGHT = 1350; // 4:5 portrait (single card)
export const COMBINED_WIDTH = 1080; // combined card is width-only (Satori auto-heights)

export type ThemeName = "light" | "dark";

export interface Palette {
  provider: Provider;
  // surfaces + text (neutral, shared across providers for a given mode)
  bg: string; // card root background
  paper: string; // raised panel (models)
  ink: string; // primary text
  inkSoft: string; // secondary text / labels
  inkFaint: string; // borders + track backgrounds
  heatOff: string; // empty heatmap cell
  pngBg: string; // resvg background + mockup page bg (== bg)
  // black is the MAIN color: hero + footer bands, and the text that sits on them
  heroFrom: string; // hero gradient start (near-black)
  heroTo: string; // hero gradient end (black)
  footerInk: string; // footer band
  creamOn: string; // text on black
  creamDim: string; // secondary text on black
  creamFaint: string; // hairlines on black
  // brand accent (provider-specific)
  accent: string; // bright accent — logo, dots, active heat
  accentDeep: string; // deeper accent — accent-colored text + bar gradient end
  accentSoft: string; // faint accent wash — projects panel
  accentLight: string; // lightest accent — footer streak + avatar gradient start
  accentOnRgb: string; // "R,G,B" triple for heatmap rgba() fills
  // model-family color ramp, assigned by cost rank
  fam: string[];
  famFallback: string;
}

// --- neutral base per mode (black hero/footer are the same for both agents) --
type Base = Omit<
  Palette,
  | "provider"
  | "accent"
  | "accentDeep"
  | "accentSoft"
  | "accentLight"
  | "accentOnRgb"
  | "fam"
  | "famFallback"
>;

const BASE: Record<ThemeName, Base> = {
  light: {
    bg: "#FAF9F5",
    paper: "#F3EEE3",
    ink: "#2A1E16",
    inkSoft: "rgba(42,30,22,0.55)",
    inkFaint: "rgba(42,30,22,0.08)",
    heatOff: "rgba(42,30,22,0.05)",
    pngBg: "#FAF9F5",
    heroFrom: "#26221F", // near-black, faint warmth
    heroTo: "#050403",
    footerInk: "#0C0A09",
    creamOn: "#FFFDF9",
    creamDim: "rgba(255,251,245,0.72)",
    creamFaint: "rgba(255,251,245,0.20)",
  },
  dark: {
    bg: "#1B1A19", // page lifts slightly so the black hero reads as a deep well
    paper: "#262422",
    ink: "#F4EBE1",
    inkSoft: "rgba(244,235,225,0.58)",
    inkFaint: "rgba(244,235,225,0.12)",
    heatOff: "rgba(244,235,225,0.06)",
    pngBg: "#1B1A19",
    heroFrom: "#0C0B0A",
    heroTo: "#000000",
    footerInk: "#000000",
    creamOn: "#FFFDF9",
    creamDim: "rgba(255,251,245,0.72)",
    creamFaint: "rgba(255,251,245,0.16)",
  },
};

// --- brand accent per provider + mode ----------------------------------------
type Accent = Pick<
  Palette,
  "accent" | "accentDeep" | "accentSoft" | "accentLight" | "accentOnRgb" | "fam" | "famFallback"
>;

const ACCENT: Record<Provider, Record<ThemeName, Accent>> = {
  claude: {
    light: {
      accent: "#D97757",
      accentDeep: "#C2562F",
      accentSoft: "rgba(217,119,87,0.10)",
      accentLight: "#F0B49A",
      accentOnRgb: "217,119,87",
      fam: ["#D97757", "#F0B49A", "#8A4B2F", "#C2562F", "#E9A488"],
      famFallback: "#C2562F",
    },
    dark: {
      accent: "#E08A66",
      accentDeep: "#C2562F",
      accentSoft: "rgba(224,138,102,0.14)",
      accentLight: "#F2BFA4",
      accentOnRgb: "224,138,102",
      fam: ["#E08A66", "#F2BFA4", "#D69B72", "#C2562F", "#E9A488"],
      famFallback: "#C2562F",
    },
  },
  codex: {
    light: {
      accent: "#38BDF8", // electric cyan
      accentDeep: "#0369A1", // legible cyan-blue for text on cream
      accentSoft: "rgba(56,189,248,0.10)",
      accentLight: "#7DD3FC",
      accentOnRgb: "56,189,248",
      fam: ["#38BDF8", "#0EA5E9", "#7DD3FC", "#0369A1", "#22D3EE"],
      famFallback: "#0284C7",
    },
    dark: {
      accent: "#56C7F7",
      accentDeep: "#0EA5E9",
      accentSoft: "rgba(86,199,247,0.14)",
      accentLight: "#7DD3FC",
      accentOnRgb: "86,199,247",
      fam: ["#56C7F7", "#0EA5E9", "#7DD3FC", "#38BDF8", "#22D3EE"],
      famFallback: "#0EA5E9",
    },
  },
};

/** Build the palette for a given agent + light/dark mode. Black is the main color; accent is the brand tint. */
export function themeFor(provider: Provider, mode: ThemeName): Palette {
  return { provider, ...BASE[mode], ...ACCENT[provider][mode] };
}

// Claude palettes kept as named exports (sample rendering, tests, back-compat).
export const LIGHT: Palette = themeFor("claude", "light");
export const DARK: Palette = themeFor("claude", "dark");

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
