"use client";

import { format } from "date-fns";
import { de } from "date-fns/locale";
import type { Buchung } from "@/components/BearbeitenModal";
import { getEventColor, hexZuRgba } from "@/utils/getEventColor";
import { ANLASS_LABEL } from "@/lib/buchungsOptionen";

interface Props {
  buchung: Buchung;
  start: Date | null;
  end: Date | null;
  /** true in der Monatsansicht: einzeilige Kompakt-Darstellung */
  kompakt?: boolean;
}

/**
 * Event-Darstellung im Outlook/Teams-Stil: dezente Farbfläche (Tint) mit
 * kräftiger Akzentkante links statt vollflächig gesättigter Blöcke.
 * Textfarbe kommt aus den Theme-Tokens → lesbar in beiden Themes.
 */
export default function EventChip({ buchung, start, end, kompakt = false }: Props) {
  const farbe = getEventColor(buchung.platz);
  const zeit =
    start && end
      ? `${format(start, "HH:mm", { locale: de })} – ${format(end, "HH:mm", { locale: de })}`
      : "";

  // Monatsansicht: wenig Platz pro Zelle → eine Zeile mit Farbpunkt
  if (kompakt) {
    return (
      <div className="flex w-full items-center gap-1.5 overflow-hidden rounded px-1 py-0.5 cursor-pointer">
        <span
          className="inline-block h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: farbe }}
        />
        {start && (
          <span className="font-inter text-[11px] font-semibold text-fcb-text shrink-0">
            {format(start, "HH:mm", { locale: de })}
          </span>
        )}
        <span className="truncate font-inter text-[11px] text-fcb-text/90">
          {buchung.mannschaft}
        </span>
      </div>
    );
  }

  // Wochen-/Tagesansicht: Chip füllt den Event-Harness komplett aus
  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden rounded-md px-1.5 py-1 cursor-pointer transition-shadow hover:shadow-md"
      style={{
        backgroundColor: hexZuRgba(farbe, 0.16),
        borderLeft: `3px solid ${farbe}`,
      }}
    >
      <span className="font-inter text-[11px] font-semibold leading-tight text-fcb-text">
        {zeit}
      </span>
      <span className="truncate font-inter text-[11px] font-medium leading-tight text-fcb-text">
        {buchung.mannschaft}
      </span>
      <span className="truncate font-inter text-[11px] leading-tight text-fcb-muted">
        {ANLASS_LABEL[buchung.anlass] ?? buchung.anlass}
      </span>
    </div>
  );
}
