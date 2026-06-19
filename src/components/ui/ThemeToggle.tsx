"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

/**
 * Light/Dark-Switcher als gleitender Schalter (FCB-Blau aktiv = Dark).
 * Sonne/Mond an den Track-Enden, Knopf gleitet. role="switch" + aria-checked.
 * Verwendet in Footer und (da Auth chrome-frei) im PitchAuthShell.
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const istDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={istDark}
      onClick={toggleTheme}
      aria-label={istDark ? "Zu hellem Design wechseln" : "Zu dunklem Design wechseln"}
      title={istDark ? "Hell" : "Dunkel"}
      className={`relative inline-flex h-7 w-14 items-center rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue focus-visible:ring-offset-2 focus-visible:ring-offset-fcb-surface ${
        istDark ? "border-fcb-blue bg-fcb-blue" : "border-fcb-border bg-fcb-surface"
      }`}
    >
      {/* Icons an den Track-Enden */}
      <Sun size={12} className={`absolute left-1.5 ${istDark ? "text-white/60" : "text-fcb-blue"}`} aria-hidden="true" />
      <Moon size={12} className={`absolute right-1.5 ${istDark ? "text-white" : "text-fcb-muted"}`} aria-hidden="true" />
      {/* Gleitender Knopf */}
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          istDark ? "translate-x-8" : "translate-x-1"
        }`}
      />
    </button>
  );
}
