// // -----------------------------
// // 🚀 Font Loader with Detection + Failsafe
// // -----------------------------

// // Fonts likely NOT available on mobile → map to similar alternates
// const FONT_FAILSAFE_MAP: Record<string, string[]> = {
//   Impact: ["Anton", "Bebas Neue", "Oswald"],
//   "Comic Sans MS": ["Comic Neue", "Patrick Hand"],
//   "Times New Roman": ["Noto Serif", "PT Serif"],
//   "Courier New": ["Roboto Mono", "Source Code Pro"],
//   Garamond: ["Cormorant Garamond", "EB Garamond"],
//   "Palatino Linotype": ["Cormorant", "Noto Serif"],
// };

// // System fonts
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

// // Preload top fonts
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


// // -------------------------------------------------------
// // 📱 Mobile detection
// // -------------------------------------------------------
// const IS_MOBILE =
//   typeof window !== "undefined" &&
//   /Android|iPhone|iPad|iPod|Mobile|SamsungBrowser/i.test(
//     navigator.userAgent
//   );

// // -------------------------------------------------------
// // 🎭 Mobile Replacement Map (NOT fallback)
// // -------------------------------------------------------
// const MOBILE_FONT_REPLACE_MAP: Record<string, string> = {
//   Impact: "Anton",
//   "Comic Sans MS": "Comic Neue",
//   "Times New Roman": "Noto Serif",
//   "Courier New": "Roboto Mono",
//   Garamond: "Cormorant Garamond",
//   "Palatino Linotype": "Cormorant",
// };


// // Internal state
// const loadedFonts = new Set<string>();
// const loadingFonts = new Map<string, Promise<void>>();
// const fontLoadQueue = new Set<string>();
// let batchLoadTimer: ReturnType<typeof setTimeout> | null = null;

// // -------------------------------------------------------
// // 🔍 Font detection
// // -------------------------------------------------------
// function isFontAvailable(fontFamily: string): boolean {
//   if ("fonts" in document && typeof (document as any).fonts.check === "function") {
//     if ((document as any).fonts.check(`12px "${fontFamily}"`)) {
//       return true;
//     }
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

// // -------------------------------------------------------
// export function initFontLoader(): void {
//   verifySystemFonts();
//   preloadTopFonts();
//   console.log("🎨 Font loader initialized");
// }

// // -------------------------------------------------------
// function verifySystemFonts(): void {
//   const missingFonts = SYSTEM_FONTS.filter(f => !isFontAvailable(f));

//   if (missingFonts.length > 0) {
//     console.warn("⚠️ Missing system fonts, loading via Google:", missingFonts);
//     batchLoadFonts(missingFonts);
//   }

//   SYSTEM_FONTS.forEach(f => loadedFonts.add(f));
// }

// // -------------------------------------------------------
// function preloadTopFonts(): void {
//   const fontsToLoad = TOP_FONTS.filter(
//     font => !SYSTEM_FONTS.includes(font) && !loadedFonts.has(font)
//   );

//   if (fontsToLoad.length === 0) return;

//   const link = document.createElement("link");
//   link.rel = "stylesheet";
//   link.href = `https://fonts.googleapis.com/css2?${fontsToLoad
//     .map(f => `family=${f.replace(/ /g, "+")}:wght@400;700`)
//     .join("&")}&display=swap`;

//   link.onload = () => {
//     console.log(`✅ Preloaded ${fontsToLoad.length} top fonts`);
//   };

//   document.head.appendChild(link);
//   fontsToLoad.forEach(font => loadedFonts.add(font));
// }

// // -------------------------------------------------------
// export function queueFontLoad(fontFamily: string): void {
//   if (loadedFonts.has(fontFamily) || loadingFonts.has(fontFamily)) return;

//   if (SYSTEM_FONTS.includes(fontFamily)) {
//     loadedFonts.add(fontFamily);
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
// function batchLoadFonts(fonts: string[]): void {
//   if (fonts.length === 0) return;

//   const link = document.createElement("link");
//   link.rel = "stylesheet";
//   link.href = `https://fonts.googleapis.com/css2?${fonts
//     .map(f => `family=${f.replace(/ /g, "+")}:wght@400;700`)
//     .join("&")}&display=swap`;

//   const loadPromise = new Promise<void>(resolve => {
//     link.onload = () => {
//       fonts.forEach(font => {
//         loadedFonts.add(font);
//         loadingFonts.delete(font);
//       });
//       console.log(`📦 Loaded ${fonts.length} fonts:`, fonts.join(", "));
//       resolve();
//     };

//     link.onerror = () => {
//       console.warn("❌ Failed to load fonts:", fonts);
//       fonts.forEach(font => loadingFonts.delete(font));
//       resolve();
//     };
//   });

//   document.head.appendChild(link);
//   fonts.forEach(font => loadingFonts.set(font, loadPromise));
// }

// // -------------------------------------------------------
// // ⭐ ENSURE FONT LOADED + MOBILE FAILSAFE
// // -------------------------------------------------------
// export async function ensureFontLoaded(fontFamily: string): Promise<void> {

//   // 📱 Mobile-only replacement (NOT fallback)
//   if (IS_MOBILE && MOBILE_FONT_REPLACE_MAP[fontFamily]) {
//     console.log(`📱 Mobile replacing '${fontFamily}' → '${MOBILE_FONT_REPLACE_MAP[fontFamily]}'`);
//     fontFamily = MOBILE_FONT_REPLACE_MAP[fontFamily];
//   }

//   // Already loaded?
//   if (loadedFonts.has(fontFamily)) return;

//   // If available locally, done
//   if (isFontAvailable(fontFamily)) {
//     loadedFonts.add(fontFamily);
//     return;
//   }

//   // If loading already
//   if (loadingFonts.has(fontFamily)) {
//     return loadingFonts.get(fontFamily)!;
//   }

//   // Try loading primary font
//   const loadPromise = new Promise<void>(resolve => {
//     const link = document.createElement("link");
//     link.rel = "stylesheet";
//     link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(
//       / /g,
//       "+"
//     )}:wght@400;700&display=swap`;

//     link.onload = () => {
//       loadedFonts.add(fontFamily);
//       loadingFonts.delete(fontFamily);
//       console.log(`✨ Loaded font: ${fontFamily}`);
//       resolve();
//     };

//     link.onerror = async () => {
//       console.warn(`❌ Failed to load font: ${fontFamily}`);

//       // 🔥 FAILSAFE: Try alternate fonts
//       const fallbacks = FONT_FAILSAFE_MAP[fontFamily] || [];

//       for (const fallback of fallbacks) {
//         console.log(`➡️ Trying fallback font: ${fallback}`);
//         await ensureFontLoaded(fallback);
//         loadedFonts.add(fallback);
//         break;
//       }

//       loadingFonts.delete(fontFamily);
//       resolve();
//     };

//     document.head.appendChild(link);
//   });

//   loadingFonts.set(fontFamily, loadPromise);
//   return loadPromise;
// }

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
//   };
// }


// src/utilities/fontLoader.ts

// Fonts to load from local files
export const DOWNLOADABLE_FONTS = [
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

// Common system fonts to check for
const COMMON_SYSTEM_FONTS = [
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
  "Impact",
  "Comic Sans MS",
];

// Internal state
const loadedFonts = new Set<string>();
const loadingFonts = new Map<string, Promise<void>>();
const fontLoadQueue = new Set<string>();
const detectedSystemFonts = new Set<string>();
let batchLoadTimer: ReturnType<typeof setTimeout> | null = null;

// -------------------------------------------------------
// 🔍 Font detection
// -------------------------------------------------------
function isFontAvailable(fontFamily: string): boolean {
  if ("fonts" in document && typeof (document as any).fonts.check === "function") {
    try {
      if ((document as any).fonts.check(`12px "${fontFamily}"`)) {
        return true;
      }
    } catch (e) {
      // Fallback to canvas method
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
// 🎯 Initialize Font Loader
// -------------------------------------------------------
export function initFontLoader(): void {
  detectSystemFonts();
  preloadDownloadableFonts();
  console.log("🎨 Font loader initialized");
  console.log(`✅ ${detectedSystemFonts.size} system fonts detected:`, Array.from(detectedSystemFonts));
}

// -------------------------------------------------------
// 🔍 Detect system fonts
// -------------------------------------------------------
function detectSystemFonts(): void {
  // Check common system fonts
  COMMON_SYSTEM_FONTS.forEach(font => {
    if (isFontAvailable(font)) {
      detectedSystemFonts.add(font);
      loadedFonts.add(font);
    }
  });

  // Also check if any downloadable fonts are already in the system
  DOWNLOADABLE_FONTS.forEach(font => {
    if (isFontAvailable(font)) {
      detectedSystemFonts.add(font);
      loadedFonts.add(font);
      console.log(`🎁 Bonus: "${font}" found in system!`);
    }
  });
}

// -------------------------------------------------------
// 📥 Preload downloadable fonts from local files
// -------------------------------------------------------
function preloadDownloadableFonts(): void {
  // Only load fonts NOT already in the system
  const fontsToLoad = DOWNLOADABLE_FONTS.filter(
    font => !detectedSystemFonts.has(font) && !loadedFonts.has(font)
  );

  if (fontsToLoad.length === 0) {
    console.log("✨ All fonts available in system - no downloads needed!");
    return;
  }

  console.log(`📥 Loading ${fontsToLoad.length} fonts from local files...`);

  // Load each font CSS file
  fontsToLoad.forEach(font => {
    const cssFileName = font.replace(/ /g, '-').toLowerCase();
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `/fonts/${cssFileName}.css`;
    
    link.onload = () => {
      loadedFonts.add(font);
      console.log(`✅ Loaded local font: ${font}`);
    };

    link.onerror = () => {
      console.warn(`⚠️ Failed to load local font: ${font}`);
    };

    document.head.appendChild(link);
  });
}

// -------------------------------------------------------
// 📋 Queue font for batch loading
// -------------------------------------------------------
export function queueFontLoad(fontFamily: string): void {
  // Already loaded or loading
  if (loadedFonts.has(fontFamily) || loadingFonts.has(fontFamily)) return;

  // System font detected - mark as loaded
  if (detectedSystemFonts.has(fontFamily)) {
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
// 📦 Batch load fonts from local files
// -------------------------------------------------------
function batchLoadFonts(fonts: string[]): void {
  // Filter out system fonts
  const fontsToLoad = fonts.filter(font => !detectedSystemFonts.has(font));
  
  if (fontsToLoad.length === 0) return;

  fontsToLoad.forEach(font => {
    const cssFileName = font.replace(/ /g, '-').toLowerCase();
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `/fonts/${cssFileName}.css`;

    const loadPromise = new Promise<void>(resolve => {
      link.onload = () => {
        loadedFonts.add(font);
        loadingFonts.delete(font);
        console.log(`📦 Batch loaded: ${font}`);
        resolve();
      };

      link.onerror = () => {
        console.warn(`❌ Failed to batch load: ${font}`);
        loadingFonts.delete(font);
        resolve();
      };
    });

    document.head.appendChild(link);
    loadingFonts.set(font, loadPromise);
  });
}

// -------------------------------------------------------
// ⭐ Ensure font is loaded (prefer system, fallback to local)
// -------------------------------------------------------
export async function ensureFontLoaded(fontFamily: string): Promise<void> {
  // Already loaded?
  if (loadedFonts.has(fontFamily)) return;

  // System font? Just mark as loaded
  if (detectedSystemFonts.has(fontFamily)) {
    loadedFonts.add(fontFamily);
    return;
  }

  // Check if font is available in system (not previously detected)
  if (isFontAvailable(fontFamily)) {
    detectedSystemFonts.add(fontFamily);
    loadedFonts.add(fontFamily);
    console.log(`🎁 Found "${fontFamily}" in system!`);
    return;
  }

  // Currently loading?
  if (loadingFonts.has(fontFamily)) {
    return loadingFonts.get(fontFamily)!;
  }

  // Load from local file
  const cssFileName = fontFamily.replace(/ /g, '-').toLowerCase();
  const loadPromise = new Promise<void>(resolve => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `/fonts/${cssFileName}.css`;

    link.onload = () => {
      loadedFonts.add(fontFamily);
      loadingFonts.delete(fontFamily);
      console.log(`✨ Loaded local font: ${fontFamily}`);
      resolve();
    };

    link.onerror = () => {
      console.warn(`❌ Failed to load local font: ${fontFamily}`);
      loadingFonts.delete(fontFamily);
      resolve();
    };

    document.head.appendChild(link);
  });

  loadingFonts.set(fontFamily, loadPromise);
  return loadPromise;
}

// -------------------------------------------------------
// 📊 Helper functions
// -------------------------------------------------------
export function isFontLoaded(fontFamily: string): boolean {
  return loadedFonts.has(fontFamily);
}

export function isFontLoading(fontFamily: string): boolean {
  return loadingFonts.has(fontFamily);
}

export function isSystemFont(fontFamily: string): boolean {
  return detectedSystemFonts.has(fontFamily);
}

export function getFontStats() {
  return {
    loaded: loadedFonts.size,
    loading: loadingFonts.size,
    queued: fontLoadQueue.size,
    systemFonts: detectedSystemFonts.size,
    loadedList: Array.from(loadedFonts),
    systemFontsList: Array.from(detectedSystemFonts),
  };
}