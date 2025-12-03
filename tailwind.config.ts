import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Tailwind scans these files
  ],
  theme: {
    extend: {
      fontFamily: {
        impact: ["Impact", "sans-serif"],
        arial: ["Arial", "sans-serif"],
        comic: ["Comic Sans MS", "cursive"],
        times: ["Times New Roman", "serif"],
        courier: ["Courier New", "monospace"],
        verdana: ["Verdana", "sans-serif"],

        roboto: ["Roboto", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
      },
    },
  },
//   plugins: [require("daisyui")],
};

export default config;
