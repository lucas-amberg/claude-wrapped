// Single source of truth for the bundled font set (family + file + weight).
// Kept import-free on purpose: the dev scripts read these files from disk under
// bun, so this module must not pull in the `.ttf` binary imports that only the
// bundler's loader understands. `fonts.ts` pairs each entry with its imported
// buffer; the dev scripts read each `file` from disk.
export interface FontFile {
  family: "Poppins" | "Space Mono";
  file: string;
  weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
}

export const FONT_FILES: FontFile[] = [
  { family: "Poppins", file: "Poppins-Regular.ttf", weight: 400 },
  { family: "Poppins", file: "Poppins-Medium.ttf", weight: 500 },
  { family: "Poppins", file: "Poppins-SemiBold.ttf", weight: 600 },
  { family: "Poppins", file: "Poppins-Bold.ttf", weight: 700 },
  { family: "Poppins", file: "Poppins-Black.ttf", weight: 900 },
  { family: "Space Mono", file: "SpaceMono-Regular.ttf", weight: 400 },
  { family: "Space Mono", file: "SpaceMono-Bold.ttf", weight: 700 },
];
