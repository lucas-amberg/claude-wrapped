import { describe, it, expect } from "vitest";
import { CLAUDE_LOGO_PATH, claudeLogoDataUri, claudeLogoImg } from "../../src/render/logo.js";

describe("claudeLogoDataUri", () => {
  it("is a base64 SVG data-URI that decodes to the colored mark", () => {
    const uri = claudeLogoDataUri("#D97757");
    expect(uri.startsWith("data:image/svg+xml;base64,")).toBe(true);

    const svg = Buffer.from(uri.split(",")[1], "base64").toString("utf8");
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain('fill="#D97757"');
    expect(svg).toContain(CLAUDE_LOGO_PATH);
  });
});

describe("claudeLogoImg", () => {
  it("emits an <img> with width/height and the data-URI src", () => {
    const img = claudeLogoImg(34, "#D97757");
    expect(img).toContain('width="34"');
    expect(img).toContain('height="34"');
    expect(img).toContain('src="data:image/svg+xml;base64,');
    expect(img).not.toContain("margin-right");
  });

  it("includes margin-right when requested", () => {
    expect(claudeLogoImg(34, "#D97757", 16)).toContain("margin-right:16px;");
  });
});
