"use client";

import { useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventInput } from "@fullcalendar/core";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { format } from "date-fns";
import { de } from "date-fns/locale";

import KalenderToolbar, {
  type KalenderAnsicht,
} from "@/components/kalender/KalenderToolbar";
import {
  SPORTHEIM_KATEGORIEN,
  type SportheimEventArt,
} from "@/lib/sportheim";
import { hexZuRgba } from "@/utils/getEventColor";

/** extendedProps der Sportheim-Events – bewusst ohne personenbezogene Daten. */
export interface SportheimEventProps {
  art: SportheimEventArt;
  /** Erste Chip-Zeile, z. B. "Belegt" oder "1. Mannschaft" */
  label: string;
  /** Optionale zweite Chip-Zeile, z. B. "15:00 · gegen SV Beispiel" */
  detail?: string;
}

/** Legende über dem Kalender – gleiche Farbquelle wie die Event-Chips. */
const LEGENDE: SportheimEventArt[] = [
  "heimspiel-fcb",
  "heimspiel-jfg",
  "buchung",
];

interface Props {
  events: EventInput[];
  /** Klick auf einen Tag/Zeitpunkt – die Seite füllt damit das Anfrageformular vor. */
  onTagKlick?: (datum: Date) => void;
}

/**
 * Öffentlicher Belegungskalender des Sportheims – gleiches Erscheinungsbild wie
 * der Platzbuchungskalender (eigene Toolbar, Chip-Events), aber rein lesend:
 * kein Drag/Resize. Das informative Popover zeigt ausschließlich label/detail
 * aus den extendedProps und weiterhin keine personenbezogenen Daten.
 */
export default function SportheimKalender({ events, onTagKlick }: Props) {
  const kalenderRef = useRef<FullCalendar | null>(null);
  const [titel, setTitel] = useState("");
  // Monat als Default: Sportheim-Vermietung ist tagesbasiert, nicht stundenbasiert
  const [ansicht, setAnsicht] = useState<KalenderAnsicht>("dayGridMonth");

  const api = () => kalenderRef.current?.getApi();

  return (
    <div className="rounded-2xl border border-fcb-border bg-fcb-surface p-3 sm:p-5">
      {/* Textlabels machen die Bedeutung auch ohne Farbwahrnehmung eindeutig. */}
      <ul
        className="mb-3 flex flex-wrap gap-2"
        aria-label="Kategorien im Belegungskalender"
      >
        {LEGENDE.map((art) => {
          const kategorie = SPORTHEIM_KATEGORIEN[art];
          return (
            <li
              key={art}
              className="inline-flex items-center gap-2 rounded-full border border-fcb-border bg-fcb-bg px-3 py-1 font-inter text-sm font-medium text-fcb-text"
            >
              <span
                className="inline-block h-4 w-1 shrink-0 rounded-full"
                style={{ backgroundColor: kategorie.farbe }}
                aria-hidden
              />
              {kategorie.label}
            </li>
          );
        })}
      </ul>

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
          const kategorie = SPORTHEIM_KATEGORIEN[props.art];
          const farbe = kategorie.farbe;
          const kompakt = arg.view.type === "dayGridMonth";

          const chip = kompakt ? (
            // Auch mobil bleibt das Outlook-Muster aus Tint + Kante erhalten;
            // das Kurzlabel ergänzt die Farbe für Menschen mit Farbfehlsicht.
            <div
              className="flex w-full items-center gap-1 overflow-hidden rounded px-1 py-0.5"
              style={{
                backgroundColor: hexZuRgba(farbe, 0.16),
                borderLeft: `3px solid ${farbe}`,
              }}
            >
              <span
                className="shrink-0 rounded-sm bg-fcb-bg/80 px-1 font-inter text-[9px] font-bold uppercase leading-4 text-fcb-text"
              >
                {kategorie.kurzlabel}
              </span>
              <span className="truncate font-inter text-[11px] font-medium text-fcb-text">
                {props.label}
              </span>
            </div>
          ) : (
            // Wochen-/Tagesansicht: Tint-Chip mit Akzentkante (Outlook-Muster)
            <div
              className="flex h-full w-full flex-col overflow-hidden rounded-md px-1.5 py-1"
              style={{
                backgroundColor: hexZuRgba(farbe, 0.16),
                borderLeft: `3px solid ${farbe}`,
              }}
            >
              <span className="truncate font-inter text-[11px] font-semibold leading-tight text-fcb-text">
                <span className="mr-1 uppercase">{kategorie.kurzlabel}</span>
                {props.label}
              </span>
              {props.detail && (
                <span className="truncate font-inter text-[11px] leading-tight text-fcb-muted">
                  {props.detail}
                </span>
              )}
            </div>
          );

          // Der Inhalt ist rein informativ: Uncontrolled Tippy deckt Hover,
          // Tastaturfokus und Touch ab, ohne den Kalender-Klick umzuleiten.
          return (
            <Tippy
              content={
                <div className="font-inter">
                  <div className="font-semibold">{kategorie.label}</div>
                  <div className="mt-1">{props.label}</div>
                  {props.detail && <div className="mt-1">{props.detail}</div>}
                </div>
              }
              theme="custom"
              placement="top"
              appendTo={document.body}
              zIndex={9999}
            >
              <div
                className="h-full w-full rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue"
                tabIndex={0}
                aria-label={`${kategorie.label}: ${props.label}${props.detail ? `. ${props.detail}` : ""}`}
              >
                {chip}
              </div>
            </Tippy>
          );
        }}
      />
    </div>
  );
}
