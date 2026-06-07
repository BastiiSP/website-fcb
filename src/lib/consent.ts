// Zentrale Consent-Logik (DSGVO) – Typen, Konstanten und localStorage-Helfer.
// Bewusst frei von React: so kann auch nicht-React-Code (z. B. künftige
// Widget-Loader) den Status lesen, ohne den Context zu benötigen.

/**
 * Consent-Kategorien. "notwendig" ist immer aktiv und nicht abwählbar
 * (technisch notwendige Cookies wie die Login-Sitzung). "externeInhalte" ist
 * das Opt-in für Drittanbieter-Einbettungen (Live-Scores, Tabellen).
 */
export interface ConsentState {
  notwendig: true;
  externeInhalte: boolean;
}

/**
 * localStorage-Schlüssel. Versioniert (_v1), damit spätere Schema-Änderungen
 * alte/inkompatible Einträge gezielt verwerfen können, indem der Suffix steigt.
 */
export const CONSENT_STORAGE_KEY = "fcb_consent_v1";

/** Vorlage: alles akzeptiert. */
export const CONSENT_ALL: ConsentState = {
  notwendig: true,
  externeInhalte: true,
};

/** Vorlage: nur Notwendiges. */
export const CONSENT_ESSENTIAL: ConsentState = {
  notwendig: true,
  externeInhalte: false,
};

/**
 * Liest den gespeicherten Consent aus localStorage.
 * Gibt null zurück, wenn nichts gespeichert oder der Eintrag ungültig/veraltet
 * ist (→ es liegt "keine Entscheidung" vor, das Banner muss erscheinen).
 * SSR-sicher: liefert serverseitig immer null (kein window).
 */
export function loadConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    // Validierung: externeInhalte muss ein Boolean sein, sonst Eintrag verwerfen.
    if (typeof parsed.externeInhalte !== "boolean") return null;
    return { notwendig: true, externeInhalte: parsed.externeInhalte };
  } catch {
    // Defekter JSON-Eintrag → wie "keine Entscheidung" behandeln.
    return null;
  }
}

/** Speichert den Consent dauerhaft in localStorage. */
export function saveConsent(state: ConsentState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage nicht verfügbar (Private Mode, deaktiviert) – still ignorieren.
  }
}
