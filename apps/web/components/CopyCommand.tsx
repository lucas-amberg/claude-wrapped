"use client";

import { useState } from "react";
import { CopyIcon } from "./icons";
import { INSTALL_CMD as CMD } from "@/lib/content";

function useCopy() {
  const [copied, setCopied] = useState(false);
  function copy() {
    try {
      navigator.clipboard?.writeText(CMD);
    } catch {}
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }
  return { copied, copy };
}

/** Compact nav chip — copies `npx claude-wrapped`. */
export function CommandChip() {
  const { copied, copy } = useCopy();
  return (
    <button type="button" className="chip" onClick={copy} aria-label="Copy install command">
      <span className="prompt">$</span>
      <span className="label">{copied ? "copied ✓" : CMD}</span>
      <CopyIcon className="glyph" />
    </button>
  );
}

/** Hero primary button — copies the command, shows feedback. */
export function CopyButton() {
  const { copied, copy } = useCopy();
  return (
    <button type="button" className={`btn-primary${copied ? " copied" : ""}`} onClick={copy}>
      <span className="prompt">$</span>
      <span>{CMD}</span>
      <span className="copytag">{copied ? "Copied ✓" : "Copy"}</span>
    </button>
  );
}
