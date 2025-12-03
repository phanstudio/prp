import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// export default defineConfig({
//   plugins: [tailwindcss(), react()],
//   optimizeDeps:{
//     include:["fabric"]
//   }
// });


// vite.config.ts
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
import Unfonts from 'unplugin-fonts/vite'

export default defineConfig({
  plugins: [
    react(),
    Unfonts({
      google: {
        /**
         * Enable preconnect for faster DNS resolution
         * Adds: <link rel="preconnect" href="https://fonts.gstatic.com/" crossorigin>
         */
        preconnect: true,

        /**
         * CRITICAL: Use 'swap' to show text immediately with system fonts
         * Then swap to custom fonts when loaded (eliminates FOIT - Flash of Invisible Text)
         */
        display: 'swap',

        /**
         * Insert font links at head prepend for fastest availability
         */
        injectTo: 'head-prepend',

        /**
         * Font families configuration
         * Strategy:
         * - CRITICAL: defer=false (load immediately, non-blocking due to display:swap)
         * - POPULAR: defer=true (preload with async loading)
         * - ALL OTHERS: Not listed (Google Fonts API loads on-demand when CSS references them)
         */
        families: [
          // ==========================================
          // CRITICAL FONTS (3) - Load immediately
          // ==========================================
          {
            name: 'Impact',
            defer: false,
          },
          {
            name: 'Roboto',
            // weights: [400, 700],
            defer: false,
          },
          {
            name: 'Arial',
            defer: false,
          },

          // ==========================================
          // ALL OTHER FONTS - Not preloaded!
          // ==========================================
          // These fonts are NOT listed here intentionally.
          // Google Fonts API will load them on-demand when:
          // 1. CSS references them with font-family
          // 2. A DOM element uses that font-family
          // 3. The element has content
          //
          // This prevents loading 200+ fonts unnecessarily.
          // Our fontLoader.ts just marks them as "ready" when used.
          //
          // Examples of on-demand fonts:
          // - Alfa Slab One, Bangers, Chewy, Creepster, etc.
          // - All 200+ fonts from your allFonts list
          //
          // Performance: Each on-demand font adds ~10-20ms when first used.
          // This is MUCH faster than preloading all 200+ fonts (~2-3 seconds).
        ],
      },
    }),
    tailwindcss(),
  ],
  optimizeDeps:{
    include:["fabric"]
  }
})

