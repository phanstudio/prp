const loadedFonts = new Set<string>();
const loadingFonts = new Map<string, Promise<void>>();
const fontLoadQueue = new Set<string>();
let batchLoadTimer: ReturnType<typeof setTimeout> | null = null;

// Built-in OS fonts that never need network download
const OS_BUILTIN_FONTS = new Set(["Arial", "Times New Roman", "Courier New", "Verdana"]);

// Aliases for Google Fonts that have been renamed upstream
const FONT_ALIASES: Record<string, string> = {
  "Fredoka One": "Fredoka",
};

/**
 * Initializes font loader and preloads primary meme fonts
 */
export function initFontLoader(): void {
  preloadCommonMemeFonts();
}

/**
 * Checks if a font is available and ready in document.fonts
 */
export function isFontLoaded(fontFamily: string): boolean {
  if (!fontFamily) return true;
  const cleanFamily = fontFamily.replace(/["']/g, "").trim();
  if (loadedFonts.has(cleanFamily)) {
    return true;
  }
  if (typeof document !== "undefined" && document.fonts && document.fonts.check) {
    if (document.fonts.check(`16px "${cleanFamily}"`)) {
      loadedFonts.add(cleanFamily);
      return true;
    }
  }
  return false;
}

export function isFontLoading(fontFamily: string): boolean {
  const cleanFamily = (fontFamily || "").replace(/["']/g, "").trim();
  return loadingFonts.has(cleanFamily);
}

/**
 * Queue a font for batch loading (e.g. from FontSelector scroll list)
 */
export function queueFontLoad(fontFamily: string): void {
  const cleanFamily = (fontFamily || "").replace(/["']/g, "").trim();
  if (!cleanFamily || isFontLoaded(cleanFamily) || loadingFonts.has(cleanFamily)) return;

  fontLoadQueue.add(cleanFamily);

  if (batchLoadTimer) clearTimeout(batchLoadTimer);

  batchLoadTimer = setTimeout(() => {
    if (fontLoadQueue.size > 0) {
      batchLoadFonts(Array.from(fontLoadQueue));
      fontLoadQueue.clear();
    }
  }, 100);
}

/**
 * Convert family name to Google Fonts URL format (spaces replaced with +)
 */
function toGoogleFontParam(family: string): string {
  const target = FONT_ALIASES[family] || family;
  return target.trim().replace(/\s+/g, "+");
}

/**
 * Batch-load multiple fonts via Google Fonts
 */
function batchLoadFonts(fonts: string[]): void {
  const missing = fonts.filter((f) => !isFontLoaded(f) && !OS_BUILTIN_FONTS.has(f));
  if (missing.length === 0) return;

  const fontFamilies = missing
    .map((f) => `family=${toGoogleFontParam(f)}&display=swap`)
    .join("&");
  const url = `https://fonts.googleapis.com/css2?${fontFamilies}`;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;

  link.onload = async () => {
    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
    } catch {
      // ignore
    }
    missing.forEach((f) => loadedFonts.add(f));
  };

  document.head.appendChild(link);
}

/**
 * Preload commonly used meme fonts on app startup
 */
export async function preloadCommonMemeFonts(): Promise<void> {
  const priorityFonts = [
    "Impact",
    "Comic Sans MS",
    "Arial",
    "Anton",
    "Bebas Neue",
    "Oswald",
    "Lobster",
    "Permanent Marker",
    "Black Ops One",
    "Luckiest Guy",
    "Press Start 2P",
  ];
  await Promise.allSettled(priorityFonts.map((f) => ensureFontLoaded(f)));
}

/**
 * Ensure a single font is fully downloaded, loaded, and parsed into document.fonts
 * before canvas measurements and rendering take place.
 */
export async function ensureFontLoaded(fontFamily: string): Promise<void> {
  if (!fontFamily) return;
  const cleanFamily = fontFamily.replace(/["']/g, "").trim();

  if (isFontLoaded(cleanFamily)) {
    return;
  }

  if (loadingFonts.has(cleanFamily)) {
    return loadingFonts.get(cleanFamily);
  }

  const promise = (async () => {
    try {
      // Check if it's a local font defined in font.css (Impact, Comic Sans MS, Arial, etc.)
      const isLocalFont = ["Impact", "Comic Sans MS", "Arial", "Times New Roman", "Courier New", "Verdana"].includes(cleanFamily);

      if (!isLocalFont) {
        // Inject Google Fonts stylesheet using standard '+' space separator (not %20)
        const fontParam = toGoogleFontParam(cleanFamily);
        const fontLinkId = `gfont-${fontParam.toLowerCase()}`;
        if (!document.getElementById(fontLinkId)) {
          const link = document.createElement("link");
          link.id = fontLinkId;
          link.rel = "stylesheet";
          link.href = `https://fonts.googleapis.com/css2?family=${fontParam}&display=swap`;

          await new Promise<void>((resolve) => {
            link.onload = () => resolve();
            link.onerror = () => {
              console.warn(`Failed to fetch Google Fonts stylesheet for: ${cleanFamily} (${fontParam})`);
              resolve();
            };
            document.head.appendChild(link);
          });
        }
      }

      // Await actual font glyph binary download via document.fonts API
      if (typeof document !== "undefined" && document.fonts && document.fonts.load) {
        await Promise.race([
          Promise.all([
            document.fonts.load(`16px "${cleanFamily}"`),
            document.fonts.ready,
          ]),
          new Promise((resolve) => setTimeout(resolve, 2500)), // 2.5s safety timeout
        ]);
      }
      loadedFonts.add(cleanFamily);
    } catch (err) {
      console.warn(`Font load error for ${cleanFamily}:`, err);
    } finally {
      loadingFonts.delete(cleanFamily);
    }
  })();

  loadingFonts.set(cleanFamily, promise);
  return promise;
}

// Alias for backwards compatibility
export const ensureFontLoadedsync = ensureFontLoaded;


