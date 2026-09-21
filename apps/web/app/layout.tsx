import type { Metadata, Viewport } from "next";
import { Poppins, Space_Mono } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-poppins",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://claude-wrapped-zeta.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Vibe Coding Wrapped — Your month in Claude Code + Codex, beautifully wrapped",
  description:
    "A Spotify-Wrapped-style card of your Claude Code and Codex usage — total tokens, spend, cache hit rate, top projects, model split, activity heatmaps and your coding persona. Generated from your local logs, nothing uploaded.",
  keywords: ["claude", "claude code", "codex", "openai", "gpt", "wrapped", "tokens", "usage", "cli"],
  authors: [{ name: "Lucas Amberg" }],
  openGraph: {
    title: "Vibe Coding Wrapped",
    description: "Your month across Claude Code and Codex, beautifully wrapped — straight from your local logs.",
    url: siteUrl,
    siteName: "Vibe Coding Wrapped",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vibe Coding Wrapped",
    description: "Your month across Claude Code and Codex, beautifully wrapped.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF9F5" },
    { media: "(prefers-color-scheme: dark)", color: "#181210" },
  ],
};

// Apply the saved theme before paint to avoid a flash. Default stays light.
const noFlash = `(function(){try{var t=localStorage.getItem('cw-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${poppins.variable} ${spaceMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
        <div className="grain" aria-hidden />
        {children}
      </body>
    </html>
  );
}
