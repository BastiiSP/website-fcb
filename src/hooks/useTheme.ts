"use client";

import { useCallback, useEffect, useState } from "react";
import { applyTheme, DEFAULT_THEME, THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

/**
 * Liest das aktive Theme aus der <html>-Klasse (vom FOUC-Script vorgesetzt) und
 * erlaubt Umschalten. Schreibt Klasse + localStorage über applyTheme.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  // Nach Mount den tatsächlichen Zustand aus dem DOM übernehmen (das Inline-
  // Script hat .dark/.light bereits vor dem Paint gesetzt → kein Flackern).
  useEffect(() => {
    const current = document.documentElement.classList.contains("light")
      ? "light"
      : "dark";
    setThemeState(current);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    applyTheme(t);
    setThemeState(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(
      document.documentElement.classList.contains("light") ? "dark" : "light",
    );
  }, [setTheme]);

  return { theme, toggleTheme, setTheme };
}

// localStorage-Key für externe Nutzung re-exportiert
export { THEME_STORAGE_KEY };
