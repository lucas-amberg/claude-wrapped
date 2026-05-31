import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";
import { STEPS } from "@/lib/content";

export function HowItWorks() {
  return (
    <section className="section" id="how">
      <div className="wrap">
        <SectionHead index="03" title="How it works">
          Four steps, entirely on your machine. The price table is the only thing fetched — and
          there&apos;s a bundled fallback for when you&apos;re offline.
        </SectionHead>
        <div className="steps">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} as="article" className="step" delay={i * 70}>
              <span className="num">{s.n}</span>
              <h3>{s.h}</h3>
              <p>{s.p}</p>
              <div className="tag">{s.tag}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
