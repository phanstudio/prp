

// initfontloader, queueFontLoad, ensureFontLoaded, isFontLoaded, isFontLoading these are beign used by other programs don't change thaer name, and overall logic
// system fonts are important, code to detect and add to the list
// preload top fonts
// src/utilities/fontLoader.ts

// Critical fonts: load immediately
const CRITICAL_FONTS = ["Impact", "Roboto", "Arial"];

// Popular fonts: lazy-load quickly
const POPULAR_FONTS = [
  "Comic Sans MS",
  "Poppins",
  "Montserrat",
  "Open Sans",
  "Lato",
  "Bebas Neue",
  "Lobster",
  "Pacifico",
  "Oswald",
  "Raleway",
  "Ubuntu",
  "Inter",
  "Playfair Display",
  "Merriweather",
  "Rubik",
  "Work Sans",
  "Nunito",
  "PT Sans",
  "Mukta",
  "Barlow",
  "Quicksand",
  "Kanit",
  "DM Sans",
  "Karla",
  "Manrope",
  "Space Grotesk",
  "Plus Jakarta Sans",
  "Anton",
];

// Map font names to @fontsource package names
// Most @fontsource packages are lowercase with dashes
// const fontPackageMap: Record<string, string> = {};
// allFonts.forEach((font) => {
//   const pkgName = font.toLowerCase().replace(/\s+/g, "-");
//   fontPackageMap[font] = `@fontsource/${pkgName}`;
// });

// -----------------------------------------
// Internal state
// -----------------------------------------
const loadedFonts = new Set<string>();
const loadingFonts = new Map<string, Promise<void>>();
const fontLoadQueue = new Set<string>();
let batchLoadTimer: ReturnType<typeof setTimeout> | null = null;

// -----------------------------------------
// Font detection (checks if font is available in the browser)
// -----------------------------------------
// function isFontAvailable(fontFamily: string): boolean {
//   if ("fonts" in document && typeof (document as any).fonts.check === "function") {
//     if ((document as any).fonts.check(`12px "${fontFamily}"`)) return true;
//   }

//   const canvas = document.createElement("canvas");
//   const context = canvas.getContext("2d");
//   if (!context) return false;

//   const testText = "mmmmmmmmmwwwwwww";
//   const defaultFont = "monospace";

//   context.font = `72px ${defaultFont}`;
//   const baselineWidth = context.measureText(testText).width;

//   context.font = `72px '${fontFamily}', ${defaultFont}`;
//   const newWidth = context.measureText(testText).width;

//   return newWidth !== baselineWidth;
// }

// -----------------------------------------
// Queue font to load (called by FontSelector)
// -----------------------------------------
// export function queueFontLoad(fontFamily: string): void {
//   if (loadedFonts.has(fontFamily) || loadingFonts.has(fontFamily)) return;

//   const pkg = fontPackageMap[fontFamily];
//   if (pkg) {
//     const promise = import(`${pkg}/index.css`)
//       .then(() => {
//         loadedFonts.add(fontFamily);
//         loadingFonts.delete(fontFamily);
//         console.log(`✨ Font loaded dynamically: ${fontFamily}`);
//       })
//       .catch((e) => {
//         console.warn(`[FontLoader] Failed to load "${fontFamily}"`, e);
//         loadedFonts.add(fontFamily); // fallback
//         loadingFonts.delete(fontFamily);
//       });
//     loadingFonts.set(fontFamily, promise);
//   } else {
//     // fallback: system font
//     loadedFonts.add(fontFamily);
//   }
// }

// -----------------------------------------
// Ensure font is loaded immediately
// -----------------------------------------
// export async function ensureFontLoaded(fontFamily: string): Promise<void> {
//   if (loadedFonts.has(fontFamily)) return;
//   if (loadingFonts.has(fontFamily)) return loadingFonts.get(fontFamily)!;

//   const pkg = fontPackageMap[fontFamily];
//   if (pkg) {
//     const promise = import(`${pkg}/index.css`)
//       .then(() => {
//         loadedFonts.add(fontFamily);
//         loadingFonts.delete(fontFamily);
//         console.log(`✨ Font ensured dynamically: ${fontFamily}`);
//       })
//       .catch((e) => {
//         console.warn(`[FontLoader] Failed to load "${fontFamily}"`, e);
//         loadedFonts.add(fontFamily);
//         loadingFonts.delete(fontFamily);
//       });
//     loadingFonts.set(fontFamily, promise);
//     return promise;
//   } else {
//     loadedFonts.add(fontFamily);
//   }
// }

// export function getFontStats() {
//   return {
//     loaded: loadedFonts.size,
//     loading: loadingFonts.size,
//     queued: 0, // queue is implicit with dynamic loading
//     loadedList: Array.from(loadedFonts),
//   };
// }


// Internal state


// -------------------------------------------------------
// 🔍 Font detection
// -------------------------------------------------------
function isFontAvailable(fontFamily: string): boolean {
  if ("fonts" in document && typeof (document as any).fonts.check === "function") {
    if ((document as any).fonts.check(`12px "${fontFamily}"`)) {
      return true;
    }
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return false;

  const testText = "mmmmmmmmmwwwwwww";
  const defaultFont = "monospace";

  context.font = `72px ${defaultFont}`;
  const baselineWidth = context.measureText(testText).width;

  context.font = `72px '${fontFamily}', ${defaultFont}`;
  const newWidth = context.measureText(testText).width;

  return newWidth !== baselineWidth;
}

// -------------------------------------------------------
export function initFontLoader(): void {
  CRITICAL_FONTS.forEach((f) => loadedFonts.add(f));
  console.log("🎨 Font loader initialized");
  console.log(`📦 Critical fonts ready: ${CRITICAL_FONTS.join(", ")}`);
  console.log(`⏳ Popular fonts available on-demand: ${POPULAR_FONTS.length}`);
}

// -------------------------------------------------------
export function queueFontLoad(fontFamily: string): void {
  if (loadedFonts.has(fontFamily) || loadingFonts.has(fontFamily)) return;

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
function batchLoadFonts(fonts: string[]): void {
  if (fonts.length === 0) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?${fonts
    .map(f => `family=${f.replace(/ /g, "+")}:wght@400;700`)
    .join("&")}&display=swap`;

  const loadPromise = new Promise<void>(resolve => {
    link.onload = () => {
      fonts.forEach(font => {
        loadedFonts.add(font);
        loadingFonts.delete(font);
      });
      console.log(`📦 Loaded ${fonts.length} fonts:`, fonts.join(", "));
      resolve();
    };

    link.onerror = () => {
      console.warn("❌ Failed to load fonts:", fonts);
      fonts.forEach(font => loadingFonts.delete(font));
      resolve();
    };
  });

  document.head.appendChild(link);
  fonts.forEach(font => loadingFonts.set(font, loadPromise));
}

// -------------------------------------------------------
// ⭐ ENSURE FONT LOADED + MOBILE FAILSAFE
// -------------------------------------------------------
export async function ensureFontLoaded(fontFamily: string): Promise<void> {

  // Already loaded?
  if (loadedFonts.has(fontFamily)) return;

  // If available locally, done
  if (isFontAvailable(fontFamily)) {
    loadedFonts.add(fontFamily);
    return;
  }

  // If loading already
  if (loadingFonts.has(fontFamily)) {
    return loadingFonts.get(fontFamily)!;
  }

  // Try loading primary font
  const loadPromise = new Promise<void>(resolve => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(
      / /g,
      "+"
    )}:wght@400;700&display=swap`;

    link.onload = () => {
      loadedFonts.add(fontFamily);
      loadingFonts.delete(fontFamily);
      console.log(`✨ Loaded font: ${fontFamily}`);
      resolve();
    };

    document.head.appendChild(link);
  });

  loadingFonts.set(fontFamily, loadPromise);
  return loadPromise;
}

// -----------------------------------------
// Introspection / helpers
// -----------------------------------------
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