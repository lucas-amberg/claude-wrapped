import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { HERO_STATS, INSTALL_CMD } from "@/lib/content";

export const alt = "Claude Wrapped — your month in Claude Code, beautifully wrapped";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const fontDir = join(process.cwd(), "app");
  const [bold, semi] = await Promise.all([
    readFile(join(fontDir, "Poppins-Bold.ttf")),
    readFile(join(fontDir, "Poppins-SemiBold.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#FAF9F5",
          color: "#2A1E16",
          fontFamily: "Poppins",
          padding: "72px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -120,
            width: 640,
            height: 640,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(217,119,87,0.35), rgba(217,119,87,0))",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", width: 26, height: 26, borderRadius: 8, background: "#D97757" }} />
            <div
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 600,
                letterSpacing: 6,
                color: "#C2562F",
                textTransform: "uppercase",
              }}
            >
              Claude Code · Monthly Wrapped
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
              Your month in Claude Code,
            </div>
            <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, color: "#C2562F" }}>
              beautifully wrapped.
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                display: "flex",
                background: "#241A12",
                color: "#FFFDF9",
                borderRadius: 12,
                padding: "14px 22px",
                fontSize: 28,
              }}
            >
              <span style={{ color: "#D97757", marginRight: 12 }}>$</span> {INSTALL_CMD}
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            width: 320,
            height: "100%",
            borderRadius: 28,
            background: "linear-gradient(135deg, #E58A63, #C2562F)",
            padding: 36,
            marginLeft: 32,
          }}
        >
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 4, color: "rgba(255,251,245,0.78)", textTransform: "uppercase" }}>
            {HERO_STATS[0].lab}
          </div>
          <div style={{ display: "flex", fontSize: 104, fontWeight: 700, color: "#FFFDF9", letterSpacing: -4, lineHeight: 1 }}>
            {HERO_STATS[0].num}
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "rgba(255,251,245,0.78)", marginTop: 14 }}>
            {HERO_STATS[1].num} · {HERO_STATS[2].num} cache
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Poppins", data: bold, weight: 700, style: "normal" },
        { name: "Poppins", data: semi, weight: 600, style: "normal" },
      ],
    },
  );
}
