import { describe, it, expect } from "vitest";
import { ELEMENT_NODE, TEXT_NODE } from "ultrahtml";
import { convert, decodeEntities, expandStyle, htmlToVNode } from "../../src/render/card.js";

describe("expandStyle", () => {
  it("expands the border shorthand into longhands", () => {
    // `toVal` only numifies *pure* numeric strings, so "1px" stays a string —
    // which is exactly what Satori receives from the real markup.
    expect(expandStyle("border:1px solid red")).toEqual({
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "red",
    });
  });

  it("expands border-top / border-bottom with the camelCased prefix", () => {
    expect(expandStyle("border-top:2px solid #fff")).toEqual({
      borderTopWidth: "2px",
      borderTopStyle: "solid",
      borderTopColor: "#fff",
    });
    expect(expandStyle("border-bottom:1px dashed blue")).toEqual({
      borderBottomWidth: "1px",
      borderBottomStyle: "dashed",
      borderBottomColor: "blue",
    });
  });

  it("camelCases property names", () => {
    expect(expandStyle("flex-direction:column")).toEqual({ flexDirection: "column" });
  });

  it("numifies unitless values but leaves colors/strings as strings", () => {
    expect(expandStyle("flex:1.3")).toEqual({ flex: 1.3 });
    expect(expandStyle("opacity:0.5")).toEqual({ opacity: 0.5 });
    expect(expandStyle("color:#2A1E16")).toEqual({ color: "#2A1E16" });
  });

  it("skips empty and colon-less declarations", () => {
    expect(expandStyle(";display;color:red;;")).toEqual({ color: "red" });
    expect(expandStyle("color:")).toEqual({});
    expect(expandStyle("")).toEqual({});
  });
});

describe("decodeEntities", () => {
  it("reverses the markup-time escaping", () => {
    expect(decodeEntities("&lt;div&gt; &amp; &lt;/div&gt;")).toBe("<div> & </div>");
    expect(decodeEntities("a &amp; b")).toBe("a & b");
    expect(decodeEntities("no entities here")).toBe("no entities here");
  });
});

describe("htmlToVNode", () => {
  it("converts a styled element with a text child into a vnode tree", () => {
    const node = htmlToVNode('<div style="display:flex;color:red">hi</div>');
    expect(node).toEqual({
      type: "div",
      props: { style: { display: "flex", color: "red" }, children: "hi" },
    });
  });

  it("parses numeric width/height attributes as numbers, others as strings", () => {
    const img = htmlToVNode('<img width="34" height="34" src="x" />');
    expect(img).toEqual({ type: "img", props: { width: 34, height: 34, src: "x" } });

    const pct = htmlToVNode('<div width="50%"></div>');
    expect(pct).toEqual({ type: "div", props: { width: "50%" } });
  });

  it("filters whitespace-only text children", () => {
    const node = htmlToVNode(
      '<div style="display:flex"> <span style="display:flex">x</span> </div>',
    ) as { type: string; props: { children: unknown } };
    const kids = node.props.children as Array<{ type: string; props: { children: unknown } }>;
    expect(Array.isArray(kids)).toBe(true);
    expect(kids).toHaveLength(1);
    expect(kids[0].type).toBe("span");
    expect(kids[0].props.children).toBe("x"); // single text child collapses to a string
  });

  it("throws when the markup has no root element", () => {
    expect(() => htmlToVNode("plain text, no tags")).toThrow("card markup produced no root element");
  });
});

describe("convert", () => {
  it("converts an ultrahtml-shaped node directly", () => {
    const vnode = convert({
      type: ELEMENT_NODE,
      name: "section",
      attributes: { style: "display:flex" },
      children: [{ type: TEXT_NODE, value: "hello" }],
    });
    expect(vnode).toEqual({
      type: "section",
      props: { style: { display: "flex" }, children: "hello" },
    });
  });
});
