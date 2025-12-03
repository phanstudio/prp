import { SYSTEM_FONTS } from "./fontList";

// -------------------------------------------------------
// Critical fonts: load immediately
// -------------------------------------------------------
const CRITICAL_FONTS = ["Impact", "Roboto", "Arial"];

// -------------------------------------------------------
// Popular fonts: lazy-load on scroll
// -------------------------------------------------------
const POPULAR_FONTS = [
  "Comic Sans MS", "Poppins", "Montserrat", "Open Sans", "Lato",
  "Bebas Neue", "Lobster", "Pacifico", "Oswald", "Raleway",
  "Ubuntu", "Inter", "Playfair Display", "Merriweather", "Rubik",
  "Work Sans", "Nunito", "PT Sans", "Mukta", "Barlow",
  "Quicksand", "Kanit", "DM Sans", "Karla", "Manrope",
  "Space Grotesk", "Plus Jakarta Sans", "Anton"
];

// -------------------------------------------------------
// Internal state
// -------------------------------------------------------
const loadedFonts = new Set<string>();
const loadingFonts = new Map<string, Promise<void>>();
const fontLoadQueue = new Set<string>();
let batchLoadTimer: ReturnType<typeof setTimeout> | null = null;

// -------------------------------------------------------
// Initialize loader: mark critical fonts as loaded immediately
// -------------------------------------------------------
export function initFontLoader(): void {
  CRITICAL_FONTS.forEach((f) => loadedFonts.add(f));
  SYSTEM_FONTS.forEach((f) => loadedFonts.add(f));

  console.log("🎨 Font loader initialized");
  console.log(`📦 Critical fonts: ${CRITICAL_FONTS.join(", ")}`);
  console.log(`⏳ Popular fonts available: ${POPULAR_FONTS.length}`);
}

// -------------------------------------------------------
// Queue a font for batch loading (IntersectionObserver trigger)
// -------------------------------------------------------
export function queueFontLoad(fontFamily: string): void {
  if (loadedFonts.has(fontFamily) || loadingFonts.has(fontFamily)) return;
  if (SYSTEM_FONTS.includes(fontFamily)) return; // system font: skip

  fontLoadQueue.add(fontFamily);

  if (batchLoadTimer) clearTimeout(batchLoadTimer);

  batchLoadTimer = setTimeout(() => {
    if (fontLoadQueue.size > 0) {
      batchLoadFonts(Array.from(fontLoadQueue));
      fontLoadQueue.clear();
    }
  }, 150);
}

// -------------------------------------------------------
// Batch-load multiple fonts via a single Google Fonts request
// -------------------------------------------------------
function batchLoadFonts(fonts: string[]): void {
  if (fonts.length === 0) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href =
    `https://fonts.googleapis.com/css2?` +
    fonts
      .map((f) => `family=${f.replace(/ /g, "+")}:wght@400;700`)
      .join("&") +
    "&display=swap";

  const loadPromise = new Promise<void>((resolve) => {
    link.onload = () => {
      fonts.forEach((font) => {
        loadedFonts.add(font);
        loadingFonts.delete(font);
      });
      console.log(`📦 Batch-loaded fonts: ${fonts.join(", ")}`);
      resolve();
    };

    link.onerror = () => {
      console.warn("❌ Failed batch font load:", fonts);
      fonts.forEach((font) => loadingFonts.delete(font));
      resolve();
    };
  });

  document.head.appendChild(link);
  fonts.forEach((font) => loadingFonts.set(font, loadPromise));
}

// -------------------------------------------------------
// Ensure a single font is loaded before applying
// -------------------------------------------------------
export async function ensureFontLoaded(fontFamily: string): Promise<void> {
  if (loadedFonts.has(fontFamily)) return;
  if (loadingFonts.has(fontFamily)) return loadingFonts.get(fontFamily)!;

  // System fonts are always available
  if (SYSTEM_FONTS.includes(fontFamily)) {
    loadedFonts.add(fontFamily);
    return;
  }

  // Always load web fonts directly (no detection)
  const url = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(
    / /g,
    "+"
  )}&display=swap`;

  const loadPromise = new Promise<void>((resolve) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;

    link.onload = () => {
      loadedFonts.add(fontFamily);
      loadingFonts.delete(fontFamily);
      console.log(`✨ Loaded font: ${fontFamily}`);
      resolve();
    };

    link.onerror = () => {
      console.warn(`❌ Failed to load font: ${fontFamily}`);
      loadingFonts.delete(fontFamily);
      resolve();
    };

    document.head.appendChild(link);
  });

  loadingFonts.set(fontFamily, loadPromise);
  return loadPromise;
}

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------
export function isFontLoaded(fontFamily: string): boolean {
  return loadedFonts.has(fontFamily);
}

export function isFontLoading(fontFamily: string): boolean {
  return loadingFonts.has(fontFamily);
}

export function getFontStats() {
  return {
    loaded: loadedFonts.size,
    loading: loadingFonts.size,
    queued: fontLoadQueue.size,
    loadedList: Array.from(loadedFonts),
  };
}
