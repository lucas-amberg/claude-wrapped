"use client";

import { SunIcon, MoonIcon } from "./icons";

type Theme = "light" | "dark";

/**
 * Reads the current theme straight from the DOM (set before paint by the
 * no-flash script in layout) and flips it. No React state → no hydration
 * mismatch; the correct icon is chosen by CSS from [data-theme].
 */
export function ThemeToggle() {
  function toggle() {
    const el = document.documentElement;
    const next: Theme = el.getAttribute("data-theme") === "dark" ? "light" : "dark";
    el.setAttribute("data-theme", next);
    try {
      localStorage.setItem("cw-theme", next);
    } catch {}
  }

  return (
    <button type="button" className="iconbtn" onClick={toggle} aria-label="Toggle color theme" title="Toggle theme">
      <MoonIcon className="theme-icon-moon" />
      <SunIcon className="theme-icon-sun" />
    </button>
  );
}
