import { SupabaseClient } from "@supabase/supabase-js";
import type { EventInput } from "@fullcalendar/core";
import type { Buchung } from "@/components/BearbeitenModal";

export async function fetchEvents(supabase: SupabaseClient, setEvents: (events: EventInput[]) => void) {
  const { data, error } = await supabase.from("buchungen").select("*");

  if (error) {
    console.error("Fehler beim Laden der Buchungen:", error);
    return;
  }

  const formatted = data.map((buchung: Buchung) => ({
    // Klartext-Titel als Fallback (a11y) – die sichtbare Darstellung übernimmt
    // EventChip via eventContent, inkl. Platz-Farbe als Tint + Akzentkante.
    title: `${capitalize(buchung.anlass)} – ${buchung.mannschaft}`,
    start: buchung.startzeit,
    end: buchung.endzeit,
    // FullCalendar-eigene Flächen/Rahmen neutralisieren, der Chip stylt sich selbst
    backgroundColor: "transparent",
    borderColor: "transparent",
    extendedProps: buchung,
    id: buchung.id,
  }));

  setEvents(formatted);
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
