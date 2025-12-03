import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import Unfonts from "unplugin-fonts/vite";

// Only Google fonts here
const GOOGLE_FONTS = [
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

export default defineConfig({
  plugins: [
    react(),
    Unfonts({
      google: {
        preconnect: true,
        display: "swap",
        injectTo: "head-prepend",

        families: GOOGLE_FONTS.map((name) => ({
          name,
          defer: true,
        })),
      },
    }),
    tailwindcss(),
  ],

  optimizeDeps: {
    include: ["fabric"]
  }
});
