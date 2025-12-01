// // src/utilities/fontLoader.ts
// // -----------------------------
// // 🚀 Font Loader with Fallback System
// // -----------------------------

// // System fonts (should exist on desktop, but not always on mobile)
// export const SYSTEM_FONTS = [
//   "Arial",
//   "Times New Roman",
//   "Courier New",
//   "Verdana",
//   "Georgia",
//   "Helvetica",
//   "Tahoma",
//   "Trebuchet MS",
//   "Palatino Linotype",
//   "Garamond",
// ];

// // Top 30 fonts to preload immediately
// export const TOP_FONTS = [
//   "Impact",
//   "Comic Sans MS",
//   "Roboto",
//   "Poppins",
//   "Montserrat",
//   "Open Sans",
//   "Lato",
//   "Bebas Neue",
//   "Lobster",
//   "Pacifico",
//   "Oswald",
//   "Raleway",
//   "Ubuntu",
//   "Inter",
//   "Playfair Display",
//   "Merriweather",
//   "Rubik",
//   "Work Sans",
//   "Nunito",
//   "PT Sans",
//   "Mukta",
//   "Barlow",
//   "Quicksand",
//   "Kanit",
//   "DM Sans",
//   "Karla",
//   "Manrope",
//   "Space Grotesk",
//   "Plus Jakarta Sans",
//   "Anton",
// ];

// // Fonts available in our local fallback CSS
// const FALLBACK_FONTS = [
//   "Impact",
//   "Comic Sans MS",
//   "Roboto",
//   "Poppins",
//   "Montserrat",
// ];

// // Internal state
// const loadedFonts = new Set<string>();
// const loadingFonts = new Map<string, Promise<void>>();
// const fontLoadQueue = new Set<string>();
// let batchLoadTimer: ReturnType<typeof setTimeout> | null = null;
// let fallbackLoaded = false;
// let googleFontsBlocked = false;

// // -------------------------------------------------------
// // 🔍 Font detection (checks if font is really available)
// // -------------------------------------------------------
// function isFontAvailable(fontFamily: string): boolean {
//   if (
//     "fonts" in document &&
//     typeof (document as any).fonts.check === "function"
//   ) {
//     try {
//       if ((document as any).fonts.check(`12px "${fontFamily}"`)) {
//         return true;
//       }
//     } catch (e) {
//       // API might fail, fallback to canvas check
//     }
//   }

//   try {
//     const canvas = document.createElement("canvas");
//     const context = canvas.getContext("2d");
//     if (!context) return false;

//     const testText = "mmmmmmmmmwwwwwww";
//     const defaultFont = "monospace";

//     context.font = `72px ${defaultFont}`;
//     const baselineWidth = context.measureText(testText).width;

//     context.font = `72px '${fontFamily}', ${defaultFont}`;
//     const newWidth = context.measureText(testText).width;

//     return newWidth !== baselineWidth;
//   } catch (e) {
//     return false;
//   }
// }

// // -------------------------------------------------------
// // 🛡️ Load fallback CSS
// // -------------------------------------------------------
// function loadFallbackCSS(): Promise<void> {
//   return new Promise((resolve) => {
//     if (fallbackLoaded) {
//       resolve();
//       return;
//     }

//     const link = document.createElement("link");
//     link.rel = "stylesheet";
//     link.href = "/fonts/google-fonts-fallback.css";

//     link.onload = () => {
//       fallbackLoaded = true;
//       console.log("✅ Loaded fallback font CSS");
//       FALLBACK_FONTS.forEach((font) => loadedFonts.add(font));
//       resolve();
//     };

//     link.onerror = () => {
//       console.warn("⚠️ Failed to load fallback CSS");
//       resolve();
//     };

//     document.head.appendChild(link);
//   });
// }

// // -------------------------------------------------------
// // 🧠 Initialization
// // -------------------------------------------------------
// export async function initFontLoader(): Promise<void> {
//   verifySystemFonts();
  
//   // Try loading from Google Fonts first
//   const googleFontsSuccess = await preloadTopFonts();
  
//   // If Google Fonts failed, load fallback
//   if (!googleFontsSuccess) {
//     console.log("📦 Google Fonts unavailable, loading fallback CSS...");
//     await loadFallbackCSS();
//   }
  
//   console.log("🎨 Font loader initialized");
// }

// // -------------------------------------------------------
// // ✅ Verify system fonts
// // -------------------------------------------------------
// function verifySystemFonts(): void {
//   const availableFonts = SYSTEM_FONTS.filter((f) => isFontAvailable(f));
//   console.log(
//     `✅ ${availableFonts.length}/${SYSTEM_FONTS.length} system fonts available`
//   );
//   SYSTEM_FONTS.forEach((f) => loadedFonts.add(f));
// }

// // -------------------------------------------------------
// // ⚡ Preload top fonts on app start
// // -------------------------------------------------------
// async function preloadTopFonts(): Promise<boolean> {
//   const fontsToLoad = TOP_FONTS.filter(
//     (font) => !SYSTEM_FONTS.includes(font) && !loadedFonts.has(font)
//   );

//   if (fontsToLoad.length === 0) return true;

//   // Try a small test batch first to detect if Google Fonts is blocked
//   const testFonts = fontsToLoad.slice(0, 3);
//   const testSuccess = await loadFontBatch(testFonts, true);

//   if (!testSuccess) {
//     googleFontsBlocked = true;
//     return false;
//   }

//   // Load remaining fonts in batches
//   const BATCH_SIZE = 8;
//   for (let i = 3; i < fontsToLoad.length; i += BATCH_SIZE) {
//     const batch = fontsToLoad.slice(i, i + BATCH_SIZE);
//     setTimeout(() => loadFontBatch(batch, false), (i / BATCH_SIZE) * 200);
//   }

//   return true;
// }

// // -------------------------------------------------------
// // 📦 Load a batch of fonts
// // -------------------------------------------------------
// function loadFontBatch(fonts: string[], isTest = false): Promise<boolean> {
//   return new Promise((resolve) => {
//     const link = document.createElement("link");
//     link.rel = "stylesheet";

//     const fontParams = fonts
//       .map((f) => `family=${encodeURIComponent(f)}:wght@400;700`)
//       .join("&");

//     link.crossOrigin = "anonymous"; // ⚡ required for some browsers
//     link.href = `https://fonts.googleapis.com/css2?${fontParams}&display=swap`;

//     const timeout = setTimeout(() => {
//       console.warn(`⏱️ Timeout loading fonts:`, fonts);
//       resolve(false);
//     }, isTest ? 3000 : 5000);

//     link.onload = () => {
//       clearTimeout(timeout);
//       console.log(`✅ Loaded ${fonts.length} fonts:`, fonts.join(", "));
//       fonts.forEach((font) => loadedFonts.add(font));
//       resolve(true);
//     };

//     link.onerror = () => {
//       clearTimeout(timeout);
//       console.warn(`❌ Failed to load fonts:`, fonts);
//       resolve(false);
//     };

//     document.head.appendChild(link);
//   });
// }

// // -------------------------------------------------------
// // 📦 Queue font loading for scroll-time batching
// // -------------------------------------------------------
// export function queueFontLoad(fontFamily: string): void {
//   if (loadedFonts.has(fontFamily) || loadingFonts.has(fontFamily)) return;

//   if (SYSTEM_FONTS.includes(fontFamily)) {
//     loadedFonts.add(fontFamily);
//     return;
//   }

//   // If font is in fallback and Google Fonts is blocked, load fallback
//   if (googleFontsBlocked && FALLBACK_FONTS.includes(fontFamily)) {
//     if (!fallbackLoaded) {
//       loadFallbackCSS().then(() => loadedFonts.add(fontFamily));
//     } else {
//       loadedFonts.add(fontFamily);
//     }
//     return;
//   }

//   fontLoadQueue.add(fontFamily);

//   if (batchLoadTimer) clearTimeout(batchLoadTimer);

//   batchLoadTimer = setTimeout(() => {
//     if (fontLoadQueue.size > 0) {
//       batchLoadFonts(Array.from(fontLoadQueue));
//       fontLoadQueue.clear();
//     }
//   }, 150);
// }

// // -------------------------------------------------------
// // 📚 Batch load fonts
// // -------------------------------------------------------
// async function batchLoadFonts(fonts: string[]): Promise<void> {
//   if (fonts.length === 0) return;

//   // Check if fonts are in fallback
//   const fallbackFontsNeeded = fonts.filter((f) =>
//     FALLBACK_FONTS.includes(f)
//   );

//   // If Google Fonts is blocked, only use fallback
//   if (googleFontsBlocked) {
//     if (fallbackFontsNeeded.length > 0 && !fallbackLoaded) {
//       await loadFallbackCSS();
//     }
//     fonts.forEach((font) => loadedFonts.add(font));
//     return;
//   }

//   // Try loading from Google Fonts
//   const success = await loadFontBatch(fonts, false);

//   // If failed and fallback fonts are available, load fallback
//   if (!success && fallbackFontsNeeded.length > 0) {
//     console.log("🔄 Switching to fallback fonts...");
//     googleFontsBlocked = true;
//     await loadFallbackCSS();
//   }

//   fonts.forEach((font) => loadedFonts.add(font));
// }

// // -------------------------------------------------------
// // ⏱ Ensure a specific font is loaded immediately
// // -------------------------------------------------------
// export async function ensureFontLoaded(fontFamily: string): Promise<void> {
//   if (loadedFonts.has(fontFamily)) return;

//   if (SYSTEM_FONTS.includes(fontFamily)) {
//     loadedFonts.add(fontFamily);
//     return;
//   }

//   if (loadingFonts.has(fontFamily)) {
//     return loadingFonts.get(fontFamily)!;
//   }

//   // Check if font is in fallback
//   if (FALLBACK_FONTS.includes(fontFamily)) {
//     if (googleFontsBlocked || !navigator.onLine) {
//       if (!fallbackLoaded) {
//         await loadFallbackCSS();
//       }
//       loadedFonts.add(fontFamily);
//       return;
//     }
//   }

//   const loadPromise = new Promise<void>(async (resolve) => {
//     // Try Google Fonts first
//     const success = await loadFontBatch([fontFamily], false);

//     // If failed and font is in fallback, use fallback
//     if (!success && FALLBACK_FONTS.includes(fontFamily)) {
//       console.log(`🔄 Loading ${fontFamily} from fallback...`);
//       await loadFallbackCSS();
//     }

//     loadedFonts.add(fontFamily);
//     loadingFonts.delete(fontFamily);
//     console.log(`✨ Loaded font: ${fontFamily}`);
//     resolve();
//   });

//   loadingFonts.set(fontFamily, loadPromise);
//   return loadPromise;
// }

// // -------------------------------------------------------
// // 🔧 Utility: Generate fallback CSS content
// // -------------------------------------------------------
// export function generateFallbackCSS(): string {
//   // This generates the CSS content that should be saved to
//   // public/fonts/google-fonts-fallback.css
  
//   const fonts = FALLBACK_FONTS;
//   const cssLines: string[] = [];

//   cssLines.push("/* Auto-generated Google Fonts Fallback CSS */");
//   cssLines.push("/* Generated on: " + new Date().toISOString() + " */");
//   cssLines.push("");

//   fonts.forEach((font) => {
//     const encodedFont = encodeURIComponent(font);
//     cssLines.push(`/* ${font} */`);
//     cssLines.push(`@import url('https://fonts.googleapis.com/css2?family=${encodedFont}:wght@400;700&display=swap');`);
//     cssLines.push("");
//   });

//   return cssLines.join("\n");
// }

// // -------------------------------------------------------
// // 🧾 Debug / Introspection
// // -------------------------------------------------------
// export function isFontLoaded(fontFamily: string): boolean {
//   return loadedFonts.has(fontFamily);
// }

// export function isFontLoading(fontFamily: string): boolean {
//   return loadingFonts.has(fontFamily);
// }

// export function getFontStats() {
//   return {
//     loaded: loadedFonts.size,
//     loading: loadingFonts.size,
//     queued: fontLoadQueue.size,
//     loadedList: Array.from(loadedFonts),
//     fallbackLoaded,
//     googleFontsBlocked,
//     usingFallback: fallbackLoaded && googleFontsBlocked,
//   };
// }

// // -------------------------------------------------------
// // 🔄 Force fallback mode (for testing)
// // -------------------------------------------------------
// export async function forceFallbackMode(): Promise<void> {
//   googleFontsBlocked = true;
//   await loadFallbackCSS();
//   console.log("🔧 Forced fallback mode enabled");
// }

// src/utilities/fontLoader.ts

// -----------------------------
// 🚀 Font Loader with Detection
// -----------------------------

// System fonts (should exist on desktop, but not always on mobile)
export const SYSTEM_FONTS = [
  "Arial",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Georgia",
  "Helvetica",
  "Tahoma",
  "Trebuchet MS",
  "Palatino Linotype",
  "Garamond",
];

// Top 30 fonts to preload immediately
export const TOP_FONTS = [
  "Impact",
  "Comic Sans MS",
  "Roboto",
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

// Internal state
const loadedFonts = new Set<string>();
const loadingFonts = new Map<string, Promise<void>>();
const fontLoadQueue = new Set<string>();
let batchLoadTimer: ReturnType<typeof setTimeout> | null = null;

// -------------------------------------------------------
// 🔍 Font detection (checks if font is really available)
// -------------------------------------------------------
function isFontAvailable(fontFamily: string): boolean {
  // Prefer the modern API if available
  if ("fonts" in document && typeof (document as any).fonts.check === "function") {
    if ((document as any).fonts.check(`12px "${fontFamily}"`)) {
      return true;
    }
  }

  // Fallback: canvas-based measurement check
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return false;

  const testText = "mmmmmmmmmwwwwwww"; // Wide test string
  const defaultFont = "monospace";

  context.font = `72px ${defaultFont}`;
  const baselineWidth = context.measureText(testText).width;

  context.font = `72px '${fontFamily}', ${defaultFont}`;
  const newWidth = context.measureText(testText).width;

  return newWidth !== baselineWidth;
}

// -------------------------------------------------------
// 🧠 Initialization
// -------------------------------------------------------
export function initFontLoader(): void {
  verifySystemFonts();
  preloadTopFonts();
  console.log("🎨 Font loader initialized");
}

// -------------------------------------------------------
// ✅ Verify system fonts (load missing ones automatically)
// -------------------------------------------------------
function verifySystemFonts(): void {
  const missingFonts = SYSTEM_FONTS.filter(f => !isFontAvailable(f));

  if (missingFonts.length > 0) {
    console.warn("⚠️ Missing system fonts, loading via Google:", missingFonts);
    batchLoadFonts(missingFonts);
  }

  SYSTEM_FONTS.forEach(f => loadedFonts.add(f));
}

// -------------------------------------------------------
// ⚡ Preload top fonts on app start
// -------------------------------------------------------
function preloadTopFonts(): void {
  const fontsToLoad = TOP_FONTS.filter(
    font => !SYSTEM_FONTS.includes(font) && !loadedFonts.has(font)
  );

  if (fontsToLoad.length === 0) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?${fontsToLoad
    .map(f => `family=${f.replace(/ /g, "+")}:wght@400;700`)
    .join("&")}&display=swap`;

  link.onload = () => {
    console.log(`✅ Preloaded ${fontsToLoad.length} top fonts`);
  };

  document.head.appendChild(link);
  fontsToLoad.forEach(font => loadedFonts.add(font));
}

// -------------------------------------------------------
// 📦 Queue font loading for scroll-time batching
// -------------------------------------------------------
export function queueFontLoad(fontFamily: string): void {
  if (loadedFonts.has(fontFamily) || loadingFonts.has(fontFamily)) return;

  if (SYSTEM_FONTS.includes(fontFamily)) {
    loadedFonts.add(fontFamily);
    return;
  }

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
// 📚 Batch load fonts (efficient single request)
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
// ⏱ Ensure a specific font is loaded immediately
// -------------------------------------------------------
export async function ensureFontLoaded(fontFamily: string): Promise<void> {
  if (loadedFonts.has(fontFamily)) return;

  if (SYSTEM_FONTS.includes(fontFamily)) {
    if (!isFontAvailable(fontFamily)) {
      await batchLoadFonts([fontFamily]);
    }
    loadedFonts.add(fontFamily);
    return;
  }

  if (loadingFonts.has(fontFamily)) {
    return loadingFonts.get(fontFamily)!;
  }

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
// 🧾 Debug / Introspection
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
