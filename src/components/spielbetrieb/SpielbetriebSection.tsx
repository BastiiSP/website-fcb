import SpielbetriebExplorer, {
  type SpielbetriebEintrag,
} from "@/components/spielbetrieb/SpielbetriebExplorer";
import Banner from "@/components/ui/Banner";
import { getTeamsFuerTraeger } from "@/lib/teams";
import { getSpielbetrieb } from "@/lib/bfv";
import { getTenant } from "@/lib/tenant.server";

// Spielbetriebs-Abschnitt für /mannschaften (Server Component):
// lädt die BFV-Daten aller Mannschaften (null für unkonfigurierte/fehlende)
// und übergibt sie dem Explorer, in dem FCB-Besucher erst Mannschaft wählen.
// Datengetrieben über TEAMS × BFV_TEAMS (src/lib/bfv.ts) – ein Jugend-Team
// bekommt seine Daten automatisch, sobald dort ein Konfig-Eintrag existiert.
//
// Multi-Tenant: Auf der JFG-Domain zeigen wir bewusst KEINEN Explorer (der
// würde ohnehin nur "keine Daten"-Hinweise anzeigen, da für die A-D-Junioren
// aktuell kein BFV_TEAMS-Eintrag existiert), sondern einen transparenten
// Hinweis, dass die Tabellen noch fehlen – statt den Abschnitt kommentarlos
// verschwinden zu lassen. Sobald BFV_TEAMS JFG-Einträge bekommt, kann hier
// wieder der volle Explorer laufen.

export default async function SpielbetriebSection() {
  const tenant = await getTenant();

  if (tenant === "jfg") {
    return (
      <section aria-labelledby="spielbetrieb-heading" className="mt-12">
        <div className="mb-5">
          <div className="flex items-center gap-3">
            <span aria-hidden className="h-6 w-1 rounded-full bg-fcb-accent" />
            <h2
              id="spielbetrieb-heading"
              className="font-oswald text-2xl font-semibold uppercase tracking-wide text-fcb-text"
            >
              Tabelle &amp; Spiele
            </h2>
          </div>
        </div>
        <Banner
          variant="info"
          message="Der Bayerische Fußball-Verband stellt für unsere Jugendmannschaften noch keine öffentlichen Tabellendaten bereit. Sobald das der Fall ist, siehst du hier Tabelle und Spielplan – wie schon beim FCB."
        />
      </section>
    );
  }

  // Alle Teams parallel anfragen – getSpielbetrieb liefert null für
  // unkonfigurierte Teams und bei Abruf-Fehlern (wirft nie). Nur die
  // eigenen (FCB-)Teams, keine fremden Trägerdaten mehr auf dieser Domain.
  const eintraege: SpielbetriebEintrag[] = await Promise.all(
    getTeamsFuerTraeger("fcb").map(async (team) => ({
      team,
      daten: await getSpielbetrieb(team.id),
    })),
  );

  return (
    <section aria-labelledby="spielbetrieb-heading">
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
          Mannschaft wählen – offizielle Daten des Bayerischen
          Fußball-Verbands, stündlich aktualisiert.
        </p>
      </div>

      <SpielbetriebExplorer eintraege={eintraege} />
    </section>
  );
}
