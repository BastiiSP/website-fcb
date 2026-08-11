"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Banner from "@/components/ui/Banner";
import SpielbetriebCard from "@/components/spielbetrieb/SpielbetriebCard";
import {
  getTeamAccent,
  TRAEGER_INFO,
  type Team,
  type Traeger,
} from "@/lib/teams";
import type { SpielbetriebErgebnis } from "@/lib/bfv";

// Zweistufige Auswahl für den Spielbetrieb: erst Verein (FCB/JFG), dann
// Altersklasse – erst danach erscheint die Daten-Card. Altersklassen mit zwei
// BFV-Mannschaften erhalten eine zusätzliche, klar beschriftete Unterauswahl.
// Mannschaften ohne Daten zeigen einen dezenten Info-Banner statt einer Card.

/** Ein Team samt seiner (evtl. fehlenden) BFV-Daten – kommt aus der Server-Sektion. */
export interface SpielbetriebEintrag {
  team: Team;
  daten: SpielbetriebErgebnis;
  /**
   * BFV-Name der Mannschaft – nur bei Altersklassen mit genau einem Team
   * gesetzt; Mehrfachteams tragen ihn im Datenpaket. Die Card zeigt damit
   * durchgängig den BFV-Namen (z. B. "JFG Kunstadt-Obermain C"), während die
   * Auswahl-Buttons bei der Altersklasse bleiben.
   */
  anzeigename?: string;
}

interface SpielbetriebExplorerProps {
  eintraege: SpielbetriebEintrag[];
}

export default function SpielbetriebExplorer({ eintraege }: SpielbetriebExplorerProps) {
  const reduceMotion = useReducedMotion();

  /** Erstes Team eines Trägers – Default nach Vereinswechsel. */
  const erstesTeam = (traeger: Traeger): string =>
    eintraege.find((e) => e.team.traeger === traeger)?.team.id ?? "";

  // Welche Träger tatsächlich in den übergebenen Einträgen vorkommen. Seit
  // jede Marken-Domain nur noch ihre eigenen Teams übergibt (kein
  // trägerübergreifender Explorer mehr, siehe SpielbetriebSection), ist das
  // in der Praxis genau einer – Stufe 1 (Vereinswahl) macht dann keinen Sinn
  // und wird übersprungen. Der Code bleibt trotzdem mehrträgerfähig, falls
  // sich das später wieder ändert.
  const vorhandeneTraeger = Array.from(new Set(eintraege.map((e) => e.team.traeger)));
  const startTraeger = vorhandeneTraeger[0] ?? "fcb";

  const [traeger, setTraeger] = useState<Traeger>(startTraeger);
  const [teamId, setTeamId] = useState<string>(() => erstesTeam(startTraeger));
  const [bfvTeamIndex, setBfvTeamIndex] = useState(0);

  const teamsDesTraegers = eintraege.filter((e) => e.team.traeger === traeger);
  const auswahl = eintraege.find((e) => e.team.id === teamId);
  const accent = getTeamAccent(traeger);
  const mehrfachTeams =
    auswahl && Array.isArray(auswahl.daten) ? auswahl.daten : null;
  const mehrfachAuswahl =
    mehrfachTeams?.[bfvTeamIndex] ?? mehrfachTeams?.[0] ?? null;
  const aktiveDaten = mehrfachTeams
    ? mehrfachAuswahl?.daten ?? null
    : auswahl?.daten ?? null;
  const kartenTitel = mehrfachAuswahl?.anzeigename ?? auswahl?.anzeigename;

  // Vereinswechsel wählt automatisch die erste Mannschaft des Trägers,
  // damit nie eine Mannschaft des anderen Vereins "aktiv" hängen bleibt.
  const wechsleTraeger = (neu: Traeger) => {
    if (neu === traeger) return;
    setTraeger(neu);
    setTeamId(erstesTeam(neu));
    setBfvTeamIndex(0);
  };

  // Beim Wechsel der Altersklasse beginnt eine mögliche Unterauswahl immer
  // beim ersten BFV-Team, damit kein Index der vorherigen Gruppe hängen bleibt.
  const wechsleTeam = (neu: string) => {
    setTeamId(neu);
    setBfvTeamIndex(0);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Stufe 1: Verein wählen – nur bei mehr als einem Träger relevant.
          Zwei gleichwertige Flächen, mobile untereinander. */}
      {vorhandeneTraeger.length > 1 && (
      <div role="group" aria-label="Verein wählen" className="grid gap-3 sm:grid-cols-2">
        {vorhandeneTraeger.map((t) => {
          const info = TRAEGER_INFO[t];
          const aktiv = t === traeger;
          const a = getTeamAccent(t);
          return (
            <button
              key={t}
              type="button"
              aria-pressed={aktiv}
              onClick={() => wechsleTraeger(t)}
              // Aktiv = Tint-Fläche + Akzent-Border (Badge-Muster), inaktiv =
              // neutrale Surface mit Hover zum Akzent – analog Card-Affordanz.
              // Volle Klassen-Literale (Tailwind-Scanner) – kein String-Bau.
              className={`rounded-lg border p-4 text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-accent ${
                aktiv
                  ? `${a.border} ${a.bgSoft}`
                  : t === "fcb"
                    ? "border-fcb-border bg-fcb-surface hover:border-fcb-accent/40"
                    : "border-fcb-border bg-fcb-surface hover:border-fcb-red/40"
              }`}
            >
              <span className={`font-inter text-xs font-medium uppercase tracking-wide ${aktiv ? a.text : "text-fcb-muted"}`}>
                {info.label}
              </span>
              <span className="mt-0.5 block font-oswald text-lg font-semibold uppercase tracking-wide text-fcb-text">
                {info.name}
              </span>
            </button>
          );
        })}
      </div>
      )}

      {/* Stufe 2: Mannschaft des gewählten Vereins – Pill-Leiste, umbruchfähig */}
      <div role="group" aria-label="Mannschaft wählen" className="flex flex-wrap gap-2">
        {teamsDesTraegers.map(({ team }) => {
          const aktiv = team.id === teamId;
          return (
            <button
              key={team.id}
              type="button"
              aria-pressed={aktiv}
              onClick={() => wechsleTeam(team.id)}
              // Volle Klassen-Literale (Tailwind-Scanner) – kein String-Bau.
              className={`rounded-full border px-3.5 py-1.5 font-inter text-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-accent ${
                aktiv
                  ? `${accent.badge} font-medium`
                  : traeger === "fcb"
                    ? "border-fcb-border text-fcb-muted hover:border-fcb-accent/40 hover:text-fcb-text"
                    : "border-fcb-border text-fcb-muted hover:border-fcb-red/40 hover:text-fcb-text"
              }`}
            >
              {team.name}
            </button>
          );
        })}
      </div>

      {/* Nur Mehrfachgruppen brauchen eine dritte Auswahlstufe. Auf Mobilgeräten
          stehen die vollständigen BFV-Namen untereinander statt in einer
          horizontal scrollenden oder abgeschnittenen Leiste. */}
      {mehrfachTeams && mehrfachTeams.length > 1 && (
        <div
          role="group"
          aria-label="BFV-Mannschaft wählen"
          className="grid gap-2 sm:flex sm:flex-wrap"
        >
          {mehrfachTeams.map(({ anzeigename }, index) => {
            const aktiv = index === bfvTeamIndex;
            return (
              <button
                key={anzeigename}
                type="button"
                aria-pressed={aktiv}
                onClick={() => setBfvTeamIndex(index)}
                className={`w-full whitespace-normal rounded-full border px-3.5 py-2 text-left font-inter text-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-accent sm:w-auto sm:py-1.5 ${
                  aktiv
                    ? `${accent.badge} font-medium`
                    : traeger === "fcb"
                      ? "border-fcb-border text-fcb-muted hover:border-fcb-accent/40 hover:text-fcb-text"
                      : "border-fcb-border text-fcb-muted hover:border-fcb-red/40 hover:text-fcb-text"
                }`}
              >
                {anzeigename}
              </button>
            );
          })}
        </div>
      )}

      {/* Daten der gewählten BFV-Mannschaft – sanfter Wechsel zwischen Teams */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${teamId}-${bfvTeamIndex}`}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {auswahl &&
            (aktiveDaten && !Array.isArray(aktiveDaten) ? (
              <SpielbetriebCard
                team={auswahl.team}
                daten={aktiveDaten}
                anzeigename={kartenTitel}
              />
            ) : (
              // Auch ein einzelner fehlgeschlagener Abruf innerhalb einer
              // Mehrfachgruppe bleibt über seinen BFV-Namen nachvollziehbar.
              <Banner
                variant="info"
                message={`Für ${kartenTitel ?? `die ${auswahl.team.name}`} liegen beim BFV noch keine Spieldaten vor. Sobald der Spielplan online ist, erscheinen Tabelle und Termine hier automatisch.`}
              />
            ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
