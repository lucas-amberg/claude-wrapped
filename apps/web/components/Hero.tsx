import Image from "next/image";
import { Logo, CodexLogo } from "./icons";
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
            <CodexLogo className="spark spark-codex" />
            Monthly · Claude Code + Codex
          </span>
          <h1 className="display">
            Your month of vibe coding, <span className="em">beautifully wrapped.</span>
          </h1>
          <p className="lede">
            A Spotify-Wrapped-style card of how you actually code — across Claude Code and
            Codex. Tokens, spend, top projects, model split, and your coding persona, straight
            from your local logs.
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
            src="/sample-combined.png"
            width={1080}
            height={1351}
            alt="A sample Vibe Coding Wrapped card combining Claude Code and Codex — total tokens, spend, top projects, model splits, activity heatmaps and coding personas"
            priority
          />
          <Image
            className="card-img only-dark"
            src="/sample-combined-dark.png"
            width={1080}
            height={1351}
            alt="The same combined Vibe Coding Wrapped card rendered in the near-black dark theme"
            priority
          />
        </div>
      </div>
    </section>
  );
}
