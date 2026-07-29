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
          // Semantische Tokens – lösen per CSS-Variablen auf (.dark / .light auf <html>).
          // <alpha-value> ermöglicht Opacity-Modifier wie bg-fcb-surface/80.
          // RGB-Kanäle space-separiert in globals.css (kein rgb()-Wrapper dort).
          bg:      "rgb(var(--color-bg) / <alpha-value>)",
          surface: "rgb(var(--color-surface) / <alpha-value>)",
          footer:  "rgb(var(--color-footer) / <alpha-value>)",
          border:  "rgb(var(--color-border) / <alpha-value>)",
          text:    "rgb(var(--color-text) / <alpha-value>)",
          muted:   "rgb(var(--color-muted) / <alpha-value>)",
          nav:     "rgb(var(--color-nav) / <alpha-value>)",
          // Marken-Akzent des aufgerufenen Auftritts (Multi-Tenant):
          // löst über --color-accent auf, gesetzt per data-tenant auf <html>
          // (FCB = blau, JFG = rot). Für ALLES generische Marken-Chrome.
          accent:  "rgb(var(--color-accent) / <alpha-value>)",
          // Feste Trägerfarben – nur für die Zuordnung einzelner Mannschaften
          // (getTeamAccent) und den Vereins-Switcher, tenant-unabhängig.
          blue:    "#1d5fad", // Brand-Akzent – in beiden Themes konstant
          red:     "#cc1f1f", // Brand-Akzent – in beiden Themes konstant
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
