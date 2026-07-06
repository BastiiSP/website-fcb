"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Users } from "lucide-react";
import Card from "@/components/ui/Card";
import IconBadge from "@/components/ui/IconBadge";
import { getTeamAccent, TRAEGER_INFO, type Team } from "@/lib/teams";

// Wiederverwendbare Mannschafts-Card (Design-Spec „Mannschaftsdarstellung"):
// Akzentkante + Icon-Badge + Träger-Badge in Trägerfarbe (FCB blau / JFG rot),
// darunter Name, Altersklasse/Liga, optionale Beschreibung und Trainer-Slot.
// Mobile-first: volle Breite, ab sm im Grid nutzbar (h-full füllt Grid-Zellen).

interface TeamCardProps {
  team: Team;
  /**
   * Optionaler freier Inhalt im Trainer-Bereich (z. B. Kontakt-Link).
   * Ergänzt bzw. ersetzt die Namen aus `team.trainer`.
   */
  trainerSlot?: React.ReactNode;
  className?: string;
}

export default function TeamCard({ team, trainerSlot, className = "" }: TeamCardProps) {
  const accent = getTeamAccent(team.traeger);
  const traeger = TRAEGER_INFO[team.traeger];
  // Nutzer mit „Bewegung reduzieren" bekommen die Card ohne Einblende-Animation.
  const reduceMotion = useReducedMotion();

  const trainerNamen = team.trainer ?? [];
  const meta = [team.altersklasse, team.liga].filter(Boolean).join(" · ");

  return (
    <motion.article
      // Dezente Einblendung beim Scrollen – identisch zum Homepage-Muster
      // (y 16 → 0, einmalig). initial={false} deaktiviert sie bei Reduced Motion.
      initial={reduceMotion ? false : { y: 16, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`w-full ${className}`}
    >
      <Card interactive accent={accent.cardAccent} className="flex h-full flex-col gap-4">
        {/* Kopfzeile: Icon-Badge links, Träger-Badge (FCB/JFG) rechts */}
        <div className="flex items-start justify-between gap-3">
          <IconBadge icon={Users} accent={accent.cardAccent} size="md" />
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-inter text-xs font-medium ${accent.badge}`}
            title={traeger.name}
          >
            {traeger.label}
            {/* Voller Vereinsname für Screenreader – das Kürzel allein ist nicht selbsterklärend */}
            <span className="sr-only"> – {traeger.name}</span>
          </span>
        </div>

        {/* Teamname + Meta (Altersklasse/Liga) */}
        <div>
          <h3 className="font-oswald text-xl font-semibold uppercase tracking-wide text-fcb-text">
            {team.name}
          </h3>
          {meta && <p className="mt-1 font-inter text-sm text-fcb-muted">{meta}</p>}
        </div>

        {team.beschreibung && (
          <p className="font-inter text-sm leading-relaxed text-fcb-text/80">
            {team.beschreibung}
          </p>
        )}

        {/* Trainer-Bereich: mt-auto drückt ihn im Grid an die Card-Unterkante,
            damit die Trennlinien über eine Zeile hinweg bündig sind. */}
        {(trainerNamen.length > 0 || trainerSlot) && (
          <div className="mt-auto border-t border-fcb-border pt-3">
            {trainerNamen.length > 0 && (
              <p className="font-inter text-sm text-fcb-muted">
                <span className={`font-medium ${accent.text}`}>Trainer:</span>{" "}
                <span className="text-fcb-text">{trainerNamen.join(", ")}</span>
              </p>
            )}
            {trainerSlot}
          </div>
        )}
      </Card>
    </motion.article>
  );
}
