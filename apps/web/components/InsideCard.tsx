import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";
import {
  HERO_STATS,
  PANELS,
  MODELS,
  CODEX_MODELS,
  HEAT_CELLS,
  CODEX_HEAT_CELLS,
  PEAK_LABEL,
  CODEX_PEAK_LABEL,
} from "@/lib/content";

const TICKS = ["12a", "6a", "12p", "6p", "11p"];

type Model = { name: string; pct: string; varName: string; width: number };

function ModelSplit({ label, models }: { label: string; models: readonly Model[] }) {
  return (
    <div className="split-group">
      <div className="split-label">{label}</div>
      <div className="split-bar" aria-hidden>
        {models.map((m) => (
          <span key={m.name} style={{ width: `${m.width}%`, background: `var(${m.varName})`, minWidth: 4 }} />
        ))}
      </div>
      <div className="legend">
        {models.map((m) => (
          <div className="legend-row" key={m.name}>
            <span className="dot" style={{ background: `var(${m.varName})` }} />
            {m.name}
            <span className="pct">{m.pct}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Heat({ cells, rgbVar }: { cells: number[]; rgbVar: string }) {
  return (
    <div className="heat" aria-hidden>
      {cells.map((v, i) => (
        <span
          key={i}
          style={{
            background:
              v > 0.04 ? `rgba(var(${rgbVar}), ${(0.14 + 0.82 * v).toFixed(3)})` : "var(--hair)",
          }}
        />
      ))}
    </div>
  );
}

export function InsideCard() {
  return (
    <section className="section" id="inside">
      <div className="wrap">
        <SectionHead index="01" title="Inside your card">
          Every panel is computed from your real usage across both agents — no vanity metrics,
          just the numbers that tell the story of your month.
        </SectionHead>

        <Reveal>
          <div className="statband">
            {HERO_STATS.map((s) => (
              <div className="statcell" key={s.lab}>
                <div className="stat-num tnum">{s.num}</div>
                <div className="stat-lab">{s.lab}</div>
                <div className="stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="inside-grid">
          <Reveal as="dl" className="panel-list">
            {PANELS.map((p) => (
              <div className="panel-row" key={p.term}>
                <dt>{p.term}</dt>
                <dd>{p.desc}</dd>
              </div>
            ))}
          </Reveal>

          <Reveal delay={80}>
            <div className="motif">
              <div className="cap">
                <span>Models by spend</span>
              </div>
              <ModelSplit label="Claude" models={MODELS} />
              <ModelSplit label="Codex" models={CODEX_MODELS} />
            </div>

            <div className="motif">
              <div className="cap">
                <span>When you code</span>
              </div>
              <div className="heat-block">
                <div className="heat-sub">
                  <span>Claude</span>
                  <span style={{ color: "var(--coral-deep)" }}>{PEAK_LABEL}</span>
                </div>
                <Heat cells={HEAT_CELLS} rgbVar="--heat-rgb" />
              </div>
              <div className="heat-block">
                <div className="heat-sub">
                  <span>Codex</span>
                  <span style={{ color: "var(--codex-deep)" }}>{CODEX_PEAK_LABEL}</span>
                </div>
                <Heat cells={CODEX_HEAT_CELLS} rgbVar="--codex-heat-rgb" />
              </div>
              <div className="heat-ticks" aria-hidden>
                {TICKS.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
