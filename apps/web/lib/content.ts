// Static content for the landing page. Headline figures (HERO_STATS, MODELS,
// PEAK_HOUR) mirror the sample card fixture `SAMPLE_STATS` in
// apps/cli/dev/sample-data.ts — keep them in sync when it changes (kept
// impersonal here — no repo names as site copy).

// Published npm package name — single source for the npm link, every install
// command below, and the terminal-bar label in Install.tsx.
export const PKG = "claude-wrapped-cli";

export const REPO_URL = "https://github.com/lucas-amberg/claude-wrapped";
export const NPM_URL = `https://www.npmjs.com/package/${PKG}`;

// Canonical install command — the one the copy button writes to the clipboard.
export const INSTALL_CMD = `npx ${PKG}`;

export const HERO_STATS = [
  { num: "1.94B", lab: "Total tokens", sub: "across 18.2K messages" },
  { num: "$1,480", lab: "Spent", sub: "computed from LiteLLM pricing" },
  { num: "94.0%", lab: "Cache hit rate", sub: "served from cache" },
  { num: "27/31", lab: "Active days", sub: "12-day longest streak" },
] as const;

export const PANELS: { term: string; desc: string }[] = [
  { term: "Total tokens", desc: "Everything you ran through Claude Code this month, headlined." },
  { term: "Spend", desc: "Real cost from per-model LiteLLM pricing — computed, not estimated." },
  { term: "Top projects", desc: "Your biggest repos by spend, with worktrees rolled into the parent." },
  { term: "Model split", desc: "How spend divides across Opus, Sonnet, and Haiku." },
  { term: "When you code", desc: "A 7×24 heatmap of your week, peak hour called out." },
  { term: "Coding persona", desc: "Night Owl, Early Bird, Daylight Coder, or Evening Hacker." },
];

export const MODELS = [
  { name: "Opus", pct: "70%", varName: "--fam-opus", width: 70 },
  { name: "Sonnet", pct: "27%", varName: "--fam-sonnet", width: 27 },
  { name: "Haiku", pct: "3%", varName: "--fam-haiku", width: 3 },
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
    p: "Spend is computed from per-model LiteLLM rates — the prices Anthropic actually bills.",
  },
  {
    k: "Zero setup",
    h: "One self-contained binary",
    p: "Node 18 and nothing else. Fonts and a pricing fallback are embedded, so the first run just works — even on a plane.",
  },
] as const;

export const STEPS = [
  { n: "01", h: "Load", p: "Streams every *.jsonl under ~/.claude/projects line-by-line and dedups resumed sessions.", tag: "~/.claude/projects" },
  { n: "02", h: "Price", p: "Fetches the LiteLLM price table — cached 24h, with a bundled fallback for offline.", tag: "LiteLLM · cached" },
  { n: "03", h: "Aggregate", p: "Totals, cache rate, top projects, model split, peak hour, persona and streaks — in your timezone.", tag: "WrappedStats" },
  { n: "04", h: "Render", p: "Satori turns flexbox into SVG; resvg rasterizes a crisp 2160×2700 PNG with fonts embedded.", tag: "Satori → resvg" },
] as const;

export const TABS = {
  npx: [
    { p: "$", t: ` npx ${PKG}`, c: "" },
    { p: "", t: "", c: "# current month → ~/Desktop, then opens it" },
    { p: "", t: "", c: "" },
    { p: "$", t: ` npx ${PKG}`, c: " --month 2026-05 --dark" },
  ],
  npm: [
    { p: "$", t: ` npm i -g ${PKG}`, c: "" },
    { p: "$", t: ` ${PKG}`, c: " --month 2026-05" },
  ],
  bun: [
    { p: "$", t: ` bun add -g ${PKG}`, c: "" },
    { p: "$", t: ` ${PKG}`, c: " --offline" },
  ],
} as const;

export const OPTIONS: { flag: string; desc: string }[] = [
  { flag: "--month <YYYY-MM>", desc: "Month to summarize. Defaults to the current month." },
  { flag: "--output <path>", desc: "Where to save the PNG. Defaults to ~/Desktop." },
  { flag: "--timezone <iana>", desc: "Timezone for date grouping. Defaults to system local." },
  { flag: "--dark", desc: "Render the warm near-black dark theme." },
  { flag: "--offline", desc: "Use cached/bundled pricing — no network." },
  { flag: "--scale <n>", desc: "Render scale. 2× → a crisp 2160×2700 PNG." },
  { flag: "--no-open", desc: "Don't open the image after saving." },
  { flag: "--json", desc: "Print the computed stats as JSON to stdout." },
];

export const PERSONAS = [
  { emoji: "🦉", name: "Night Owl", when: "Peaks after midnight", p: "The repo is quietest exactly when you ship." },
  { emoji: "🐤", name: "Early Bird", when: "Dawn commits", p: "First pull request in before the standup." },
  { emoji: "☀️", name: "Daylight Coder", when: "Peak · 4 PM", p: "Locked in through the afternoon stretch." },
  { emoji: "🌙", name: "Evening Hacker", when: "After dinner", p: "Comes alive for golden-hour debugging." },
] as const;

export const FAQ = [
  {
    q: "Does it upload my data anywhere?",
    a: "No. It reads your local ~/.claude/projects logs and renders a PNG on your machine. The only network request is the LiteLLM price table — and --offline skips even that.",
  },
  {
    q: "How are the numbers computed?",
    a: "Tokens are read straight from your local logs, and cost comes from per-model LiteLLM pricing — the rates Anthropic actually bills. Nothing is estimated.",
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
    q: "Where does my Claude config live?",
    a: "It looks in ~/.claude by default. If yours is elsewhere, set the CLAUDE_CONFIG_DIR environment variable and it'll read from there.",
  },
] as const;

// The sample card's peak coding hour (24h). Single source for both the heatmap
// wave below and InsideCard's caption, so the two can never disagree.
export const PEAK_HOUR = 22;
const hour12 = (h: number) => `${h % 12 || 12} ${h < 12 ? "AM" : "PM"}`;
export const PEAK_LABEL = `Peak · ${hour12(PEAK_HOUR)}`; // 22 → "Peak · 10 PM"

// Deterministic 7×24 "when you code" heatmap (no Math.random → no hydration drift).
// Wave peaking at PEAK_HOUR on weekdays, echoing the card's Night-Owl motif.
// Computed once at module load since the values are static.
function heatCells(): number[] {
  const cells: number[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const dist = Math.abs(hour - PEAK_HOUR);
      const wave = Math.max(0, 1 - dist / 8);
      const weekend = day >= 5 ? 0.5 : 1;
      const texture = 0.55 + 0.45 * Math.sin((hour + day * 3) * 1.27);
      cells.push(Math.max(0, Math.min(1, wave * weekend * texture)));
    }
  }
  return cells;
}

export const HEAT_CELLS = heatCells();
