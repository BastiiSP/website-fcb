"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CONSENT_ALL,
  CONSENT_ESSENTIAL,
  type ConsentState,
  loadConsent,
  saveConsent,
} from "@/lib/consent";

interface ConsentContextValue {
  /** Aktueller Consent oder null, solange noch keine Entscheidung vorliegt. */
  consent: ConsentState | null;
  /** true, sobald localStorage clientseitig gelesen wurde (Hydration-Guard). */
  isLoaded: boolean;
  /** true, wenn Banner/Dialog sichtbar sein soll. */
  isOpen: boolean;
  /** Alle Kategorien akzeptieren. */
  acceptAll: () => void;
  /** Nur notwendige Kategorien akzeptieren. */
  acceptEssential: () => void;
  /** Individuelle Auswahl speichern (notwendig bleibt immer true). */
  savePreferences: (externeInhalte: boolean) => void;
  /** Einstellungen erneut öffnen (z. B. aus dem Footer). */
  openSettings: () => void;
  /** Prüft, ob für eine Kategorie Consent vorliegt. */
  hasConsent: (category: keyof ConsentState) => boolean;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Beim ersten Client-Render aus localStorage laden. Liegt keine Entscheidung
  // vor (null), Banner öffnen. Läuft nur clientseitig → kein Hydration-Mismatch.
  useEffect(() => {
    const stored = loadConsent();
    setConsent(stored);
    setIsOpen(stored === null);
    setIsLoaded(true);
  }, []);

  // Gemeinsame Persistenz: speichern, State setzen, Banner schließen.
  const persist = useCallback((next: ConsentState) => {
    saveConsent(next);
    setConsent(next);
    setIsOpen(false);
  }, []);

  const acceptAll = useCallback(() => persist(CONSENT_ALL), [persist]);
  const acceptEssential = useCallback(
    () => persist(CONSENT_ESSENTIAL),
    [persist],
  );
  const savePreferences = useCallback(
    (externeInhalte: boolean) => persist({ notwendig: true, externeInhalte }),
    [persist],
  );
  const openSettings = useCallback(() => setIsOpen(true), []);

  const hasConsent = useCallback(
    (category: keyof ConsentState) => {
      // "notwendig" ist immer erlaubt – unabhängig vom gespeicherten Status.
      if (category === "notwendig") return true;
      return consent?.[category] === true;
    },
    [consent],
  );

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      isLoaded,
      isOpen,
      acceptAll,
      acceptEssential,
      savePreferences,
      openSettings,
      hasConsent,
    }),
    [
      consent,
      isLoaded,
      isOpen,
      acceptAll,
      acceptEssential,
      savePreferences,
      openSettings,
      hasConsent,
    ],
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}

/** Zugriff auf den Consent-Status. Muss innerhalb von <ConsentProvider> laufen. */
export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error(
      "useConsent muss innerhalb von <ConsentProvider> verwendet werden",
    );
  }
  return ctx;
}
