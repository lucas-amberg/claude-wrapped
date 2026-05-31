import { Resvg } from "@resvg/resvg-js";
import { LIGHT } from "./theme.js";

/**
 * Rasterize a Satori SVG to a PNG buffer. Satori emits text as vector paths,
 * so resvg needs no fonts. `scale` renders at N× for crispness (default 2×).
 * `background` fills the canvas behind the card (default: light theme bg).
 */
export function svgToPng(svg: string, scale = 2, background = LIGHT.pngBg): Buffer {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "zoom", value: scale },
    background,
  });
  return resvg.render().asPng();
}
