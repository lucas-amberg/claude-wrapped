// Fonts bundled into the CLI. tsup's `binary` loader turns these imports into
// Uint8Array at build time, so the published binary is fully self-contained.
import poppinsRegular from "../assets/fonts/Poppins-Regular.ttf";
import poppinsMedium from "../assets/fonts/Poppins-Medium.ttf";
import poppinsSemiBold from "../assets/fonts/Poppins-SemiBold.ttf";
import poppinsBold from "../assets/fonts/Poppins-Bold.ttf";
import poppinsBlack from "../assets/fonts/Poppins-Black.ttf";
import spaceMonoRegular from "../assets/fonts/SpaceMono-Regular.ttf";
import spaceMonoBold from "../assets/fonts/SpaceMono-Bold.ttf";
import type { FontSpec } from "./card.js";
import { FONT_FILES } from "./font-manifest.js";

// Bind each manifest entry to its build-time imported buffer by filename.
const BUFFERS: Record<string, Uint8Array> = {
  "Poppins-Regular.ttf": poppinsRegular,
  "Poppins-Medium.ttf": poppinsMedium,
  "Poppins-SemiBold.ttf": poppinsSemiBold,
  "Poppins-Bold.ttf": poppinsBold,
  "Poppins-Black.ttf": poppinsBlack,
  "SpaceMono-Regular.ttf": spaceMonoRegular,
  "SpaceMono-Bold.ttf": spaceMonoBold,
};

export const SATORI_FONTS: FontSpec[] = FONT_FILES.map(({ family, file, weight }) => ({
  name: family,
  data: Buffer.from(BUFFERS[file]),
  weight,
  style: "normal",
}));
