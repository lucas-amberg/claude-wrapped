import satori from "satori";
import { parse, ELEMENT_NODE, TEXT_NODE } from "ultrahtml";
import type { WrappedStats } from "../types.js";
import { buildCardMarkup } from "./card-markup.js";
import { WIDTH, HEIGHT } from "./theme.js";

export interface FontSpec {
  name: string;
  data: Buffer | ArrayBuffer | Uint8Array;
  weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  style: "normal" | "italic";
}

type StyleValue = string | number;
type VNode = string | { type: string; props: Record<string, unknown> };

const camel = (prop: string): string => prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

const toVal = (v: string): StyleValue =>
  /^-?\d+(?:\.\d+)?$/.test(v) ? parseFloat(v) : v;

/**
 * Convert an inline CSS string into a Satori style object. Satori (older
 * versions) lacks `border`/`border-top` shorthands, so expand those to
 * longhands; unitless numbers become numbers (flex, line-height, opacity).
 */
function expandStyle(style: string): Record<string, StyleValue> {
  const out: Record<string, StyleValue> = {};
  for (const decl of style.split(";")) {
    const idx = decl.indexOf(":");
    if (idx === -1) continue;
    const prop = decl.slice(0, idx).trim();
    const val = decl.slice(idx + 1).trim();
    if (!prop || !val) continue;
    if (prop === "border" || prop === "border-top" || prop === "border-bottom") {
      const [w, st, ...rest] = val.split(/\s+/);
      const prefix = prop === "border" ? "border" : camel(prop);
      out[`${prefix}Width`] = toVal(w);
      out[`${prefix}Style`] = st;
      out[`${prefix}Color`] = rest.join(" ");
      continue;
    }
    out[camel(prop)] = toVal(val);
  }
  return out;
}

interface ParsedNode {
  type: number;
  name?: string;
  value?: string;
  attributes?: Record<string, string>;
  children?: ParsedNode[];
}

// ultrahtml doesn't decode entities in text nodes (the browser DOM does), so
// reverse the escaping applied when building the markup.
const decodeEntities = (t: string): string =>
  t.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

function convert(node: ParsedNode): VNode {
  if (node.type === TEXT_NODE) return decodeEntities(node.value ?? "");
  const props: Record<string, unknown> = {};
  const attrs = node.attributes ?? {};
  for (const k of Object.keys(attrs)) {
    if (k === "style") props.style = expandStyle(attrs[k]);
    else if (k === "width" || k === "height")
      props[k] = /^\d+$/.test(attrs[k]) ? parseInt(attrs[k], 10) : attrs[k];
    else props[k] = attrs[k];
  }
  const kids = (node.children ?? [])
    .map(convert)
    .filter((c) => !(typeof c === "string" && c.trim() === ""));
  if (kids.length === 1 && typeof kids[0] === "string") props.children = kids[0];
  else if (kids.length) props.children = kids;
  return { type: node.name ?? "div", props };
}

/** Parse a (well-formed, inline-styled) HTML string into a Satori vnode tree. */
function htmlToVNode(markup: string): VNode {
  const doc = parse(markup) as ParsedNode;
  const root = (doc.children ?? []).find((c) => c.type === ELEMENT_NODE);
  if (!root) throw new Error("card markup produced no root element");
  return convert(root);
}

/** Render the wrapped card to an SVG string via Satori. */
export async function renderSvg(stats: WrappedStats, fonts: FontSpec[]): Promise<string> {
  const vnode = htmlToVNode(buildCardMarkup(stats));
  return satori(vnode as Parameters<typeof satori>[0], {
    width: WIDTH,
    height: HEIGHT,
    fonts: fonts as Parameters<typeof satori>[1]["fonts"],
  });
}
