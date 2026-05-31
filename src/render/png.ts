import { Resvg } from "@resvg/resvg-js";

/**
 * Rasterize a Satori SVG to a PNG buffer. Satori emits text as vector paths,
 * so resvg needs no fonts. `scale` renders at N× for crispness (default 2×).
 */
export function svgToPng(svg: string, scale = 2): Buffer {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "zoom", value: scale },
    background: "#FAF9F5",
  });
  return resvg.render().asPng();
}
