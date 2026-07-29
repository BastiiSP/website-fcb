"use client";

import { Lock } from "lucide-react";
import { useConsent } from "@/components/consent/ConsentProvider";

/**
 * Rendert externen/Drittanbieter-Inhalt nur, wenn Consent für "Externe Inhalte"
 * vorliegt. Andernfalls erscheint ein Platzhalter mit Hinweis und einem Button,
 * der die Cookie-Einstellungen erneut öffnet. Gedacht als Wrapper für alle
 * künftigen Einbettungen (Live-Scores, Tabellen-Widgets etc.).
 *
 * Verwendung:
 *   <ConsentGate titel="Live-Ergebnisse">
 *     <LiveScoreWidget />
 *   </ConsentGate>
 */
export default function ConsentGate({
  children,
  titel = "Dieser externe Inhalt",
}: {
  children: React.ReactNode;
  /** Name des Anbieters/Inhalts für den Platzhaltertext. */
  titel?: string;
}) {
  const { hasConsent, openSettings, isLoaded } = useConsent();

  // Bis localStorage gelesen ist nichts anzeigen – verhindert ein kurzes
  // Aufblitzen des Platzhalters, obwohl Consent bereits erteilt wurde.
  if (!isLoaded) return null;

  // Consent vorhanden → echten Inhalt rendern.
  if (hasConsent("externeInhalte")) {
    return <>{children}</>;
  }

  // Kein Consent → Platzhalter mit Hinweis und Reopen-Button.
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-fcb-border bg-fcb-surface p-6 text-center">
      <Lock className="h-6 w-6 text-fcb-muted" />
      <p className="font-inter text-sm text-fcb-muted">
        {titel} wird ausgeblendet, weil du externe Inhalte noch nicht erlaubt
        hast.
      </p>
      <button
        type="button"
        onClick={openSettings}
        className="rounded-lg bg-fcb-accent px-4 py-2 font-inter text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fcb-accent focus-visible:ring-offset-2 focus-visible:ring-offset-fcb-surface"
      >
        Externe Inhalte erlauben
      </button>
    </div>
  );
}
