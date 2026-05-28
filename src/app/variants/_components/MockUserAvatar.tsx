"use client";

/**
 * Platzhalter-Avatar rechts in der Variants-Navbar. Keine echte Auth-Logik,
 * nur ein visuelles Element für die Design-Exploration. Initialen sind statisch.
 */
export default function MockUserAvatar() {
  return (
    <button
      type="button"
      // Bewusst nicht-klickbar (kein onClick) – nur visuell.
      className="flex h-9 w-9 items-center justify-center rounded-full bg-fcb-blue font-inter text-sm font-semibold text-white ring-2 ring-white/20 transition hover:ring-white/40"
      aria-label="Nutzer-Menü (Platzhalter)"
    >
      SP
    </button>
  );
}
