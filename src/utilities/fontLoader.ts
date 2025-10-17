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
  