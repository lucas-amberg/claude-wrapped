import { describe, it, expect } from "vitest";
import {
  ACCURACY,
  FAQ,
  HEAT_CELLS,
  HERO_STATS,
  INSTALL_CMD,
  MODELS,
  NPM_URL,
  OPTIONS,
  PANELS,
  PERSONAS,
  REPO_URL,
  STEPS,
} from "../lib/content";

describe("landing-page content invariants", () => {
  it("HEAT_CELLS is a 7×24 grid of values in [0, 1]", () => {
    expect(HEAT_CELLS).toHaveLength(168);
    for (const v of HEAT_CELLS) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it("HERO_STATS has 4 entries, each with num/lab/sub", () => {
    expect(HERO_STATS).toHaveLength(4);
    for (const s of HERO_STATS) {
      expect(typeof s.num).toBe("string");
      expect(typeof s.lab).toBe("string");
      expect(typeof s.sub).toBe("string");
    }
  });

  it("exposes the canonical install command", () => {
    expect(INSTALL_CMD).toBe("npx claude-wrapped");
  });

  it("REPO_URL and NPM_URL are valid https URLs", () => {
    for (const url of [REPO_URL, NPM_URL]) {
      expect(url.startsWith("https://")).toBe(true);
      expect(new URL(url).protocol).toBe("https:");
    }
  });

  it("PANELS are non-empty with term/desc", () => {
    expect(PANELS.length).toBeGreaterThan(0);
    for (const p of PANELS) {
      expect(p.term.length).toBeGreaterThan(0);
      expect(p.desc.length).toBeGreaterThan(0);
    }
  });

  it("MODELS are non-empty with name/pct/varName/width", () => {
    expect(MODELS.length).toBeGreaterThan(0);
    for (const m of MODELS) {
      expect(typeof m.name).toBe("string");
      expect(typeof m.pct).toBe("string");
      expect(typeof m.varName).toBe("string");
      expect(typeof m.width).toBe("number");
    }
  });

  it("STEPS are non-empty with n/h/p/tag", () => {
    expect(STEPS.length).toBeGreaterThan(0);
    for (const s of STEPS) {
      expect(typeof s.n).toBe("string");
      expect(typeof s.h).toBe("string");
      expect(typeof s.p).toBe("string");
      expect(typeof s.tag).toBe("string");
    }
  });

  it("FAQ entries are non-empty with q/a", () => {
    expect(FAQ.length).toBeGreaterThan(0);
    for (const f of FAQ) {
      expect(f.q.length).toBeGreaterThan(0);
      expect(f.a.length).toBeGreaterThan(0);
    }
  });

  it("PERSONAS are non-empty with emoji/name/when/p", () => {
    expect(PERSONAS.length).toBeGreaterThan(0);
    for (const p of PERSONAS) {
      expect(typeof p.emoji).toBe("string");
      expect(typeof p.name).toBe("string");
      expect(typeof p.when).toBe("string");
      expect(typeof p.p).toBe("string");
    }
  });

  it("OPTIONS are non-empty with flag/desc", () => {
    expect(OPTIONS.length).toBeGreaterThan(0);
    for (const o of OPTIONS) {
      expect(o.flag.length).toBeGreaterThan(0);
      expect(o.desc.length).toBeGreaterThan(0);
    }
  });

  it("ACCURACY entries are non-empty with v/l", () => {
    expect(ACCURACY.length).toBeGreaterThan(0);
    for (const a of ACCURACY) {
      expect(a.v.length).toBeGreaterThan(0);
      expect(a.l.length).toBeGreaterThan(0);
    }
  });
});
