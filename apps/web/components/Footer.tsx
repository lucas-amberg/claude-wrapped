import { Logo } from "./icons";
import { REPO_URL, NPM_URL } from "@/lib/content";

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <div className="footer-top">
          <div>
            <div className="footer-brand">
              <Logo className="logo" />
              Claude Wrapped
            </div>
            <p className="footer-tag">
              Your month in Claude Code, beautifully wrapped — straight from your local logs.
            </p>
          </div>
          <div className="footer-cols">
            <div>
              <h4>Product</h4>
              <a href="#inside">Features</a>
              <a href="#how">How it works</a>
              <a href="#install">Install</a>
              <a href="#faq">FAQ</a>
            </div>
            <div>
              <h4>Links</h4>
              <a href={REPO_URL} target="_blank" rel="noreferrer">GitHub</a>
              <a href={NPM_URL} target="_blank" rel="noreferrer">npm</a>
              <a href={`${REPO_URL}/blob/main/LICENSE`} target="_blank" rel="noreferrer">License (MIT)</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>Claude logo © Anthropic · Fonts under the SIL Open Font License</span>
          <span>Built with Claude Code</span>
        </div>
      </div>
    </footer>
  );
}
