import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";
import { PERSONAS } from "@/lib/content";

export function Personas() {
  return (
    <section className="section" id="personas">
      <div className="wrap">
        <SectionHead index="04" title="Which coder are you?">
          Your peak hour decides your persona. There&apos;s no wrong answer — only an honest one.
        </SectionHead>
        <Reveal>
          <div className="personas">
            {PERSONAS.map((p) => (
              <div className="persona" key={p.name}>
                <span className="emoji">{p.emoji}</span>
                <h3>{p.name}</h3>
                <span className="when">{p.when}</span>
                <p>{p.p}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
