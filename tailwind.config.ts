import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx,js,jsx}", // durchsucht alle Komponenten und Seiten
  ],
  theme: {
    extend: {
      colors: {
        // FCB Design-Tokens – abgestimmt mit Claudian (Obsidian)
        // Basis-Palette (beide Bereiche: FCB + JFG)
        fcb: {
          bg:          "#0a0a0a", // fast schwarz – Hintergrund, Hero
          surface:     "#161616", // dunkelgrau – Cards, Panels
          border:      "#2a2a2a", // Trennlinien, Rahmen
          text:        "#ffffff", // Primärtext
          muted:       "#888888", // Datum, Metainfo, Sekundärtext
          nav:         "#52525b", // Navbar-Hintergrund (zinc-600)
          // Akzentfarben
          blue:        "#1d5fad", // FCB-Akzent – Stadtfarbe Burgkunstadt
          red:         "#cc1f1f", // JFG-Akzent – JFG Kunstadt-Obermain Wappenfarbe
        },
      },
      fontFamily: {
        display: ["Oswald", "sans-serif"], // Headlines, Sektions-Titel
        sans:    ["Inter", "sans-serif"],  // Fließtext (Next.js Standard)
        // Aliases mit CSS-Variablen-Bindung an next/font/google – ausschließlich
        // für die /variants/*-Routen. So bleibt die bestehende App unverändert,
        // während die Hero-Varianten korrekt Oswald/Inter laden.
        oswald: ["var(--font-oswald)", "Oswald", "ui-sans-serif", "sans-serif"],
        inter:  ["var(--font-inter)",  "Inter",  "ui-sans-serif", "sans-serif"],
      },
    },
  },
  darkMode: "class", // wichtig: Umschaltung per .dark-Klasse möglich
  plugins: [
    forms,
  ],
};

export default config;
