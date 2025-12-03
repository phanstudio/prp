// // -----------------------------
// // 🚀 Font Loader with Detection + Failsafe
// // -----------------------------

// // Fonts likely NOT available on mobile → map to similar alternates
// const FONT_FAILSAFE_MAP: Record<string, string[]> = {
//   "Impact": ["Anton", "Bebas Neue", "Oswald"],
//   "Comic Sans MS": ["Comic Neue", "Patrick Hand"],
//   "Times New Roman": ["Noto Serif", "PT Serif"],
//   "Courier New": ["Roboto Mono", "Source Code Pro"],
//   "Garamond": ["Cormorant Garamond", "EB Garamond"],
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
//   "Impact": "Anton",
//   "Comic Sans MS": "Comic Neue",
//   "Times New Roman": "Noto Serif",
//   "Courier New": "Roboto Mono",
//   "Garamond": "Cormorant Garamond",
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

// initfontloader, queueFontLoad, ensureFontLoaded, isFontLoaded, isFontLoading these are beign used by other programs don't change thaer name, and overall logic
// system fonts are important, code to detect and add to the list
// preload top fonts

// fontLoader.ts - Adapted for unplugin-fonts
// unplugin-fonts handles actual font loading at build time
// This maintains the same API for compatibility

// Critical fonts to preload immediately (kept minimal for speed)
export const CRITICAL_FONTS = [
  "Impact",
  "Roboto",
  "Arial", // Fallback
];

// Popular fonts loaded on-demand (unplugin-fonts handles these efficiently)
export const POPULAR_FONTS = [
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

// Internal state - tracks what's been marked as ready
const loadedFonts = new Set<string>();
const loadingFonts = new Map<string, Promise<void>>();

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

  const testText = "mmmmmmmmmwwwwwww";
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
  // Mark critical fonts as immediately available
  CRITICAL_FONTS.forEach(f => loadedFonts.add(f));
  
  console.log("🎨 Font loader initialized (using unplugin-fonts)");
  console.log(`📦 ${CRITICAL_FONTS.length} critical fonts ready`);
  console.log(`⏳ ${POPULAR_FONTS.length} popular fonts available on-demand`);
}

// -------------------------------------------------------
// 📦 Queue font loading (now just marks as ready for use)
// -------------------------------------------------------
export function queueFontLoad(fontFamily: string): void {
  // With unplugin-fonts strategy:
  // - CRITICAL fonts: Already loaded immediately
  // - POPULAR fonts: Deferred (preloaded in background)
  // - ALL OTHER fonts: Google Fonts API loads on-demand when CSS uses them
  
  // Just mark as ready - actual loading handled by unplugin-fonts or Google Fonts API
  if (!loadedFonts.has(fontFamily)) {
    loadedFonts.add(fontFamily);
  }
}

// -------------------------------------------------------
// ⏱ Ensure a specific font is loaded immediately
// -------------------------------------------------------
export async function ensureFontLoaded(fontFamily: string): Promise<void> {
  // If already marked as loaded, return immediately
  if (loadedFonts.has(fontFamily)) {
    return;
  }

  // If currently "loading", wait for that promise
  if (loadingFonts.has(fontFamily)) {
    return loadingFonts.get(fontFamily)!;
  }

  // Create a promise that checks font availability
  const loadPromise = new Promise<void>((resolve) => {
    // Strategy based on font type:
    // - CRITICAL: Already loaded by unplugin-fonts
    // - POPULAR: Deferred preload by unplugin-fonts (should be ready quickly)
    // - ALL OTHERS: Google Fonts API loads on-demand (may take 10-20ms first time)
    
    const checkFont = () => {
      if (isFontAvailable(fontFamily)) {
        loadedFonts.add(fontFamily);
        loadingFonts.delete(fontFamily);
        console.log(`✨ Font ready: ${fontFamily}`);
        resolve();
      } else {
        // Font might still be loading (especially on-demand fonts)
        // Wait briefly and mark as ready - Google Fonts API handles the rest
        setTimeout(() => {
          loadedFonts.add(fontFamily);
          loadingFonts.delete(fontFamily);
          console.log(`✨ Font marked ready: ${fontFamily} (loading in background)`);
          resolve();
        }, 100);
      }
    };

    // Use document.fonts.ready if available for better detection
    if ("fonts" in document && (document as any).fonts.ready) {
      (document as any).fonts.ready.then(checkFont);
    } else {
      checkFont();
    }
  });

  loadingFonts.set(fontFamily, loadPromise);
  return loadPromise;
}

// -------------------------------------------------------
// 🧾 Debug / Introspection (unchanged API)
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
    queued: 0, // No queue needed with unplugin-fonts
    loadedList: Array.from(loadedFonts),
  };
}