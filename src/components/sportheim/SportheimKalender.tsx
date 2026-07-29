"use client";

import { useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventInput } from "@fullcalendar/core";
import { format } from "date-fns";
import { de } from "date-fns/locale";

import KalenderToolbar, {
  type KalenderAnsicht,
} from "@/components/kalender/KalenderToolbar";
import { SPORTHEIM_FARBEN } from "@/lib/sportheim";
import { hexZuRgba } from "@/utils/getEventColor";

/** Anzeige-Kategorien der Sportheim-Belegung. */
export type SportheimEventArt = "belegt" | "gesperrt" | "heimspiel";

/** extendedProps der Sportheim-Events – bewusst ohne personenbezogene Daten. */
export interface SportheimEventProps {
  art: SportheimEventArt;
  /** Erste Chip-Zeile, z. B. "Belegt" oder "Heimspiel 1. Mannschaft" */
  label: string;
  /** Optionale zweite Chip-Zeile, z. B. "15:00 · gegen SV Beispiel" */
  detail?: string;
}

// Farbe je Kategorie: Heimspiele blau (FCB-Akzent), alles andere rot (nicht verfügbar)
function eventFarbe(art: SportheimEventArt): string {
  return art === "heimspiel" ? SPORTHEIM_FARBEN.heimspiel : SPORTHEIM_FARBEN.belegt;
}

/** Legende über dem Kalender – gleiche Farbquelle wie die Event-Chips. */
const LEGENDE: { art: SportheimEventArt; label: string }[] = [
  { art: "belegt", label: "Belegt / gesperrt" },
  { art: "heimspiel", label: "Heimspiel" },
];

interface Props {
  events: EventInput[];
  /** Klick auf einen Tag/Zeitpunkt – die Seite füllt damit das Anfrageformular vor. */
  onTagKlick?: (datum: Date) => void;
}

/**
 * Öffentlicher Belegungskalender des Sportheims – gleiches Erscheinungsbild wie
 * der Platzbuchungskalender (eigene Toolbar, Chip-Events), aber rein lesend:
 * kein Drag/Resize, keine Tooltips mit Details, da bewusst keine
 * personenbezogenen Daten angezeigt werden.
 */
export default function SportheimKalender({ events, onTagKlick }: Props) {
  const kalenderRef = useRef<FullCalendar | null>(null);
  const [titel, setTitel] = useState("");
  // Monat als Default: Sportheim-Vermietung ist tagesbasiert, nicht stundenbasiert
  const [ansicht, setAnsicht] = useState<KalenderAnsicht>("dayGridMonth");

  const api = () => kalenderRef.current?.getApi();

  return (
    <div className="rounded-2xl border border-fcb-border bg-fcb-surface p-3 sm:p-5">
      {/* Legende: erklärt die zwei Farbkategorien ohne Tooltip-Interaktion */}
      <div className="mb-3 flex flex-wrap gap-2">
        {LEGENDE.map(({ art, label }) => (
          <span
            key={art}
            className="inline-flex items-center gap-2 rounded-full border border-fcb-border bg-fcb-bg px-3 py-1 font-inter text-sm font-medium text-fcb-text"
          >
            <span
              className="inline-block h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: eventFarbe(art) }}
            />
            {label}
          </span>
        ))}
      </div>

      <KalenderToolbar
        titel={titel}
        ansicht={ansicht}
        onHeute={() => api()?.today()}
        onZurueck={() => api()?.prev()}
        onWeiter={() => api()?.next()}
        onAnsichtWechsel={(neueAnsicht) => api()?.changeView(neueAnsicht)}
      />

      <FullCalendar
        ref={kalenderRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="de"
        firstDay={1}
        headerToolbar={false}
        datesSet={(arg) => {
          setTitel(arg.view.title);
          setAnsicht(arg.view.type as KalenderAnsicht);
        }}
        // Abendveranstaltungen: Zeitraster bis Mitternacht statt 22:30 wie beim Platz
        slotMinTime="08:00:00"
        slotMaxTime="24:00:00"
        // Alle Events (auch Heimspiele) sind Zeitfenster → keine All-Day-Zeile
        allDaySlot={false}
        height="auto"
        editable={false}
        nowIndicator={true}
        events={events}
        dateClick={(info) => onTagKlick?.(info.date)}
        // Spaltenkopf im Outlook-Stil – identisch zum Platzbuchungskalender
        dayHeaderContent={(arg) => {
          if (arg.view.type === "dayGridMonth") {
            return (
              <span className="font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted">
                {format(arg.date, "EEEEEE", { locale: de })}
              </span>
            );
          }
          return (
            <div className="flex flex-col items-center gap-0.5 py-1">
              <span className="font-inter text-[11px] font-medium uppercase tracking-wider text-fcb-muted">
                {format(arg.date, "EEEEEE", { locale: de })}
              </span>
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full font-inter text-sm font-semibold ${
                  arg.isToday ? "bg-fcb-accent text-white" : "text-fcb-text"
                }`}
              >
                {format(arg.date, "d")}
              </span>
            </div>
          );
        }}
        eventContent={(arg) => {
          const props = arg.event.extendedProps as SportheimEventProps;
          const farbe = eventFarbe(props.art);
          const kompakt = arg.view.type === "dayGridMonth";

          // Monatsansicht: einzeilig mit Farbpunkt (wenig Platz pro Zelle)
          if (kompakt) {
            return (
              <div className="flex w-full items-center gap-1.5 overflow-hidden rounded px-1 py-0.5">
                <span
                  className="inline-block h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: farbe }}
                />
                <span className="truncate font-inter text-[11px] font-medium text-fcb-text">
                  {props.label}
                </span>
              </div>
            );
          }

          // Wochen-/Tagesansicht: Tint-Chip mit Akzentkante (Outlook-Muster)
          return (
            <div
              className="flex h-full w-full flex-col overflow-hidden rounded-md px-1.5 py-1"
              style={{
                backgroundColor: hexZuRgba(farbe, 0.16),
                borderLeft: `3px solid ${farbe}`,
              }}
            >
              <span className="truncate font-inter text-[11px] font-semibold leading-tight text-fcb-text">
                {props.label}
              </span>
              {props.detail && (
                <span className="truncate font-inter text-[11px] leading-tight text-fcb-muted">
                  {props.detail}
                </span>
              )}
            </div>
          );
        }}
      />
    </div>
  );
}
