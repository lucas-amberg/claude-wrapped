import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";
import { HERO_STATS, PANELS, MODELS, HEAT_CELLS, PEAK_LABEL } from "@/lib/content";

const TICKS = ["12a", "6a", "12p", "6p", "11p"];

export function InsideCard() {
  return (
    <section className="section" id="inside">
      <div className="wrap">
        <SectionHead index="01" title="Inside your card">
          Every panel is computed from your real usage — no vanity metrics, just the numbers
          that tell the story of your month.
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
              <div className="split-bar" aria-hidden>
                {MODELS.map((m) => (
                  <span
                    key={m.name}
                    style={{ width: `${m.width}%`, background: `var(${m.varName})`, minWidth: 4 }}
                  />
                ))}
              </div>
              <div className="legend">
                {MODELS.map((m) => (
                  <div className="legend-row" key={m.name}>
                    <span className="dot" style={{ background: `var(${m.varName})` }} />
                    {m.name}
                    <span className="pct">{m.pct}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="motif">
              <div className="cap">
                <span>When you code</span>
                <span style={{ color: "var(--coral-deep)" }}>{PEAK_LABEL}</span>
              </div>
              <div className="heat" aria-hidden>
                {HEAT_CELLS.map((v, i) => (
                  <span
                    key={i}
                    style={{
                      background:
                        v > 0.04
                          ? `rgba(var(--heat-rgb), ${(0.14 + 0.82 * v).toFixed(3)})`
                          : "var(--hair)",
                    }}
                  />
                ))}
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
