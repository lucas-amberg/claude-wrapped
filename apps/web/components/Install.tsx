"use client";

import { useState } from "react";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";
import { TABS, OPTIONS } from "@/lib/content";

type TabKey = keyof typeof TABS;
const TAB_KEYS = Object.keys(TABS) as TabKey[];

export function Install() {
  const [tab, setTab] = useState<TabKey>("npx");
  const lines = TABS[tab];

  return (
    <section className="section" id="install">
      <div className="wrap">
        <SectionHead index="05" title="Install & usage">
          One command. No config, no account, no upload.
        </SectionHead>

        <div className="install-grid">
          <Reveal>
            <div className="term">
              <div className="term-bar">
                <span className="name mono">claude-wrapped</span>
                <div className="term-tabs" role="tablist" aria-label="Package manager">
                  {TAB_KEYS.map((k) => (
                    <button
                      key={k}
                      role="tab"
                      aria-selected={tab === k}
                      className="term-tab"
                      onClick={() => setTab(k)}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
              <pre className="term-body">
                {lines.map((l, i) => (
                  <div key={i}>
                    {l.p && <span className="prompt">{l.p}</span>}
                    {l.t && <span>{l.t}</span>}
                    {l.c && <span className="comment">{l.c}</span>}
                    {!l.p && !l.t && !l.c ? " " : ""}
                  </div>
                ))}
              </pre>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="opts">
              <table>
                <thead>
                  <tr>
                    <th>Flag</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {OPTIONS.map((o) => (
                    <tr key={o.flag}>
                      <td className="flag">{o.flag}</td>
                      <td className="desc">{o.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
