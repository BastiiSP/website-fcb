// Zentrale Theme-Konstanten + DOM-Anwendung. Bewusst framework-frei, damit
// dasselbe Snippet auch im FOUC-Inline-Script (layout.tsx) genutzt werden kann.
export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";
export const DEFAULT_THEME: Theme = "dark";

/** Setzt das Theme als Klasse auf <html> und persistiert es. */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}
