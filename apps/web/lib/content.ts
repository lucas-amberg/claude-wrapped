// Static content for the landing page. Headline figures mirror the sample card
// fixtures in apps/cli/dev/sample-data.ts (SAMPLE_STATS + SAMPLE_STATS_CODEX) —
// keep them in sync when those change. Kept impersonal here (no repo names).

// Published npm package name — single source for the npm link, every install
// command below, and the terminal-bar label in Install.tsx.
export const PKG = "claude-wrapped-cli";

export const REPO_URL = "https://github.com/lucas-amberg/claude-wrapped";
export const NPM_URL = `https://www.npmjs.com/package/${PKG}`;

// Canonical install command — the one the copy button writes to the clipboard.
export const INSTALL_CMD = `npx ${PKG}`;

// Combined headline figures (Claude 1.94B/$1,480 + Codex 1.01B/$784 → 2.95B/$2,264).
export const HERO_STATS = [
  { num: "2.95B", lab: "Total tokens", sub: "Claude Code + Codex" },
  { num: "$2,264", lab: "Spent", sub: "computed from LiteLLM pricing" },
  { num: "95%", lab: "Cache hit rate", sub: "served from cache" },
  { num: "12-day", lab: "Longest streak", sub: "your best run this month" },
] as const;

export const PANELS: { term: string; desc: string }[] = [
  { term: "Two agents, one card", desc: "Claude Code and Codex side by side — or a standalone card for either with --claude / --codex." },
  { term: "Total tokens", desc: "Everything you ran through both agents this month, headlined." },
  { term: "Spend", desc: "Real cost from per-model LiteLLM pricing — Anthropic and OpenAI rates, computed not estimated." },
  { term: "Top projects", desc: "Your biggest repos by spend, with worktrees rolled into the parent." },
  { term: "Model split", desc: "How spend divides across Opus/Sonnet/Haiku and the GPT-5 family." },
  { term: "When you code", desc: "A 7×24 heatmap of your week per agent, peak hour called out." },
  { term: "Coding persona", desc: "Night Owl, Early Bird, Daylight Coder, or Evening Hacker." },
];

// Claude model split (coral) — mirrors the sample Claude card.
export const MODELS = [
  { name: "Opus", pct: "70%", varName: "--fam-opus", width: 70 },
  { name: "Sonnet", pct: "27%", varName: "--fam-sonnet", width: 27 },
  { name: "Haiku", pct: "3%", varName: "--fam-haiku", width: 3 },
] as const;

// Codex model split (cyan) — mirrors the sample Codex card.
export const CODEX_MODELS = [
  { name: "GPT-5.6 Sol", pct: "65%", varName: "--fam-gpt1", width: 65 },
  { name: "GPT-5.6 Luna", pct: "27%", varName: "--fam-gpt2", width: 27 },
  { name: "GPT-5.5", pct: "8%", varName: "--fam-gpt3", width: 8 },
] as const;

export const BUILT = [
  {
    k: "Private by default",
    h: "Nothing leaves your machine",
    p: "It reads your local logs and renders the PNG offline. The only network call is a price table — and --offline skips that too.",
  },
  {
    k: "Real pricing",
    h: "Costs, not guesses",
    p: "Spend is computed from per-model LiteLLM rates for both Anthropic and OpenAI models.",
  },
  {
    k: "Zero setup",
    h: "One self-contained binary",
    p: "Node 18 and nothing else. Fonts and a pricing fallback are embedded, so the first run just works — even on a plane.",
  },
] as const;

export const STEPS = [
  { n: "01", h: "Load", p: "Streams your local logs line-by-line and dedups resumed sessions — for both agents.", tag: "~/.claude · ~/.codex" },
  { n: "02", h: "Price", p: "Fetches the LiteLLM price table — cached 24h, with a bundled fallback for offline.", tag: "LiteLLM · cached" },
  { n: "03", h: "Aggregate", p: "Totals, cache rate, top projects, model split, peak hour, persona and streaks — in your timezone.", tag: "WrappedStats" },
  { n: "04", h: "Render", p: "Satori turns flexbox into SVG; resvg rasterizes a crisp PNG with fonts embedded.", tag: "Satori → resvg" },
] as const;

export const TABS = {
  npx: [
    { p: "$", t: ` npx ${PKG}`, c: "" },
    { p: "", t: "", c: "# both agents → one combined card, then opens it" },
    { p: "", t: "", c: "" },
    { p: "$", t: ` npx ${PKG}`, c: " --codex --dark" },
  ],
  npm: [
    { p: "$", t: ` npm i -g ${PKG}`, c: "" },
    { p: "$", t: ` ${PKG}`, c: " --claude --month 2026-05" },
  ],
  bun: [
    { p: "$", t: ` bun add -g ${PKG}`, c: "" },
    { p: "$", t: ` ${PKG}`, c: " --offline" },
  ],
} as const;

export const OPTIONS: { flag: string; desc: string }[] = [
  { flag: "--claude", desc: "Only track Claude Code — a standalone card." },
  { flag: "--codex", desc: "Only track Codex — a standalone card." },
  { flag: "--month <YYYY-MM>", desc: "Month to summarize. Defaults to the current month." },
  { flag: "--output <path>", desc: "Where to save the PNG. Defaults to ~/Desktop." },
  { flag: "--timezone <iana>", desc: "Timezone for date grouping. Defaults to system local." },
  { flag: "--dark", desc: "Render the near-black dark theme." },
  { flag: "--offline", desc: "Use cached/bundled pricing — no network." },
  { flag: "--scale <n>", desc: "Render scale. 2× → a crisp high-res PNG." },
  { flag: "--no-open", desc: "Don't open the image after saving." },
  { flag: "--json", desc: "Print the computed stats as JSON to stdout." },
];

export const PERSONAS = [
  { emoji: "🦉", name: "Night Owl", when: "Peaks after midnight", p: "The repo is quietest exactly when you ship." },
  { emoji: "🐤", name: "Early Bird", when: "Dawn commits", p: "First pull request in before the standup." },
  { emoji: "☀️", name: "Daylight Coder", when: "Peak · 1 PM", p: "Locked in through the afternoon stretch." },
  { emoji: "🌙", name: "Evening Hacker", when: "After dinner", p: "Comes alive for golden-hour debugging." },
] as const;

export const FAQ = [
  {
    q: "Does it track both Claude Code and Codex?",
    a: "Yes. By default it reads both and renders one combined card. Pass --claude or --codex for a standalone card, or if you only use one agent it renders that one automatically.",
  },
  {
    q: "Does it upload my data anywhere?",
    a: "No. It reads your local ~/.claude/projects and ~/.codex/sessions logs and renders a PNG on your machine. The only network request is the LiteLLM price table — and --offline skips even that.",
  },
  {
    q: "How are the numbers computed?",
    a: "Tokens are read straight from your local logs, and cost comes from per-model LiteLLM pricing for both Anthropic and OpenAI models. Nothing is estimated; Codex models not in the table show $0.",
  },
  {
    q: "What about timezones?",
    a: "It groups by your system-local timezone so “your May” is genuinely your local May. Prefer UTC? Pass --timezone UTC.",
  },
  {
    q: "What do I need installed?",
    a: "Node 18 or newer. That's it — the fonts and a pricing fallback are bundled into the binary, so there's nothing else to set up.",
  },
  {
    q: "Where do my logs live?",
    a: "Claude in ~/.claude and Codex in ~/.codex by default. If yours are elsewhere, set CLAUDE_CONFIG_DIR and/or CODEX_HOME and it'll read from there.",
  },
] as const;

// --- "when you code" heatmaps (deterministic → no hydration drift) -----------
const hour12 = (h: number) => `${h % 12 || 12} ${h < 12 ? "AM" : "PM"}`;

function heatCells(peak: number, weekendMix = 0.5): number[] {
  const cells: number[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const dist = Math.abs(hour - peak);
      const wave = Math.max(0, 1 - dist / 8);
      const weekend = day >= 5 ? weekendMix : 1;
      const texture = 0.55 + 0.45 * Math.sin((hour + day * 3) * 1.27);
      cells.push(Math.max(0, Math.min(1, wave * weekend * texture)));
    }
  }
  return cells;
}

// Claude — night owl (peak 10 PM). Codex — daylight coder (peak 1 PM).
export const PEAK_HOUR = 22;
export const PEAK_LABEL = `Peak · ${hour12(PEAK_HOUR)}`;
export const HEAT_CELLS = heatCells(PEAK_HOUR);

export const CODEX_PEAK_HOUR = 13;
export const CODEX_PEAK_LABEL = `Peak · ${hour12(CODEX_PEAK_HOUR)}`;
export const CODEX_HEAT_CELLS = heatCells(CODEX_PEAK_HOUR);
