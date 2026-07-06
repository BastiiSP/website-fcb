"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, Trophy } from "lucide-react";
import Card from "@/components/ui/Card";
import IconBadge from "@/components/ui/IconBadge";
import { getTeamAccent, type Team } from "@/lib/teams";
import type { Spiel, SpielbetriebDaten } from "@/lib/bfvTypes";

// Spielbetriebs-Card einer Mannschaft (Design-Spec „Cards & Flächen"):
// links die Ligatabelle, rechts nächste Spiele + letzte Ergebnisse.
// Statische Card (nicht interactive) mit Akzentkante in Trägerfarbe.
// Mobile-first: Blöcke untereinander, ab lg zweispaltig; die Tabelle
// scrollt bei Platzmangel horizontal in ihrem eigenen Container.

interface SpielbetriebCardProps {
  team: Team;
  daten: SpielbetriebDaten;
}

/**
 * Formatiert einen Anstoß-Zeitstempel deutsch und deterministisch
 * (feste Zeitzone Europe/Berlin, damit Server- und Client-Render identisch
 * sind – sonst droht ein Hydration-Mismatch bei Nutzern in anderer Zeitzone).
 */
function formatAnstoss(iso: string): string {
  try {
    const datum = new Intl.DateTimeFormat("de-DE", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Europe/Berlin",
    }).format(new Date(iso));
    const zeit = new Intl.DateTimeFormat("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Berlin",
    }).format(new Date(iso));
    return `${datum}, ${zeit} Uhr`;
  } catch {
    return "";
  }
}

/** Nur das Datum (ohne Uhrzeit) – für die kompakte Ergebnisliste. */
function formatDatum(iso: string): string {
  try {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Europe/Berlin",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

/** „Stand"-Angabe im Footer: Datum + Uhrzeit des Datenabrufs. */
function formatStand(iso: string): string {
  try {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Berlin",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

/** Eine Zeile der Spielliste – gespielte Partien zeigen das Ergebnis fett. */
function SpielZeile({ spiel }: { spiel: Spiel }) {
  return (
    // Der Wettbewerbsname (z. B. "Lotto Bayern Kreispokal - Sechzehntelfinale")
    // steckt als Tooltip an der Zeile – sichtbar bleibt die kompakte Spielart.
    <li
      className="border-t border-fcb-border py-2.5 first:border-t-0 first:pt-0 last:pb-0"
      title={spiel.wettbewerb}
    >
      <p className="flex items-baseline justify-between gap-3 font-inter text-xs text-fcb-muted">
        <span>
          {spiel.ergebnis ? formatDatum(spiel.anstoss) : formatAnstoss(spiel.anstoss)}
        </span>
        <span className="shrink-0 uppercase tracking-wide">{spiel.spielart}</span>
      </p>
      <p className="mt-0.5 flex items-baseline justify-between gap-3 font-inter text-sm text-fcb-text">
        <span className="min-w-0">
          {spiel.heim} <span className="text-fcb-muted">–</span> {spiel.gast}
        </span>
        {spiel.ergebnis && (
          <span className="shrink-0 font-semibold tabular-nums">{spiel.ergebnis}</span>
        )}
      </p>
    </li>
  );
}

export default function SpielbetriebCard({ team, daten }: SpielbetriebCardProps) {
  const accent = getTeamAccent(team.traeger);
  const reduceMotion = useReducedMotion();

  const hatTabelle = daten.tabelle.length > 0;
  const hatNaechste = daten.naechsteSpiele.length > 0;
  const hatLetzte = daten.letzteSpiele.length > 0;

  return (
    <motion.article
      // Dezente Einblendung wie bei den TeamCards (Homepage-Muster);
      // initial={false} deaktiviert sie bei „Bewegung reduzieren".
      initial={reduceMotion ? false : { y: 16, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full"
    >
      <Card accent={accent.cardAccent} className="flex flex-col gap-5">
        {/* Kopfzeile: Icon-Badge + Teamname + offizieller Staffelname */}
        <div className="flex items-start gap-3">
          <IconBadge icon={Trophy} accent={accent.cardAccent} size="md" />
          <div>
            <h3 className="font-oswald text-xl font-semibold uppercase tracking-wide text-fcb-text">
              {team.name}
            </h3>
            <p className="mt-0.5 font-inter text-sm text-fcb-muted">{daten.ligaName}</p>
          </div>
        </div>

        {/* Ab lg zweispaltig: Tabelle braucht Breite, die Spielliste nicht */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)]">
          {/* --- Ligatabelle --- */}
          <div className="min-w-0">
            <h4 className="font-oswald text-sm font-semibold uppercase tracking-wide text-fcb-muted">
              Tabelle
            </h4>
            {hatTabelle ? (
              // Eigener Scroll-Container: die Tabelle darf nie die Seite
              // horizontal aufreißen (Mobile-first-Regel).
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[420px] border-collapse font-inter text-sm">
                  <caption className="sr-only">
                    Tabelle der {daten.ligaName} mit {team.name}
                  </caption>
                  <thead>
                    <tr className="border-b border-fcb-border text-left text-xs uppercase tracking-wide text-fcb-muted">
                      <th scope="col" className="py-2 pr-2 font-medium">
                        <span aria-hidden>#</span>
                        <span className="sr-only">Platz</span>
                      </th>
                      <th scope="col" className="py-2 pr-2 font-medium">
                        Mannschaft
                      </th>
                      <th scope="col" className="py-2 pr-2 text-right font-medium">
                        <abbr title="Spiele" className="no-underline">Sp.</abbr>
                      </th>
                      {/* S/U/N erst ab sm – auf schmalen Screens reichen Spiele/Tore/Punkte */}
                      <th scope="col" className="hidden py-2 pr-2 text-right font-medium sm:table-cell">
                        <abbr title="Siege" className="no-underline">S</abbr>
                      </th>
                      <th scope="col" className="hidden py-2 pr-2 text-right font-medium sm:table-cell">
                        <abbr title="Unentschieden" className="no-underline">U</abbr>
                      </th>
                      <th scope="col" className="hidden py-2 pr-2 text-right font-medium sm:table-cell">
                        <abbr title="Niederlagen" className="no-underline">N</abbr>
                      </th>
                      {/* Keine Tore-Spalte: die BFV-Widget-API liefert nur die Differenz */}
                      <th scope="col" className="py-2 pr-2 text-right font-medium">
                        <abbr title="Tordifferenz" className="no-underline">Diff.</abbr>
                      </th>
                      <th scope="col" className="py-2 text-right font-medium">
                        <abbr title="Punkte" className="no-underline">Pkt.</abbr>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {daten.tabelle.map((zeile) => (
                      <tr
                        // Teamname statt Platz als Key: vor Saisonstart führt der
                        // BFV alle Teams auf Platz 1 – der Platz ist nicht eindeutig.
                        key={zeile.mannschaft}
                        // Die eigene Mannschaft wird per Tint-Fläche in
                        // Trägerfarbe hervorgehoben (Badge-/Banner-Muster).
                        className={`border-b border-fcb-border/60 last:border-b-0 ${
                          zeile.eigenesTeam
                            ? `${accent.bgSoft} font-semibold text-fcb-text`
                            : "text-fcb-text/80"
                        }`}
                      >
                        <td className={`py-2 pr-2 tabular-nums ${zeile.eigenesTeam ? accent.text : ""}`}>
                          {zeile.platz}
                        </td>
                        <td className="max-w-[180px] truncate py-2 pr-2 sm:max-w-none">
                          {zeile.mannschaft}
                        </td>
                        <td className="py-2 pr-2 text-right tabular-nums">{zeile.spiele}</td>
                        <td className="hidden py-2 pr-2 text-right tabular-nums sm:table-cell">
                          {zeile.siege}
                        </td>
                        <td className="hidden py-2 pr-2 text-right tabular-nums sm:table-cell">
                          {zeile.unentschieden}
                        </td>
                        <td className="hidden py-2 pr-2 text-right tabular-nums sm:table-cell">
                          {zeile.niederlagen}
                        </td>
                        <td className="py-2 pr-2 text-right tabular-nums">
                          {zeile.tordifferenz > 0 ? `+${zeile.tordifferenz}` : zeile.tordifferenz}
                        </td>
                        <td className="py-2 text-right font-semibold tabular-nums">
                          {zeile.punkte}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              // Vor Saisonstart liefert der BFV noch keine Tabelle – dezenter
              // Hinweis statt leerer Fläche (Anforderung „kein kaputter Bereich").
              <p className="mt-2 font-inter text-sm text-fcb-muted">
                Die Tabelle erscheint hier, sobald der erste Spieltag gespielt ist.
              </p>
            )}
          </div>

          {/* --- Nächste Spiele + letzte Ergebnisse --- */}
          <div className="min-w-0">
            <h4 className="flex items-center gap-2 font-oswald text-sm font-semibold uppercase tracking-wide text-fcb-muted">
              <CalendarDays size={16} aria-hidden />
              Nächste Spiele
            </h4>
            {hatNaechste ? (
              <ul className="mt-2">
                {daten.naechsteSpiele.map((spiel) => (
                  <SpielZeile key={`${spiel.anstoss}-${spiel.heim}`} spiel={spiel} />
                ))}
              </ul>
            ) : (
              <p className="mt-2 font-inter text-sm text-fcb-muted">
                Aktuell sind keine Spiele angesetzt.
              </p>
            )}

            {hatLetzte && (
              <>
                <h4 className="mt-5 font-oswald text-sm font-semibold uppercase tracking-wide text-fcb-muted">
                  Letzte Ergebnisse
                </h4>
                <ul className="mt-2">
                  {daten.letzteSpiele.map((spiel) => (
                    <SpielZeile key={`${spiel.anstoss}-${spiel.heim}`} spiel={spiel} />
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* Quellenangabe + Datenstand – Pflichtteil, weil die Daten extern sind */}
        <p className="border-t border-fcb-border pt-3 font-inter text-xs text-fcb-muted">
          Quelle:{" "}
          <a
            href={daten.quelleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline-offset-2 hover:underline ${accent.text}`}
          >
            Bayerischer Fußball-Verband
          </a>{" "}
          · Stand: {formatStand(daten.abgerufenAm)}
        </p>
      </Card>
    </motion.article>
  );
}
