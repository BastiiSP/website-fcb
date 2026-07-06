import SpielbetriebCard from "@/components/spielbetrieb/SpielbetriebCard";
import { TEAMS, type Team } from "@/lib/teams";
import { getSpielbetrieb } from "@/lib/bfv";
import type { SpielbetriebDaten } from "@/lib/bfvTypes";

// Spielbetriebs-Abschnitt für /mannschaften (Server Component):
// zeigt Tabelle + Spiele aller Mannschaften, für die BFV-Daten konfiguriert
// und abrufbar sind. Datengetrieben über TEAMS × BFV_TEAMS (src/lib/bfv.ts) –
// ein weiteres Team erscheint automatisch, sobald dort ein Konfig-Eintrag
// existiert; Teams ohne Daten (aktuell die gesamte Jugend) tauchen hier
// schlicht nicht auf. Liefert der BFV gar nichts (z. B. Quelle down),
// rendert der Abschnitt überhaupt nicht – nie ein leerer/kaputter Bereich.

interface Eintrag {
  team: Team;
  daten: SpielbetriebDaten;
}

export default async function SpielbetriebSection() {
  // Alle Teams parallel anfragen – getSpielbetrieb liefert null für
  // unkonfigurierte Teams und bei Abruf-Fehlern (wirft nie).
  const ergebnisse = await Promise.all(
    TEAMS.map(async (team) => ({ team, daten: await getSpielbetrieb(team.id) })),
  );
  const eintraege = ergebnisse.filter((e): e is Eintrag => e.daten !== null);

  if (eintraege.length === 0) return null;

  return (
    <section aria-labelledby="spielbetrieb-heading">
      {/* Zwischenüberschrift im Muster der Träger-Headings der Seite */}
      <div className="mb-5 mt-12">
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-6 w-1 rounded-full bg-fcb-blue" />
          <h2
            id="spielbetrieb-heading"
            className="font-oswald text-2xl font-semibold uppercase tracking-wide text-fcb-text"
          >
            Tabelle &amp; Spiele
          </h2>
        </div>
        <p className="mt-1 pl-4 font-inter text-sm text-fcb-muted">
          Offizielle Daten des Bayerischen Fußball-Verbands, stündlich aktualisiert.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {eintraege.map(({ team, daten }) => (
          <SpielbetriebCard key={team.id} team={team} daten={daten} />
        ))}
      </div>
    </section>
  );
}
