"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

/**
 * Sauberer Light/Dark-Umschalter (ersetzt den alten Emoji-/fixed-Toggle).
 * Zeigt das Icon des ZIEL-Themes (Sonne wenn aktuell dunkel → klick = hell).
 * Semantische Tokens → funktioniert in beiden Themes.
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const zielIstHell = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={zielIstHell ? "Zu hellem Design wechseln" : "Zu dunklem Design wechseln"}
      className="inline-flex items-center gap-2 rounded-lg border border-fcb-border bg-fcb-surface px-3 py-2 font-inter text-sm text-fcb-muted transition-colors hover:text-fcb-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue"
    >
      {zielIstHell ? <Sun size={16} /> : <Moon size={16} />}
      <span>{zielIstHell ? "Hell" : "Dunkel"}</span>
    </button>
  );
}
