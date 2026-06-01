import Image from "next/image";
import { Logo } from "./icons";
import { CopyButton } from "./CopyCommand";
import { REPO_URL } from "@/lib/content";

export function Hero() {
  return (
    <section className="hero" id="top">
      <span className="hero-glow" aria-hidden />
      <div className="wrap hero-grid">
        <div>
          <span className="eyebrow">
            <Logo className="spark" />
            Monthly · Claude Code usage
          </span>
          <h1 className="display">
            Your month in Claude Code, <span className="em">beautifully wrapped.</span>
          </h1>
          <p className="lede">
            A Spotify-Wrapped-style card of how you actually code — tokens, spend, top
            projects, model split, and your coding persona. Generated from your local logs.
          </p>
          <div className="cta">
            <CopyButton />
            <a className="btn-ghost" href={REPO_URL} target="_blank" rel="noreferrer">
              View on GitHub →
            </a>
          </div>
          <p className="meta">
            <b>Reads local logs</b>
            <span className="sep">·</span>
            <b>Nothing uploaded</b>
            <span className="sep">·</span>
            <b>Open source</b>
            <span className="sep">·</span>
            <b>Node 18+</b>
          </p>
        </div>

        <div className="card-stage">
          <Image
            className="card-img only-light"
            src="/sample.png"
            width={1080}
            height={1350}
            alt="A sample Claude Wrapped card showing total tokens, spend, top projects, model split, an activity heatmap and a coding persona"
            priority
          />
          <Image
            className="card-img only-dark"
            src="/sample-dark.png"
            width={1080}
            height={1350}
            alt="The same Claude Wrapped card rendered in the warm near-black dark theme"
            priority
          />
          <span className="card-cap">Fig. 01 — May 2026</span>
        </div>
      </div>
    </section>
  );
}
