import { Reveal } from "./Reveal";
import { ACCURACY } from "@/lib/content";

export function Accuracy() {
  return (
    <section className="section" id="accuracy">
      <div className="wrap">
        <div className="accuracy-grid">
          <Reveal>
            <span className="eyebrow">Accuracy</span>
            <h2 className="sec-title" style={{ marginTop: "1.1rem" }}>
              It matches <span style={{ color: "var(--coral-deep)" }}>ccusage</span>.
            </h2>
            <p className="sec-sub" style={{ gridColumn: "auto", marginTop: "1rem" }}>
              Totals are designed to line up with <span className="mono">ccusage monthly</span> for
              the same month. Cost uses the flat cache-creation rate, exactly like ccusage — the 1h
              cache tier is intentionally not applied.
            </p>
          </Reveal>
          <Reveal as="dl" className="acc-figs" delay={80}>
            {ACCURACY.map((a) => (
              <div className="acc-fig" key={a.v}>
                <dt className="v tnum">{a.v}</dt>
                <dd className="l">{a.l}</dd>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
