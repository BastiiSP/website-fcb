import { getEventColor } from "./getEventColor";
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
    title: `⚽ ${buchung.anlass === "freundschaftsspiel" ? "Freundschaftsspiel" : capitalize(buchung.anlass)}\n👥 ${buchung.mannschaft}`,
    start: buchung.startzeit,
    end: buchung.endzeit,
    backgroundColor: getEventColor(buchung.platz),
    extendedProps: buchung,
    id: buchung.id,
  }));

  setEvents(formatted);
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
