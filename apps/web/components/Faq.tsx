"use client";

import { useState } from "react";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";
import { FAQ } from "@/lib/content";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="section" id="faq">
      <div className="wrap">
        <SectionHead index="06" title="Questions" />
        <Reveal>
          <div className="faq">
            {FAQ.map((item, i) => {
              const isOpen = open === i;
              return (
                <div className="faq-item" key={item.q} data-open={isOpen ? "true" : "false"}>
                  <button
                    type="button"
                    className="faq-q"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    {item.q}
                    <svg className="pm" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                  <div className="faq-a">
                    <div>
                      <p>{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
