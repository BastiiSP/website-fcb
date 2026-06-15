import type { ReactNode } from "react";

/**
 * Gemeinsames Layout für die statischen Rechtstextseiten (Impressum,
 * Datenschutz). Server-Komponente – rein präsentativer, statischer Inhalt,
 * also kein "use client" nötig. Setzt den verbindlichen dunklen fcb-Look
 * (Hintergrund, Oswald-Headline, Inter-Fließtext) und hält Gliederung und
 * Abstände beider Seiten konsistent.
 *
 * Wichtig: ConditionalChrome rendert bereits ein <main>-Element um alle Routen
 * (mit pt-14 für die 56px hohe Navbar). Diese Komponente nutzt deshalb
 * <article>, um kein zweites <main> im DOM zu erzeugen (sonst ungültiges HTML).
 */
export function RechtstextLayout({
  titel,
  stand,
  children,
}: {
  /** Seitentitel (H1), z. B. „Impressum". */
  titel: string;
  /** Stand der letzten Aktualisierung, z. B. „Juni 2026". */
  stand: string;
  children: ReactNode;
}) {
  return (
    // min-h-[calc(100vh-3.5rem)]: füllt den Bereich unter der 56px-Navbar
    // (pt-14 in ConditionalChrome) mit dem dunklen Hintergrund, damit die Seite
    // auch bei wenig Inhalt nicht auf den hellen Legacy-Body durchscheint.
    <article className="min-h-[calc(100vh-3.5rem)] bg-fcb-bg px-4 py-12 text-fcb-text sm:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-oswald text-4xl font-bold uppercase tracking-tight sm:text-5xl">
          {titel}
        </h1>

        <div className="mt-8 space-y-10">{children}</div>

        <p className="mt-12 font-inter text-sm text-fcb-muted">
          Letzte Aktualisierung: {stand}
        </p>
      </div>
    </article>
  );
}

/**
 * Eine Sektion innerhalb einer Rechtstextseite: Oswald-Zwischenüberschrift +
 * Inter-Fließtext. Kapselt Typografie und Abstände, damit beide Seiten optisch
 * identisch gegliedert sind.
 */
export function RechtstextSektion({
  titel,
  children,
}: {
  /** Überschrift der Sektion (H2). */
  titel: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="font-oswald text-2xl font-semibold uppercase tracking-tight text-fcb-text sm:text-3xl">
        {titel}
      </h2>
      {/* leading-relaxed + leicht gedämpftes Weiß (text-fcb-text/80) für gut
          lesbaren Fließtext auf dunklem Grund; WCAG-AA-Kontrast bleibt erfüllt. */}
      <div className="mt-3 space-y-3 font-inter leading-relaxed text-fcb-text/80">
        {children}
      </div>
    </section>
  );
}
