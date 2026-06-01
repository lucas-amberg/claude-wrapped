import { describe, it, expect } from "vitest";
import {
  DARK,
  LIGHT,
  fmtCompact,
  fmtDayShort,
  fmtHour,
  fmtMoney0,
  fmtPct1,
  fmtShare,
  fmtThousands,
  themeFor,
} from "../../src/render/theme.js";

describe("fmtCompact", () => {
  it("uses B / M / K thresholds, then raw", () => {
    expect(fmtCompact(2_880_000_000)).toBe("2.88B");
    expect(fmtCompact(1_000_000_000)).toBe("1.00B");
    expect(fmtCompact(437_000_000)).toBe("437M");
    expect(fmtCompact(1_000_000)).toBe("1M");
    expect(fmtCompact(26_900)).toBe("26.9K");
    expect(fmtCompact(1_000)).toBe("1.0K");
    expect(fmtCompact(999)).toBe("999");
    expect(fmtCompact(0)).toBe("0");
  });
});

describe("fmtThousands", () => {
  it("always renders thousands as K with one decimal, millions as M", () => {
    expect(fmtThousands(2_500_000)).toBe("2.50M");
    expect(fmtThousands(26_900)).toBe("26.9K");
    expect(fmtThousands(1_000)).toBe("1.0K");
    expect(fmtThousands(999)).toBe("999");
  });
});

describe("fmtMoney0", () => {
  it("rounds and groups in en-US", () => {
    expect(fmtMoney0(2_201.4)).toBe("$2,201");
    expect(fmtMoney0(2_201.5)).toBe("$2,202");
    expect(fmtMoney0(1_234_567)).toBe("$1,234,567");
    expect(fmtMoney0(0)).toBe("$0");
  });
});

describe("fmtPct1", () => {
  it("renders a fraction as a 1-decimal percentage", () => {
    expect(fmtPct1(0.958)).toBe("95.8%");
    expect(fmtPct1(0.5)).toBe("50.0%");
    expect(fmtPct1(1)).toBe("100.0%");
  });
});

describe("fmtShare", () => {
  it("handles the <1% edge, zero, and rounding", () => {
    expect(fmtShare(0.964)).toBe("96%");
    expect(fmtShare(0.034)).toBe("3%");
    expect(fmtShare(0.005)).toBe("<1%");
    expect(fmtShare(0)).toBe("0%");
    expect(fmtShare(0.999)).toBe("100%");
  });
});

describe("fmtHour", () => {
  it("converts 24h to a 12h AM/PM label", () => {
    expect(fmtHour(0)).toBe("12 AM");
    expect(fmtHour(6)).toBe("6 AM");
    expect(fmtHour(12)).toBe("12 PM");
    expect(fmtHour(15)).toBe("3 PM");
    expect(fmtHour(23)).toBe("11 PM");
  });
});

describe("fmtDayShort", () => {
  it("renders YYYY-MM-DD as a short uppercase month + day", () => {
    expect(fmtDayShort("2026-05-08")).toBe("MAY 8");
    expect(fmtDayShort("2026-01-01")).toBe("JAN 1");
    expect(fmtDayShort("2026-12-25")).toBe("DEC 25");
  });
});

describe("themeFor", () => {
  it("maps theme names to palettes", () => {
    expect(themeFor("dark")).toBe(DARK);
    expect(themeFor("light")).toBe(LIGHT);
  });
});

describe("palettes", () => {
  it("LIGHT and DARK expose the same keys, all string-valued", () => {
    expect(Object.keys(DARK).sort()).toEqual(Object.keys(LIGHT).sort());
    for (const v of [...Object.values(LIGHT), ...Object.values(DARK)]) {
      expect(typeof v).toBe("string");
    }
  });
});
