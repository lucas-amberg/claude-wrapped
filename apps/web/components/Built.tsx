import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";
import { BUILT } from "@/lib/content";

export function Built() {
  return (
    <section className="section">
      <div className="wrap">
        <SectionHead index="02" title="Built to be trusted">
          A wrap-up of your usage shouldn&apos;t cost your privacy or your confidence in the
          numbers. This one earns both.
        </SectionHead>
        <Reveal>
          <div className="trio">
            {BUILT.map((b) => (
              <div className="trio-item" key={b.k}>
                <span className="k">{b.k}</span>
                <h3>{b.h}</h3>
                <p>{b.p}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
