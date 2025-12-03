import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Tailwind scans these files
  ],
  theme: {
    extend: {
      fontFamily: {
        // Local Impact font
        impact: ["Impact", "sans-serif"],
        // Google fonts via unplugin-fonts
        roboto: ["Roboto", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        // Add other custom fonts here
      },
    },
  },
//   plugins: [require("daisyui")],
};

export default config;
