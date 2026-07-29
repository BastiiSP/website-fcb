"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, Globe, Shield } from "lucide-react";
import { useConsent } from "@/components/consent/ConsentProvider";

/**
 * Globales Cookie-Banner. Architektur/UX an der 21st.dev-Vorlage orientiert
 * (collapsed Banner → granulare Detailansicht), aber mit fcb.*-Tokens,
 * deutschen Texten und nativem HTML/Tailwind statt shadcn-Komponenten.
 * Slide-in von unten via Framer Motion.
 */
export default function CookieBanner() {
  const {
    isOpen,
    isLoaded,
    consent,
    acceptAll,
    acceptEssential,
    savePreferences,
  } = useConsent();

  // Detailansicht (granulare Auswahl) ein-/ausgeklappt.
  const [showDetails, setShowDetails] = useState(false);
  // Lokaler Schalterzustand für "Externe Inhalte" innerhalb der Detailansicht.
  const [externeInhalte, setExterneInhalte] = useState(false);

  // Bei jedem Öffnen den Schalter mit dem gespeicherten Wert vorbelegen und die
  // Detailansicht zurückklappen. So zeigt das erneute Öffnen aus dem Footer die
  // zuletzt getroffene Wahl an.
  useEffect(() => {
    if (isOpen) {
      setExterneInhalte(consent?.externeInhalte ?? false);
      setShowDetails(false);
    }
  }, [isOpen, consent]);

  // Vor dem clientseitigen Laden nichts rendern → kein Flash, kein Mismatch.
  if (!isLoaded) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="cookie-banner"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          role="dialog"
          aria-label="Cookie-Einstellungen"
          className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 sm:px-6 sm:pb-6"
        >
          <div className="mx-auto max-w-2xl rounded-xl border border-fcb-border bg-fcb-surface p-5 text-fcb-text shadow-2xl sm:p-6">
            {/* Kopf */}
            <div className="flex items-start gap-3">
              <Cookie className="mt-0.5 h-6 w-6 shrink-0 text-fcb-accent" />
              <div>
                <h2 className="font-oswald text-lg font-semibold uppercase tracking-wide">
                  Datenschutz-Einstellungen
                </h2>
                <p className="mt-1 font-inter text-sm text-fcb-muted">
                  Wir verwenden notwendige Cookies für den Betrieb der Seite.
                  Für eingebettete externe Inhalte (z. B. Live-Ergebnisse und
                  Tabellen) benötigen wir deine Einwilligung. Mehr dazu in der{" "}
                  <Link
                    href="/datenschutz"
                    className="text-fcb-accent underline-offset-2 hover:underline"
                  >
                    Datenschutzerklärung
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Detailansicht: granulare Kategorien */}
            <AnimatePresence initial={false}>
              {showDetails && (
                <motion.div
                  key="details"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 flex flex-col gap-3 border-t border-fcb-border pt-4">
                    {/* Notwendig – immer aktiv, nicht abwählbar */}
                    <CategoryRow
                      icon={<Shield className="h-5 w-5 text-fcb-accent" />}
                      title="Notwendig"
                      description="Für Login-Sitzung und Grundfunktionen erforderlich. Immer aktiv."
                      checked
                      disabled
                    />
                    {/* Externe Inhalte – Opt-in */}
                    <CategoryRow
                      icon={<Globe className="h-5 w-5 text-fcb-accent" />}
                      title="Externe Inhalte"
                      description="Erlaubt das Einbetten von Drittanbieter-Widgets wie Live-Ergebnissen und Tabellen."
                      checked={externeInhalte}
                      onChange={setExterneInhalte}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buttons. Reihenfolge per order-* so, dass "Alle akzeptieren"
                mobil oben, auf Desktop rechts steht (primäre Aktion). */}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              {!showDetails ? (
                <button
                  type="button"
                  onClick={() => setShowDetails(true)}
                  className="order-3 rounded-lg border border-fcb-border px-4 py-2 font-inter text-sm font-medium text-fcb-text transition-colors hover:border-fcb-accent hover:text-fcb-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fcb-accent sm:order-1 sm:mr-auto"
                >
                  Einstellungen
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => savePreferences(externeInhalte)}
                  className="order-3 rounded-lg border border-fcb-border px-4 py-2 font-inter text-sm font-medium text-fcb-text transition-colors hover:border-fcb-accent hover:text-fcb-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fcb-accent sm:order-1 sm:mr-auto"
                >
                  Auswahl speichern
                </button>
              )}
              <button
                type="button"
                onClick={acceptEssential}
                className="order-2 rounded-lg border border-fcb-border px-4 py-2 font-inter text-sm font-medium text-fcb-text transition-colors hover:border-fcb-accent hover:text-fcb-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fcb-accent"
              >
                Nur Notwendiges
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="order-1 rounded-lg bg-fcb-accent px-4 py-2 font-inter text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fcb-accent focus-visible:ring-offset-2 focus-visible:ring-offset-fcb-surface sm:order-3"
              >
                Alle akzeptieren
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Eine Kategorie-Zeile mit nativem Toggle (Checkbox als Switch gestylt) –
 * ersetzt den shadcn-Switch. "disabled" graut die notwendige Kategorie aus.
 */
function CategoryRow({
  icon,
  title,
  description,
  checked,
  disabled = false,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0">{icon}</span>
        <div>
          <p className="font-inter text-sm font-medium text-fcb-text">
            {title}
          </p>
          <p className="font-inter text-xs text-fcb-muted">{description}</p>
        </div>
      </div>
      {/* Nativer Switch: sr-only-Checkbox + zwei gestylte Spans (Track + Knopf).
          peer-checked steuert Farbe und Verschiebung des Knopfs. */}
      <label
        className={`relative inline-flex h-6 w-11 shrink-0 ${
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        }`}
      >
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          aria-label={title}
        />
        <span className="absolute inset-0 rounded-full bg-fcb-border transition-colors peer-checked:bg-fcb-accent peer-focus-visible:ring-2 peer-focus-visible:ring-fcb-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-fcb-surface" />
        <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-fcb-text transition-transform peer-checked:translate-x-5" />
      </label>
    </div>
  );
}
