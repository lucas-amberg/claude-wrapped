import type { WrappedStats } from "../types.js";
import {
  FONT as F,
  LIGHT,
  WIDTH,
  HEIGHT,
  fmtCompact,
  fmtDayShort,
  fmtHour,
  fmtMoney0,
  fmtPct1,
  fmtShare,
  fmtThousands,
  type Palette,
} from "./theme.js";
import { claudeLogoImg } from "./logo.js";
import { name as pkgName } from "../../package.json";

// ---- tiny markup helpers (Satori reads inline styles) -----------------------
const esc = (t: string) =>
  String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const div = (style: string, children = "") => `<div style="${style}">${children}</div>`;
// Satori needs an explicit display on every node, including text leaves.
const txt = (style: string, t: string) => `<div style="display:flex;${style}">${esc(t)}</div>`;
const row = (style: string, children = "") =>
  div(`display:flex;flex-direction:row;${style}`, children);
const col = (style: string, children = "") =>
  div(`display:flex;flex-direction:column;${style}`, children);

// micro uppercase label (uppercased in JS so it works even where Satori ignores text-transform)
const label = (t: string, color: string, ls = 3, size = 16) =>
  txt(
    `font-family:'${F.mono}';font-weight:700;font-size:${size}px;letter-spacing:${ls}px;color:${color};text-transform:uppercase;`,
    t.toUpperCase(),
  );

export function buildCardMarkup(s: WrappedStats, theme: Palette = LIGHT): string {
  const C = theme;
  const famByModel: Record<string, string> = {
    Opus: C.famOpus,
    Sonnet: C.famSonnet,
    Haiku: C.famHaiku,
  };
  const familyColor = (m: string) => famByModel[m] ?? C.famFallback;

  const heroStat = (value: string, lbl: string, align: "flex-start" | "center" | "flex-end") =>
    col(
      `align-items:${align};`,
      txt(
        `font-family:'${F.display}';font-weight:700;font-size:49px;line-height:1;color:${C.creamOn};`,
        value,
      ) +
        txt(
          `font-family:'${F.mono}';font-weight:400;font-size:16px;letter-spacing:2px;color:${C.creamDim};margin-top:10px;text-transform:uppercase;`,
          lbl.toUpperCase(),
        ),
    );

  const projectRow = (rank: number, name: string, value: string, frac: number) => {
    const head = row(
      "align-items:baseline;justify-content:space-between;width:100%;",
      row(
        "align-items:baseline;flex:1;overflow:hidden;",
        txt(
          `font-family:'${F.display}';font-weight:700;font-size:20px;color:${C.coralDeep};width:28px;`,
          String(rank),
        ) +
          txt(
            `font-family:'${F.display}';font-weight:600;font-size:24px;color:${C.ink};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;`,
            name,
          ),
      ) +
        txt(
          `font-family:'${F.display}';font-weight:700;font-size:22px;color:${C.ink};margin-left:12px;`,
          value,
        ),
    );
    const track = div(
      `display:flex;width:100%;height:8px;border-radius:4px;background:${C.inkFaint};margin-top:8px;`,
      div(
        `display:flex;width:${Math.max(3, frac * 100).toFixed(1)}%;height:8px;border-radius:4px;background:linear-gradient(90deg,${C.coral} 0%,${C.coralDeep} 100%);`,
      ),
    );
    return col("margin-bottom:8px;", head + track);
  };

  const legendRow = (name: string, color: string, share: string) =>
    row(
      "align-items:center;width:100%;margin-bottom:10px;",
      div(
        `display:flex;width:13px;height:13px;border-radius:7px;background:${color};margin-right:11px;`,
      ) +
        txt(`font-family:'${F.display}';font-weight:600;font-size:20px;color:${C.ink};flex:1;`, name) +
        txt(
          `font-family:'${F.mono}';font-weight:700;font-size:17px;color:${C.inkSoft};`,
          share,
        ),
    );

  // ---- header ----
  const header = row(
    "align-items:center;justify-content:space-between;width:100%;",
    row(
      "align-items:center;",
      claudeLogoImg(34, C.coral, 16) + label("Claude Wrapped", C.ink, 4, 24),
    ) + label(s.monthLabel, C.coralDeep, 4, 24),
  );

  // ---- hero ----
  const hero = col(
    `background:linear-gradient(135deg,${C.heroFrom} 0%,${C.coralDeep} 100%);border-radius:32px;padding:40px 48px 38px 48px;`,
    label("Total Tokens", C.creamDim, 4, 19) +
      txt(
        `font-family:'${F.display}';font-weight:900;font-size:138px;line-height:1;letter-spacing:-4px;color:${C.creamOn};margin-top:8px;`,
        fmtCompact(s.totals.tokens),
      ) +
      div(
        `display:flex;width:100%;height:1px;background:${C.creamFaint};margin:22px 0 22px 0;`,
      ) +
      row(
        "align-items:flex-end;justify-content:space-between;width:100%;",
        heroStat(fmtMoney0(s.totals.cost), "Spent", "flex-start") +
          heroStat(fmtPct1(s.totals.cacheHitRate), "Cache hit rate", "center") +
          heroStat(fmtThousands(s.totals.messages), "Messages", "flex-end"),
      ),
  );

  // ---- middle: projects (left) + models (right) ----
  const maxCost = s.projects[0]?.cost || 1;
  const projects = col(
    `flex:1.3;background:${C.coralSoft};border:1px solid ${C.inkFaint};border-radius:24px;padding:26px 28px;`,
    label("Top Projects", C.inkSoft, 3, 16) +
      col(
        "margin-top:20px;",
        s.projects
          .map((p, i) => projectRow(i + 1, p.name, fmtMoney0(p.cost), p.cost / maxCost))
          .join(""),
      ),
  );

  const bar = row(
    "width:100%;height:22px;border-radius:11px;overflow:hidden;margin-top:18px;",
    s.models
      .filter((m) => m.share > 0)
      .map(
        (m, i) =>
          div(
            `display:flex;width:${(m.share * 100).toFixed(2)}%;min-width:6px;height:22px;background:${familyColor(m.model)};${i > 0 ? "margin-left:2px;" : ""}`,
          ),
      )
      .join(""),
  );
  const legend = col(
    "margin-top:18px;",
    s.models
      .filter((m) => m.share > 0)
      .map((m) => legendRow(m.model, familyColor(m.model), fmtShare(m.share)))
      .join(""),
  );
  const models = col(
    `flex:1;background:${C.paper};border:1px solid ${C.inkFaint};border-radius:24px;padding:26px 28px;justify-content:space-between;`,
    col("", label("Models by Spend", C.inkSoft, 3, 16) + bar + legend) +
      row(
        `align-items:flex-end;justify-content:space-between;width:100%;border-top:1px solid ${C.inkFaint};padding-top:20px;margin-top:10px;`,
        col(
          "",
          label("Active days", C.inkSoft, 2, 14) +
            txt(
              `font-family:'${F.display}';font-weight:700;font-size:29px;color:${C.ink};margin-top:6px;`,
              `${s.time.activeDays}/${s.time.daysInMonth}`,
            ),
        ) +
          col(
            "align-items:flex-end;",
            label("Streak", C.inkSoft, 2, 14) +
              txt(
                `font-family:'${F.display}';font-weight:700;font-size:29px;color:${C.coralDeep};margin-top:6px;`,
                `${s.time.longestStreakDays} days`,
              ),
          ),
      ),
  );

  const middle = row("align-items:stretch;width:100%;gap:26px;", projects + models);

  // ---- heatmap ----
  const dayLetters = ["M", "T", "W", "T", "F", "S", "S"];
  const CELL = 18;
  const GAP = 4;
  const dayCol = col(
    `margin-right:14px;`,
    dayLetters
      .map((d) =>
        txt(
          `font-family:'${F.mono}';font-weight:400;font-size:14px;color:${C.inkSoft};height:${CELL}px;align-items:center;justify-content:center;margin-bottom:${GAP}px;`,
          d,
        ),
      )
      .join(""),
  );
  const cellsCol = col(
    "flex:1;",
    s.heatmap
      .map((rowVals, ri) =>
        row(
          `margin-bottom:${GAP}px;`,
          rowVals
            .map((v, ci) => {
              const count = s.heatmapCounts[ri][ci];
              const bg =
                count > 0
                  ? `rgba(${C.heatOnRgb},${(0.16 + 0.84 * v).toFixed(3)})`
                  : C.heatOff;
              return div(
                `display:flex;flex:1;height:${CELL}px;border-radius:5px;background:${bg};${ci > 0 ? `margin-left:${GAP}px;` : ""}`,
              );
            })
            .join(""),
        ),
      )
      .join(""),
  );
  const ticks = row(
    `margin-left:39px;margin-top:12px;justify-content:space-between;`,
    ["12a", "6a", "12p", "6p", "11p"]
      .map((t) => txt(`font-family:'${F.mono}';font-weight:400;font-size:14px;color:${C.inkSoft};`, t))
      .join(""),
  );
  const heatmap = col(
    "width:100%;",
    row(
      "align-items:center;justify-content:space-between;width:100%;margin-bottom:16px;",
      label("When You Code", C.inkSoft, 3, 16) +
        label(`Peak · ${fmtHour(s.time.peakHour)}`, C.coralDeep, 2, 15),
    ) +
      row("width:100%;", dayCol + cellsCol) +
      ticks,
  );

  // ---- footer ----
  const footStat = (lbl: string, value: string, color: string = C.creamOn) =>
    col(
      "align-items:flex-end;margin-left:42px;",
      txt(
        `font-family:'${F.mono}';font-weight:400;font-size:14px;letter-spacing:2px;color:${C.creamDim};text-transform:uppercase;`,
        lbl.toUpperCase(),
      ) +
        txt(
          `font-family:'${F.display}';font-weight:700;font-size:26px;color:${color};margin-top:7px;`,
          value,
        ),
    );
  const footer = row(
    `align-items:center;justify-content:space-between;background:${C.footerInk};border-radius:26px;padding:19px 34px;`,
    row(
      "align-items:center;",
      div(
        `display:flex;width:42px;height:42px;border-radius:21px;background:linear-gradient(135deg,${C.peach},${C.coral});border:2px solid ${C.creamFaint};margin-right:18px;`,
      ) +
        col(
          "",
          txt(
            `font-family:'${F.mono}';font-weight:400;font-size:14px;letter-spacing:2px;color:${C.creamDim};text-transform:uppercase;`,
            "YOUR CODING PERSONA",
          ) +
            txt(
              `font-family:'${F.display}';font-weight:700;font-size:32px;color:${C.creamOn};margin-top:4px;`,
              s.time.persona,
            ),
        ),
    ) +
      row(
        "align-items:flex-end;",
        footStat("Peak hour", fmtHour(s.time.peakHour)) +
          footStat("Busiest day", fmtDayShort(s.time.busiestDay)) +
          footStat("Streak", `${s.time.longestStreakDays}d`, C.peach),
      ),
  );

  // ---- attribution (get-yours CTA) ----
  const attribution = row(
    "align-items:center;width:100%;padding:0 6px;gap:5px;",
    txt(
      `font-family:'${F.mono}';font-weight:400;font-size:15px;letter-spacing:0.3px;color:${C.inkSoft};`,
      "get yours by running",
    ) +
      txt(
        `font-family:'${F.mono}';font-weight:700;font-size:15px;letter-spacing:0.3px;color:${C.coral};`,
        `npx ${pkgName}`,
      ),
  );

  // ---- root ----
  return div(
    `display:flex;flex-direction:column;justify-content:space-between;width:${WIDTH}px;height:${HEIGHT}px;background:${C.cream};padding:60px;font-family:'${F.display}';`,
    header + hero + middle + heatmap + footer + attribution,
  );
}
