import SpielbetriebExplorer, {
  type SpielbetriebEintrag,
} from "@/components/spielbetrieb/SpielbetriebExplorer";
import { TEAMS } from "@/lib/teams";
import { getSpielbetrieb } from "@/lib/bfv";
import { getTenant } from "@/lib/tenant.server";

// Spielbetriebs-Abschnitt für /mannschaften (Server Component):
// lädt die BFV-Daten aller Mannschaften (null für unkonfigurierte/fehlende)
// und übergibt sie dem Explorer, in dem Besucher erst Verein (FCB/JFG) und
// dann Mannschaft wählen. Datengetrieben über TEAMS × BFV_TEAMS
// (src/lib/bfv.ts) – ein Jugend-Team bekommt seine Daten automatisch,
// sobald dort ein Konfig-Eintrag existiert; bis dahin zeigt die Auswahl
// einen dezenten Hinweis statt eines leeren Bereichs.
//
// Multi-Tenant: Der Abschnitt gehört zum FCB-Auftritt. Auf dem JFG-Auftritt
// wird er gar nicht gerendert – zwei Gründe:
//   1. Der Explorer beginnt mit der Vereinsauswahl FCB/JFG und würde dort die
//      FCB-Herren samt Tabelle anbieten, also fremde Inhalte auf der
//      JFG-Domain zeigen (Default-Auswahl ist sogar die 1. Mannschaft).
//   2. Für die JFG-Jugendteams ist in BFV_TEAMS keine Mannschaft konfiguriert,
//      es gäbe also ausschließlich „keine Daten"-Hinweise.
// Sobald BFV_TEAMS Jugend-Einträge enthält, kann hier ein eigener
// JFG-Zweig ergänzt werden (dann ohne Vereinsauswahl).

export default async function SpielbetriebSection() {
  const tenant = await getTenant();
  if (tenant !== "fcb") return null;

  // Alle Teams parallel anfragen – getSpielbetrieb liefert null für
  // unkonfigurierte Teams und bei Abruf-Fehlern (wirft nie).
  const eintraege: SpielbetriebEintrag[] = await Promise.all(
    TEAMS.map(async (team) => ({ team, daten: await getSpielbetrieb(team.id) })),
  );

  return (
    <section aria-labelledby="spielbetrieb-heading">
      {/* Zwischenüberschrift im Muster der Träger-Headings der Seite */}
      <div className="mb-5 mt-12">
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-6 w-1 rounded-full bg-fcb-accent" />
          <h2
            id="spielbetrieb-heading"
            className="font-oswald text-2xl font-semibold uppercase tracking-wide text-fcb-text"
          >
            Tabelle &amp; Spiele
          </h2>
        </div>
        <p className="mt-1 pl-4 font-inter text-sm text-fcb-muted">
          Verein und Mannschaft wählen – offizielle Daten des Bayerischen
          Fußball-Verbands, stündlich aktualisiert.
        </p>
      </div>

      <SpielbetriebExplorer eintraege={eintraege} />
    </section>
  );
}
