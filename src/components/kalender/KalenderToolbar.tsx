"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";

/** Die drei angebotenen FullCalendar-Ansichten (Monat/Woche/Tag) */
export type KalenderAnsicht = "dayGridMonth" | "timeGridWeek" | "timeGridDay";

const ANSICHTEN: { id: KalenderAnsicht; label: string }[] = [
  { id: "dayGridMonth", label: "Monat" },
  { id: "timeGridWeek", label: "Woche" },
  { id: "timeGridDay", label: "Tag" },
];

interface Props {
  /** Aktueller Zeitraum-Titel aus FullCalendar (z. B. "7.–13. Juli 2026") */
  titel: string;
  ansicht: KalenderAnsicht;
  onHeute: () => void;
  onZurueck: () => void;
  onWeiter: () => void;
  onAnsichtWechsel: (ansicht: KalenderAnsicht) => void;
}

/**
 * Eigene Kalender-Toolbar im Outlook/Teams-Stil: ersetzt die eingebaute
 * FullCalendar-headerToolbar, damit Navigation und Ansichtswahl dieselben
 * Design-Tokens und Primitive nutzen wie der Rest der Seite.
 */
export default function KalenderToolbar({
  titel,
  ansicht,
  onHeute,
  onZurueck,
  onWeiter,
  onAnsichtWechsel,
}: Props) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      {/* Navigation: Heute + Vor/Zurück */}
      <div className="flex items-center gap-1.5">
        <Button variant="secondary" size="sm" onClick={onHeute}>
          Heute
        </Button>
        <button
          type="button"
          onClick={onZurueck}
          aria-label="Vorheriger Zeitraum"
          className="p-1.5 rounded-lg text-fcb-muted hover:text-fcb-text hover:bg-fcb-border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          onClick={onWeiter}
          aria-label="Nächster Zeitraum"
          className="p-1.5 rounded-lg text-fcb-muted hover:text-fcb-text hover:bg-fcb-border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Zeitraum-Titel – wächst und schiebt den Ansichts-Umschalter nach rechts */}
      <h2 className="flex-1 min-w-[180px] font-oswald text-lg font-semibold uppercase tracking-wide text-fcb-text">
        {titel}
      </h2>

      {/* Ansichts-Umschalter als Segmented Control (Muster wie Platzwahl im Buchungsformular) */}
      <div
        role="radiogroup"
        aria-label="Kalenderansicht"
        className="inline-flex rounded-lg border border-fcb-border overflow-hidden"
      >
        {ANSICHTEN.map(({ id, label }) => {
          const aktiv = ansicht === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={aktiv}
              onClick={() => onAnsichtWechsel(id)}
              className={`px-3 py-1.5 font-inter text-sm font-medium transition-colors border-r last:border-r-0 border-fcb-border focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fcb-blue ${
                aktiv
                  ? "bg-fcb-blue text-white"
                  : "bg-fcb-bg text-fcb-text hover:bg-fcb-surface"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
