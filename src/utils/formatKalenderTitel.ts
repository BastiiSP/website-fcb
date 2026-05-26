import type { Buchung } from "@/components/BearbeitenModal";

export function formatKalenderTitel(buchung: Buchung): string {
    const anlass = buchung.anlass?.toLowerCase();
    const platz = buchung.platz?.toLowerCase();
  
    const anlassTitel =
      anlass === "freundschaftsspiel"
        ? "Freundschaftsspiel"
        : anlass === "punktspiel"
        ? "Punktspiel"
        : anlass?.charAt(0).toUpperCase() + anlass?.slice(1);
  
    const platzTitel = platz?.charAt(0).toUpperCase() + platz?.slice(1);
  
    return `${anlassTitel} · ${buchung.mannschaft} · ${platzTitel} (${buchung.platzanteil}) · ${buchung.buchende_person}`;
  }
  