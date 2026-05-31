import { Logo, GitHubIcon, NpmIcon } from "./icons";
import { CommandChip } from "./CopyCommand";
import { ThemeToggle } from "./ThemeToggle";
import { REPO_URL, NPM_URL } from "@/lib/content";

export function Nav() {
  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <a className="brand" href="#top" aria-label="Claude Wrapped — home">
          <Logo className="logo" />
          <span>Claude Wrapped</span>
        </a>
        <nav className="nav-links" aria-label="Sections">
          <a className="navlink" href="#inside">Features</a>
          <a className="navlink" href="#how">How it works</a>
          <a className="navlink" href="#install">Install</a>
          <a className="navlink" href="#faq">FAQ</a>
        </nav>
        <div className="nav-right">
          <CommandChip />
          <a className="iconbtn" href={REPO_URL} target="_blank" rel="noreferrer" aria-label="GitHub repository">
            <GitHubIcon />
          </a>
          <a className="iconbtn" href={NPM_URL} target="_blank" rel="noreferrer" aria-label="npm package">
            <NpmIcon />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
